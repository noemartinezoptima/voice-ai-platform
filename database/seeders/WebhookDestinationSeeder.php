<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Webhook\WebhookDestinationModel;
use Illuminate\Database\Seeder;

class WebhookDestinationSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = '00000000-0000-0000-0000-000000000001';

        WebhookDestinationModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'url' => 'https://hooks.slack.com/services/example'],
            ['events' => ['call.completed', 'call.failed'], 'description' => 'Slack notifications for completed/failed calls', 'is_active' => true]
        );

        WebhookDestinationModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'url' => 'https://api.example.com/call-events'],
            ['events' => ['call.initiated', 'call.in_progress', 'call.completed'], 'description' => 'CRM integration — sync call events', 'is_active' => true]
        );

        WebhookDestinationModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'url' => 'https://analytics.example.com/webhook'],
            ['events' => ['call.completed'], 'description' => 'Analytics tracking endpoint (inactive)', 'is_active' => false]
        );
    }
}
