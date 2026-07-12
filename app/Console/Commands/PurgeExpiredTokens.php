<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Laravel\Sanctum\PersonalAccessToken;

class PurgeExpiredTokens extends Command
{
    protected $signature = 'tokens:purge-expired';

    protected $description = 'Delete expired personal access tokens';

    public function handle(): int
    {
        $deletedCount = PersonalAccessToken::where('expires_at', '<', now())->delete();

        $this->info("{$deletedCount} expired tokens purged");

        return Command::SUCCESS;
    }
}
