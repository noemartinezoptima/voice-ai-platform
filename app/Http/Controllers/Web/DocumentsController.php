<?php

namespace App\Http\Controllers\Web;

use App\Domain\Knowledge\Entities\Document;
use App\Domain\Knowledge\Repositories\DocumentRepositoryInterface;
use App\Domain\Knowledge\Repositories\KnowledgeChunkRepositoryInterface;
use App\Domain\Knowledge\ValueObjects\DocumentStatus;
use App\Domain\Knowledge\ValueObjects\ResourceType;
use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentUploadRequest;
use App\Infrastructure\Persistence\Eloquent\Knowledge\ChunkModel;
use App\Infrastructure\Persistence\Eloquent\Knowledge\DocumentModel;
use App\Jobs\ProcessDocumentJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DocumentsController extends Controller
{
    public function __construct(
        private readonly DocumentRepositoryInterface $documents,
        private readonly KnowledgeChunkRepositoryInterface $chunks,
    ) {}

    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $docs = DocumentModel::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $totalDocs = DocumentModel::where('tenant_id', $tenantId)->count();
        $totalChunks = ChunkModel::where('tenant_id', $tenantId)->count();
        $avgChunks = $totalDocs > 0 ? round($totalChunks / $totalDocs, 1) : 0;

        return Inertia::render('Settings/Documents/Index', [
            'documents' => $docs,
            'stats' => [
                'total_documents' => $totalDocs,
                'total_chunks' => $totalChunks,
                'avg_chunks_per_doc' => $avgChunks,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Settings/Documents/Create', [
            'resourceTypes' => [
                ['value' => 'pdf', 'label' => 'PDF'],
                ['value' => 'image', 'label' => 'Image'],
                ['value' => 'csv', 'label' => 'CSV'],
                ['value' => 'text', 'label' => 'Text'],
            ],
        ]);
    }

    public function store(DocumentUploadRequest $request): RedirectResponse
    {
        $tenantId = $request->user()->tenant_id;
        $file = $request->file('file');
        $name = $request->name ?? $file->getClientOriginalName();

        $path = $file->store("documents/{$tenantId}");

        $doc = new Document(
            id: (string) Str::uuid(),
            tenantId: $tenantId,
            name: $name,
            resourceType: ResourceType::from($request->resource_type),
            mimeType: $file->getMimeType() ?: 'application/octet-stream',
            path: $path,
        );

        $this->documents->save($doc);

        ProcessDocumentJob::dispatch($doc->id());

        return redirect()->route('settings.documents.show', $doc->id())
            ->with('success', "Document '{$name}' uploaded and queued for processing.");
    }

    public function show(Request $request, string $id): Response
    {
        $docModel = DocumentModel::where('tenant_id', $request->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $doc = $this->documents->findById($id);
        $chunks = $doc !== null ? $this->chunks->findByDocument($doc->id()) : [];

        return Inertia::render('Settings/Documents/Show', [
            'document' => $docModel,
            'chunks' => array_map(fn ($c) => [
                'chunk_index' => $c->chunkIndex(),
                'content' => $c->content(),
                'metadata' => $c->metadata(),
            ], $chunks),
        ]);
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $docModel = DocumentModel::where('tenant_id', $request->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        Storage::delete($docModel->path);
        $this->chunks->deleteByDocument($id);
        $this->documents->delete($id);

        return redirect()->route('settings.documents.index')
            ->with('success', 'Document deleted.');
    }

    public function reProcess(Request $request, string $id): RedirectResponse
    {
        $docModel = DocumentModel::where('tenant_id', $request->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $docModel->update(['status' => DocumentStatus::Pending->value, 'error' => null]);
        ProcessDocumentJob::dispatch($id);

        return redirect()->route('settings.documents.show', $id)
            ->with('success', 'Document queued for re-processing.');
    }

    public function uploadFile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:102400'],
            'resource_type' => ['required', 'string', 'in:pdf,image,csv,text'],
        ]);

        $tenantId = $request->user()->tenant_id;
        $file = $request->file('file');
        $name = $file->getClientOriginalName();

        $path = $file->store("documents/{$tenantId}");

        $doc = new Document(
            id: (string) Str::uuid(),
            tenantId: $tenantId,
            name: $name,
            resourceType: ResourceType::from($validated['resource_type']),
            mimeType: $file->getMimeType() ?: 'application/octet-stream',
            path: $path,
        );

        $this->documents->save($doc);
        ProcessDocumentJob::dispatch($doc->id());

        return response()->json([
            'status' => 'uploaded',
            'document' => [
                'id' => $doc->id(),
                'name' => $name,
                'status' => 'pending',
            ],
        ]);
    }
}
