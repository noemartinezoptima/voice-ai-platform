<?php

namespace App\Domain\Flow\Repositories;

use App\Domain\Flow\Entities\Flow;

interface FlowRepositoryInterface
{
    public function findById(string $id): ?Flow;

    public function findByPhoneNumber(string $phoneNumber): ?Flow;

    /** @return Flow[] */
    public function findByTenant(string $tenantId): array;

    public function save(Flow $flow): void;

    public function delete(string $id): void;

    public function countByTenant(string $tenantId): int;

    public function countActiveByTenant(string $tenantId): int;
}
