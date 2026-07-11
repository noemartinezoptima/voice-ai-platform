<?php

namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Mail\ComplianceDigest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendComplianceDigests extends Command
{
    protected $signature = 'compliance:digest';

    protected $description = 'Send weekly compliance digest to tenant owners';

    public function handle(): int
    {
        $tenants = TenantModel::all();

        foreach ($tenants as $tenant) {
            $dp = $tenant->data_protection;
            $retentionDays = $dp['retention_days'] ?? 90;
            $cutoff = Carbon::now()->addDays(7);

            $totalCalls = DB::table('calls')->where('tenant_id', $tenant->id)->count();
            $totalRecordings = DB::table('calls')
                ->where('tenant_id', $tenant->id)
                ->whereNotNull('recording_url')
                ->count();
            $expiringSoon = DB::table('calls')
                ->where('tenant_id', $tenant->id)
                ->where('created_at', '<', $cutoff->copy()->subDays($retentionDays))
                ->where('created_at', '>=', Carbon::now()->subDays($retentionDays))
                ->count();

            $stats = [
                'total_calls' => $totalCalls,
                'total_recordings' => $totalRecordings,
                'retention_days' => $retentionDays,
                'expiring_soon' => $expiringSoon,
            ];

            $owners = User::where('tenant_id', $tenant->id)
                ->where('role', 'owner')
                ->whereNotNull('email_verified_at')
                ->get();

            foreach ($owners as $owner) {
                Mail::to($owner->email)->queue(new ComplianceDigest($tenant, $stats));
            }

            activity()
                ->event('compliance_digest_sent')
                ->withProperties(['tenant_id' => $tenant->id])
                ->log('Weekly compliance digest sent');
        }

        $this->info('Compliance digests sent to '.$tenants->count().' tenants');

        return Command::SUCCESS;
    }
}
