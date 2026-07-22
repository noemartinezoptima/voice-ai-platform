<?php

namespace App\Http\Controllers\Api;

use App\Domain\Tenant\Entities\Tenant;
use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    public function __construct(
        private readonly TenantRepositoryInterface $tenantRepository,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tenants,slug',
            'settings' => 'nullable|array',
        ]);

        $tenant = new Tenant(
            id: (string) Str::uuid(),
            name: $data['name'],
            slug: $data['slug'],
            settings: $data['settings'] ?? [],
            isActive: true,
        );

        $this->tenantRepository->save($tenant);

        return response()->json(new TenantResource($tenant), 201);
    }

    public function show(string $id): JsonResponse
    {
        $tenant = $this->tenantRepository->findById($id);

        if (! $tenant) {
            return response()->json(['error' => 'Tenant not found'], 404);
        }

        return response()->json(new TenantResource($tenant));
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $tenant = $this->tenantRepository->findById($id);

        if (! $tenant) {
            return response()->json(['error' => 'Tenant not found'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:tenants,slug,'.$id,
            'settings' => 'nullable|array',
        ]);

        $updated = new Tenant(
            id: $tenant->getId(),
            name: $data['name'] ?? $tenant->getName(),
            slug: $data['slug'] ?? $tenant->getSlug(),
            settings: $data['settings'] ?? $tenant->getSettings(),
            isActive: $data['is_active'] ?? $tenant->isActive(),
        );

        $this->tenantRepository->save($updated);

        return response()->json(new TenantResource($updated));
    }
}
