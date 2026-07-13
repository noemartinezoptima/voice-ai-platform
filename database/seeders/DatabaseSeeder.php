<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TenantSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
            FlowSeeder::class,
            CallSeeder::class,
            CallLogSeeder::class,
            TranscriptSeeder::class,
            ApiTokenSeeder::class,
            SmsMessageSeeder::class,
            SmsAutoReplySeeder::class,
            SmsCampaignSeeder::class,
            CustomVoiceSeeder::class,
            ElevenLabsAgentSeeder::class,
            DocumentSeeder::class,
            WebhookDestinationSeeder::class,
            LanguageLinesSeeder::class,
        ]);
    }
}
