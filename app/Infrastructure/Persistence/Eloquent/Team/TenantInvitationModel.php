<?php

namespace App\Infrastructure\Persistence\Eloquent\Team;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $tenant_id
 * @property string $email
 * @property string $role
 * @property string $token
 * @property string|null $accepted_at
 */
class TenantInvitationModel extends Model
{
    use HasUuids;

    protected $table = 'tenant_invitations';

    protected $fillable = [
        'tenant_id',
        'email',
        'role',
        'token',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
        ];
    }
}
