<?php

namespace App\Http\Resources;

use App\Domain\Tenant\Entities\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Tenant */
class TenantResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'slug' => $this->getSlug(),
            'settings' => $this->getSettings(),
            'is_active' => $this->isActive(),
            'created_at' => $this->created_at ?? null,
        ];
    }
}
