<?php

namespace App\Domain\Voice\Repositories;

use App\Domain\Voice\Entities\CustomVoice;

interface CustomVoiceRepositoryInterface
{
    public function save(CustomVoice $voice): void;

    /** @return CustomVoice[] */
    public function findByTenant(string $tenantId): array;

    public function findById(string $id): ?CustomVoice;

    public function delete(string $id): void;
}
