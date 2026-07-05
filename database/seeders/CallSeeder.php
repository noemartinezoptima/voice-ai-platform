<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CallSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = ['completed', 'completed', 'completed', 'failed', 'in_progress', 'completed', 'busy', 'no_answer', 'completed', 'completed', 'failed', 'completed', 'in_progress', 'cancelled', 'completed'];

        foreach ($statuses as $i => $status) {
            $startedAt = Carbon::now()->subHours(rand(1, 72))->subMinutes(rand(0, 59));
            $duration = $status === 'completed' ? rand(15, 480) : rand(0, 30);
            $callSid = 'CA'.strtoupper(uniqid());

            CallModel::firstOrCreate(
                ['call_sid' => $callSid],
                [
                    'tenant_id' => '00000000-0000-0000-0000-000000000001',
                    'from_number' => $this->randomPhone('mx'),
                    'to_number' => '+525512345678',
                    'status' => $status,
                    'duration_seconds' => $duration,
                    'current_step' => $status === 'in_progress' ? 'gather_menu' : null,
                    'context' => ['source' => 'inbound', 'flow_name' => 'Customer Support IVR'],
                    'error' => $status === 'failed' ? 'Call dropped due to network timeout' : null,
                    'started_at' => $startedAt,
                    'ended_at' => $status === 'completed' ? $startedAt->copy()->addSeconds($duration) : null,
                ]
            );
        }

        for ($i = 0; $i < 3; $i++) {
            $startedAt = Carbon::now()->subHours(rand(1, 48));
            $callSid = 'CA'.strtoupper(uniqid());

            CallModel::firstOrCreate(
                ['call_sid' => $callSid],
                [
                    'tenant_id' => '00000000-0000-0000-0000-000000000002',
                    'from_number' => $this->randomPhone('us'),
                    'to_number' => '+14155551234',
                    'status' => 'completed',
                    'duration_seconds' => rand(30, 180),
                    'current_step' => null,
                    'context' => ['source' => 'outbound', 'flow_name' => 'Survey Caller'],
                    'error' => null,
                    'started_at' => $startedAt,
                    'ended_at' => $startedAt->copy()->addSeconds(rand(30, 180)),
                ]
            );
        }
    }

    private function randomPhone(string $country): string
    {
        if ($country === 'mx') {
            return '+5255'.str_pad((string) rand(10000000, 99999999), 8, '0', STR_PAD_LEFT);
        }

        return '+1'.str_pad((string) rand(2000000000, 2999999999), 10, '0', STR_PAD_LEFT);
    }
}
