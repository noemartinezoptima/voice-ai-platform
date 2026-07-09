<?php

namespace App\Infrastructure\Persistence\Eloquent\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $name
 * @property string $slug
 * @property array<string, mixed>|null $settings
 * @property bool $is_active
 * @property string $plan
 * @property string|null $stripe_customer_id
 */
class TenantModel extends Model
{
    use HasUuids;

    protected $table = 'tenants';

    protected $fillable = [
        'name',
        'slug',
        'settings',
        'is_active',
        'plan',
        'stripe_customer_id',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'is_active' => 'boolean',
            'plan' => 'string',
        ];
    }
}
