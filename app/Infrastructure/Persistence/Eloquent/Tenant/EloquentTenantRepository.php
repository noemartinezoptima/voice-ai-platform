<?php

namespace App\Infrastructure\Persistence\Eloquent\Tenant;

use App\Domain\Tenant\Entities\Tenant;
use App\Domain\Tenant\Repositories\TenantRepositoryInterface;

class EloquentTenantRepository implements TenantRepositoryInterface
{
    public function findById(string $id): ?Tenant
    {
        $model = TenantModel::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function findBySlug(string $slug): ?Tenant
    {
        $model = TenantModel::where('slug', $slug)->first();

        return $model ? $this->toEntity($model) : null;
    }

    public function save(Tenant $tenant): void
    {
        TenantModel::updateOrCreate(
            ['id' => $tenant->id()],
            [
                'name' => $tenant->name(),
                'slug' => $tenant->slug(),
                'settings' => $tenant->settings(),
                'is_active' => $tenant->isActive(),
            ],
        );
    }

    private function toEntity(TenantModel $model): Tenant
    {
        return new Tenant(
            id: $model->id,
            name: $model->name,
            slug: $model->slug,
            settings: $model->settings ?? [],
            isActive: $model->is_active,
        );
    }
}
