<?php

namespace App\Http\Controllers\Web;

use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\Repositories\FlowRepositoryInterface;
use App\Domain\Flow\Services\FlowTemplates;
use App\Domain\Flow\ValueObjects\FlowConfig;
use App\Http\Controllers\Controller;
use App\Http\Requests\FlowRequest;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Twilio\Rest\Client;
use Twilio\TwiML\VoiceResponse;

class FlowController extends Controller
{
    public function __construct(
        private readonly FlowRepositoryInterface $flowRepository,
    ) {}

    public function index(Request $request): Response
    {
        $flows = FlowModel::query()
            ->where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Flows/Index', [
            'flows' => $flows,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Flows/Create', [
            'templates' => FlowTemplates::all(),
        ]);
    }

    public function store(FlowRequest $request): RedirectResponse
    {
        $templateId = $request->input('template_id');
        $configArray = null;

        if ($templateId !== null) {
            foreach (FlowTemplates::all() as $tmpl) {
                if ($tmpl['id'] === $templateId) {
                    $configArray = $tmpl['config'];
                    break;
                }
            }
        }

        if ($configArray === null) {
            $configArray = [
                'start_step' => 's1',
                'steps' => [
                    's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hello from ZeroVoice'], 'next' => 'hangup'],
                    'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                ],
            ];
        }

        $flow = new Flow(
            id: (string) Str::uuid(),
            tenantId: $request->user()->tenant_id,
            name: $request->name,
            description: $request->description,
            phoneNumber: $request->phone_number,
            config: FlowConfig::fromArray($configArray),
            isActive: $request->boolean('is_active'),
        );

        $this->flowRepository->save($flow);

        return redirect()->route('flows.index')
            ->with('success', "Flow '{$flow->name()}' created.");
    }

    public function edit(Request $request, string $id): Response
    {
        $flow = $this->flowRepository->findById($id);

        if ($flow === null || $flow->tenantId() !== $request->user()->tenant_id) {
            abort(404);
        }

        return Inertia::render('Flows/Edit', [
            'flow' => $this->toArray($flow),
        ]);
    }

    public function update(FlowRequest $request, string $id): RedirectResponse
    {
        $flow = $this->flowRepository->findById($id);

        if ($flow === null || $flow->tenantId() !== $request->user()->tenant_id) {
            abort(404);
        }

        $configData = $request->filled('config')
            ? (is_string($request->config) ? json_decode($request->config, true) : $request->config)
            : $flow->getConfig();

        $updated = new Flow(
            id: $flow->id(),
            tenantId: $flow->tenantId(),
            name: $request->name,
            description: $request->description,
            phoneNumber: $request->phone_number,
            config: FlowConfig::fromArray($configData),
            isActive: $request->boolean('is_active'),
            version: $flow->version() + ($request->filled('config') ? 1 : 0),
        );

        $this->flowRepository->save($updated);

        if ($request->header('X-Inertia')) {
            return redirect()->back()
                ->with('success', "Flow '{$updated->name()}' updated.");
        }

        return redirect()->route('flows.index')
            ->with('success', "Flow '{$updated->name()}' updated.");
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $flow = $this->flowRepository->findById($id);

        if ($flow === null || $flow->tenantId() !== $request->user()->tenant_id) {
            abort(404);
        }

        $this->flowRepository->delete($id);

        return redirect()->route('flows.index')
            ->with('success', 'Flow deleted.');
    }

    public function show(Request $request, string $id): Response
    {
        $flow = $this->flowRepository->findById($id);

        if ($flow === null || $flow->tenantId() !== $request->user()->tenant_id) {
            abort(404);
        }

        return Inertia::render('Flows/Builder', [
            'flow' => $this->toArray($flow),
        ]);
    }

    public function duplicate(Request $request, string $id): RedirectResponse
    {
        $flow = $this->flowRepository->findById($id);

        if ($flow === null || $flow->tenantId() !== $request->user()->tenant_id) {
            abort(404);
        }

        $duplicate = new Flow(
            id: (string) Str::uuid(),
            tenantId: $flow->tenantId(),
            name: $flow->name().' (Copy)',
            description: $flow->description(),
            phoneNumber: $flow->phoneNumber(),
            config: $flow->config(),
        );

        $this->flowRepository->save($duplicate);

        return redirect()->route('flows.index')
            ->with('success', "Flow '{$duplicate->name()}' created.");
    }

    public function export(Request $request, string $id): JsonResponse
    {
        $flow = $this->flowRepository->findById($id);

        if ($flow === null || $flow->tenantId() !== $request->user()->tenant_id) {
            abort(404);
        }

        return response()->json([
            'name' => $flow->name(),
            'description' => $flow->description(),
            'phone_number' => $flow->phoneNumber(),
            'config' => $flow->getConfig(),
            'export_version' => 1,
            'exported_at' => now()->toIso8601String(),
        ])->withHeaders([
            'Content-Disposition' => 'attachment; filename="'.str_replace(' ', '_', $flow->name()).'.json"',
            'Content-Type' => 'application/json',
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:json', 'max:2048'],
        ]);

        $content = json_decode($request->file('file')->get(), true, 512, JSON_THROW_ON_ERROR);

        if (! isset($content['name'], $content['config'])) {
            return redirect()->route('flows.index')
                ->with('error', 'Invalid flow file format.');
        }

        $flow = new Flow(
            id: (string) Str::uuid(),
            tenantId: $request->user()->tenant_id,
            name: $content['name'],
            description: $content['description'] ?? '',
            phoneNumber: $content['phone_number'] ?? null,
            config: FlowConfig::fromArray($content['config']),
            isActive: false,
        );

        $this->flowRepository->save($flow);

        return redirect()->route('flows.show', $flow->id())
            ->with('success', "Flow '{$flow->name()}' imported.");
    }

    public function test(Request $request, string $id): JsonResponse
    {
        $flow = $this->flowRepository->findById($id);

        if ($flow === null || $flow->tenantId() !== $request->user()->tenant_id) {
            abort(404);
        }

        $request->validate([
            'phone_number' => ['required', 'string', 'max:20'],
        ]);

        $fromNumber = $flow->phoneNumber();

        if ($fromNumber === null || $fromNumber === '') {
            return response()->json(['error' => 'Flow has no phone number configured'], 422);
        }

        try {
            $twilio = new Client(config('twilio.account_sid'), config('twilio.auth_token'));

            $voiceResponse = new VoiceResponse;
            $voiceResponse->redirect(
                url('/twilio/inbound').'?flow_id='.$flow->id(),
            );

            $twilio->calls->create(
                $request->phone_number,
                $fromNumber,
                [
                    'twiml' => (string) $voiceResponse,
                    'statusCallback' => url('/twilio/status'),
                ]
            );

            return response()->json(['status' => 'call_initiated']);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to initiate call: '.$e->getMessage()], 500);
        }
    }

    /** @return array<string, mixed> */
    private function toArray(Flow $flow): array
    {
        return [
            'id' => $flow->id(),
            'name' => $flow->name(),
            'description' => $flow->description(),
            'phone_number' => $flow->phoneNumber(),
            'config' => $flow->getConfig(),
            'is_active' => $flow->isActive(),
            'version' => $flow->version(),
        ];
    }
}
