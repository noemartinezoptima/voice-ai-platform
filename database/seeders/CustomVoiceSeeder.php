<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Voice\CustomVoiceModel;
use Illuminate\Database\Seeder;

class CustomVoiceSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = '00000000-0000-0000-0000-000000000001';

        CustomVoiceModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'elevenlabs_voice_id' => 'seed-voice-001'],
            ['name' => 'CEO Voice', 'sample_count' => 4, 'description' => 'Professional CEO voice for business communications.', 'is_default' => true, 'requires_verification' => false, 'preview_url' => null, 'labels' => ['gender' => 'male', 'accent' => 'american']]
        );

        CustomVoiceModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'elevenlabs_voice_id' => 'seed-voice-002'],
            ['name' => 'Support Agent', 'sample_count' => 3, 'description' => 'Friendly and helpful support agent voice.', 'is_default' => false, 'requires_verification' => false, 'preview_url' => null, 'labels' => ['gender' => 'female', 'accent' => 'british']]
        );

        CustomVoiceModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'elevenlabs_voice_id' => 'seed-voice-003'],
            ['name' => 'Welcome Bot', 'sample_count' => 2, 'description' => 'Warm and welcoming voice for greetings and announcements.', 'is_default' => false, 'requires_verification' => true, 'preview_url' => null, 'labels' => ['gender' => 'female', 'accent' => 'american']]
        );
    }
}
