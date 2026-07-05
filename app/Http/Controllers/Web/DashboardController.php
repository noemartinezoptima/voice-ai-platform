<?php

namespace App\Http\Controllers\Web;

use App\Domain\Call\Repositories\CallRepositoryInterface;
use App\Domain\Flow\Repositories\FlowRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly FlowRepositoryInterface $flowRepository,
        private readonly CallRepositoryInterface $callRepository,
    ) {}

    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_flows' => $this->flowRepository->countByTenant($tenantId),
                'active_flows' => $this->flowRepository->countActiveByTenant($tenantId),
                'total_calls' => $this->callRepository->countByTenant($tenantId),
                'calls_today' => $this->callRepository->countTodayByTenant($tenantId),
                'active_calls' => $this->callRepository->countActiveByTenant($tenantId),
                'avg_duration_seconds' => $this->callRepository->avgDurationByTenant($tenantId),
            ],
            'callsByDay' => $this->callRepository->callsByDay($tenantId),
            'callsByStatus' => $this->callRepository->callsByStatus($tenantId),
            'avgDurationByDay' => $this->callRepository->avgDurationByDay($tenantId),
            'callsByFlow' => $this->callRepository->callsByFlow($tenantId),
        ]);
    }
}
