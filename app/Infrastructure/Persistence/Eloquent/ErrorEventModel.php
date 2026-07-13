<?php

namespace App\Infrastructure\Persistence\Eloquent;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $hash
 * @property string $class
 * @property string $file
 * @property int $line
 * @property string $message
 * @property int $occurrence_count
 * @property Carbon $last_seen_at
 * @property Carbon $first_seen_at
 * @property Carbon|null $resolved_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ErrorEventModel extends Model
{
    use HasUuids;

    protected $table = 'error_events';

    protected $fillable = [
        'hash', 'class', 'file', 'line', 'message',
        'occurrence_count', 'last_seen_at', 'first_seen_at', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'last_seen_at' => 'datetime',
            'first_seen_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeUnresolved(Builder $query): void
    {
        $query->whereNull('resolved_at');
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeResolved(Builder $query): void
    {
        $query->whereNotNull('resolved_at');
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeRecent(Builder $query): void
    {
        $query->orderByDesc('last_seen_at');
    }

    public static function record(\Throwable $e): self
    {
        $hash = hash('sha256', $e::class.':'.$e->getFile().':'.$e->getLine());
        $now = now();

        $existing = self::where('hash', $hash)->first();

        if ($existing) {
            $existing->increment('occurrence_count');
            $existing->update(['last_seen_at' => $now]);

            return $existing->fresh();
        }

        return self::create([
            'hash' => $hash,
            'class' => $e::class,
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'message' => $e->getMessage(),
            'occurrence_count' => 1,
            'last_seen_at' => $now,
            'first_seen_at' => $now,
        ]);
    }
}
