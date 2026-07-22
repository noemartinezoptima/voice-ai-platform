<?php

namespace Database\Seeders;

use App\Domain\Flow\Services\FlowTemplates;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use Illuminate\Database\Seeder;

class FlowSeeder extends Seeder
{
    public function run(): void
    {
        $templates = collect(FlowTemplates::all());

        $flows = [
            ['name' => 'Customer Support IVR', 'tenant_id' => '00000000-0000-0000-0000-000000000001', 'phone' => '+525512345678', 'template' => 'customer-support', 'description' => 'AI-powered support with knowledge base lookup and optional human transfer.', 'active' => true, 'version' => 3],
            ['name' => 'Appointment Reminder', 'tenant_id' => '00000000-0000-0000-0000-000000000001', 'phone' => '+525598765432', 'template' => 'appointment-reminder', 'description' => 'Remind callers of upcoming appointments with confirmation options.', 'active' => true, 'version' => 2],
            ['name' => 'Survey Caller', 'tenant_id' => '00000000-0000-0000-0000-000000000002', 'phone' => '+14159309192', 'template' => 'survey', 'description' => 'Customer satisfaction survey for recent purchases.', 'active' => true, 'version' => 3],
            ['name' => 'AI Assistant', 'tenant_id' => '00000000-0000-0000-0000-000000000001', 'phone' => '+52554567234', 'template' => 'ai-assistant', 'description' => 'Open-ended AI conversation with dynamic responses.', 'active' => true, 'version' => 1],
            ['name' => 'Knowledge Base Q&A', 'tenant_id' => '00000000-0000-0000-0000-000000000001', 'phone' => '+52551000111', 'template' => 'knowledge-base', 'description' => 'Answer caller questions using uploaded documents with RAG.', 'active' => true, 'version' => 1],
            ['name' => 'WhatsApp Bot', 'tenant_id' => '00000000-0000-0000-0000-000000000001', 'phone' => '+52551000222', 'template' => 'whatsapp-bot', 'description' => 'Smart WhatsApp bot with keyword matching and AI responses.', 'active' => true, 'version' => 1],
            ['name' => 'Webhook Notification', 'tenant_id' => '00000000-0000-0000-0000-000000000002', 'phone' => '+14155559876', 'template' => 'webhook-notification', 'description' => 'Notify external systems about call events via webhooks.', 'active' => false, 'version' => 1],
        ];

        foreach ($flows as $flow) {
            $template = $templates->firstWhere('id', $flow['template']);

            FlowModel::firstOrCreate(
                ['name' => $flow['name'], 'tenant_id' => $flow['tenant_id']],
                [
                    'description' => $flow['description'],
                    'phone_number' => $flow['phone'],
                    'config' => $template['config'] ?? [],
                    'is_active' => $flow['active'],
                    'version' => $flow['version'],
                ]
            );
        }
    }
}
