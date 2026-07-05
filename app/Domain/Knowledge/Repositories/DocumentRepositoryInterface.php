<?php

namespace App\Domain\Knowledge\Repositories;

use App\Domain\Knowledge\Entities\Document;

interface DocumentRepositoryInterface
{
    public function findById(string $id): ?Document;

    /** @return Document[] */
    public function findByTenant(string $tenantId): array;

    public function save(Document $document): void;

    public function delete(string $id): void;
}
