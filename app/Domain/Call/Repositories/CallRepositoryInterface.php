<?php

namespace App\Domain\Call\Repositories;

use App\Domain\Call\Entities\Call;

interface CallRepositoryInterface
{
    public function findById(string $id): ?Call;

    public function findBySid(string $callSid): ?Call;

    /** @return Call[] */
    public function findByTenant(string $tenantId): array;

    public function save(Call $call): void;

    public function getTranscript(string $id): ?string;

    public function countByTenant(string $tenantId): int;

    public function countTodayByTenant(string $tenantId): int;

    public function countActiveByTenant(string $tenantId): int;

    public function avgDurationByTenant(string $tenantId): int;

    /** @return array<int, array{date: string, count: int}> */
    public function callsByDay(string $tenantId, ?string $start = null, ?string $end = null): array;

    /** @return array<int, array{status: string, count: int}> */
    public function callsByStatus(string $tenantId, ?string $start = null, ?string $end = null): array;

    /** @return array<int, array{date: string, avg_seconds: float}> */
    public function avgDurationByDay(string $tenantId, ?string $start = null, ?string $end = null): array;

    /** @return array<int, array{flow_name: string, count: int}> */
    public function callsByFlow(string $tenantId, int $limit = 5, ?string $start = null, ?string $end = null): array;

    public function countInRange(string $tenantId, ?string $start = null, ?string $end = null): int;

    public function avgDurationInRange(string $tenantId, ?string $start = null, ?string $end = null): int;

    /** @return array<int, array{flow_name: string, total_calls: int, avg_duration: float, success_rate: float}> */
    public function callsByFlowWithMetrics(string $tenantId, ?string $start = null, ?string $end = null): array;
}
