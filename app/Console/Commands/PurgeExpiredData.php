<?php

namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PurgeExpiredData extends Command
{
    protected $signature = 'data:purge-expired';

    protected $description = 'Purge recordings and call logs exceeding tenant retention period';

    public function handle(): int
    {
        $tenants = TenantModel::whereNotNull('data_protection')->get();
        $totalDeleted = 0;

        foreach ($tenants as $tenant) {
            $dp = $tenant->data_protection;
            $retentionDays = $dp['retention_days'] ?? 90;

            if ($retentionDays <= 0) {
                continue;
            }

            $cutoff = Carbon::now()->subDays($retentionDays);

            $deletedCount = DB::table('calls')
                ->where('tenant_id', $tenant->id)
                ->where('created_at', '<', $cutoff)
                ->delete();

            if (Storage::disk('recordings')->exists((string) $tenant->id)) {
                $recordingFiles = Storage::disk('recordings')->files((string) $tenant->id);
                $deletedRecordings = 0;

                foreach ($recordingFiles as $file) {
                    $fileTime = Storage::disk('recordings')->lastModified($file);

                    if ($fileTime < $cutoff->timestamp) {
                        Storage::disk('recordings')->delete($file);
                        $deletedRecordings++;
                    }
                }
            } else {
                $deletedRecordings = 0;
            }

            if ($deletedCount > 0 || $deletedRecordings > 0) {
                activity()
                    ->event('data_purged')
                    ->withProperties([
                        'tenant_id' => (string) $tenant->id,
                        'deleted_calls' => $deletedCount,
                        'deleted_recordings' => $deletedRecordings,
                        'retention_days' => $retentionDays,
                    ])
                    ->log('Expired data purged');

                $totalDeleted += $deletedCount + $deletedRecordings;

                $this->info("Tenant {$tenant->id}: {$deletedCount} calls, {$deletedRecordings} recordings purged");
            }
        }

        $this->info("Total: {$totalDeleted} records purged");

        return Command::SUCCESS;
    }
}
