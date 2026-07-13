<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Call\CallLogModel;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use Illuminate\Database\Seeder;

class CallLogSeeder extends Seeder
{
    public function run(): void
    {
        $calls = CallModel::where('tenant_id', '00000000-0000-0000-0000-000000000001')->get();

        $stepTypeWeights = [
            'say' => 20,
            'ask' => 20,
            'llm' => 15,
            'condition' => 10,
            'transfer' => 5,
            'hangup' => 10,
            'webhook' => 10,
            'knowledge' => 10,
        ];

        $stepTypes = [];
        foreach ($stepTypeWeights as $type => $weight) {
            for ($i = 0; $i < $weight; $i++) {
                $stepTypes[] = $type;
            }
        }

        $this->command?->info('Creating call logs for '.$calls->count().' calls...');

        foreach ($calls as $call) {
            $logCount = rand(3, 10);

            for ($i = 0; $i < $logCount; $i++) {
                CallLogModel::create([
                    'call_id' => $call->id,
                    'step_type' => $stepTypes[array_rand($stepTypes)],
                    'step_id' => fake()->uuid(),
                    'input' => fake()->sentence(),
                    'output' => fake()->sentence(),
                    'metadata' => [],
                    'duration_ms' => rand(100, 5000),
                ]);
            }
        }
    }
}
