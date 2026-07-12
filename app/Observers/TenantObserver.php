<?php

namespace App\Observers;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\TenantEncryptionService;

class TenantObserver
{
    public function __construct(
        private readonly TenantEncryptionService $encryptionService,
    ) {}

    public function creating(TenantModel $tenant): void
    {
        if ($tenant->encryption_key === null) {
            $tenant->encryption_key = $this->encryptionService->generateKey();
        }
    }
}
