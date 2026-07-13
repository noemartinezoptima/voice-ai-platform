<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\ElevenLabs\ElevenLabsAgentModel;
use Illuminate\Database\Seeder;

class ElevenLabsAgentSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = '00000000-0000-0000-0000-000000000001';

        ElevenLabsAgentModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'elevenlabs_agent_id' => 'seed-agent-001'],
            ['name' => 'Customer Support Agent', 'is_active' => true, 'config' => ['prompt' => 'You are a helpful customer support agent.', 'model' => 'gpt-4o']]
        );

        ElevenLabsAgentModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'elevenlabs_agent_id' => 'seed-agent-002'],
            ['name' => 'Sales Assistant', 'is_active' => true, 'config' => ['prompt' => 'You are a knowledgeable sales assistant.', 'model' => 'gpt-4o-mini']]
        );
    }
}
