<?php

namespace App\Infrastructure\Persistence\Eloquent;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property int $user_id
 * @property string $type
 * @property string $title
 * @property string|null $body
 * @property array<string, mixed>|null $data
 * @property string|null $read_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class UserNotificationModel extends Model
{
    use HasUuids;

    protected $table = 'user_notifications';

    protected $fillable = ['user_id', 'type', 'title', 'body', 'data', 'read_at'];

    protected function casts(): array
    {
        return ['data' => 'array', 'read_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @param array<string, mixed>|null $data
     */
    public static function send(int $userId, string $type, string $title, ?string $body = null, ?array $data = null): self
    {
        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);
    }
}
