<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Knowledge\ChunkModel;
use App\Infrastructure\Persistence\Eloquent\Knowledge\DocumentModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = '00000000-0000-0000-0000-000000000001';

        $documents = [
            ['name' => 'Product FAQ', 'content' => [
                'Our platform supports voice, SMS, and WhatsApp communication channels.',
                'You can integrate with Twilio, ElevenLabs, and OpenAI APIs.',
                'Flows are built using a visual drag-and-drop builder with 9 step types.',
                'Real-time monitoring shows active calls, transcripts, and analytics.',
            ]],
            ['name' => 'Pricing Guide', 'content' => [
                'Free plan includes 1 phone number with 5 active flows.',
                'Pro plan ($49/mo) includes 10 numbers and unlimited flows.',
                'Enterprise plan offers custom pricing with white-label options.',
                'All plans include API access and standard support.',
            ]],
            ['name' => 'Support Handbook', 'content' => [
                'Response time: under 5 minutes for critical issues.',
                'Support channels: email, phone, and in-app chat.',
                'Knowledge base available 24/7 with search functionality.',
                'Custom SLAs available for Enterprise customers.',
            ]],
            ['name' => 'API Documentation', 'content' => [
                'REST API with JSON responses and Bearer token authentication.',
                'Rate limit: 100 requests per minute per tenant.',
                'Webhook destinations support call events with retry logic.',
                'API versioning via /api/v1/ prefix.',
            ]],
            ['name' => 'Onboarding Guide', 'content' => [
                'Step 1: Connect your Twilio account for phone numbers.',
                'Step 2: Build your first flow using the visual builder.',
                'Step 3: Test your flow with a real phone call.',
                'Step 4: Monitor calls in real-time from the dashboard.',
            ]],
        ];

        foreach ($documents as $doc) {
            $document = DocumentModel::firstOrCreate(
                ['tenant_id' => $tenantId, 'name' => $doc['name']],
                [
                    'resource_type' => 'file',
                    'mime_type' => 'application/pdf',
                    'path' => 'documents/'.Str::slug($doc['name']).'.pdf',
                    'status' => 'ready',
                    'metadata' => ['pages' => count($doc['content'])],
                ]
            );

            foreach ($doc['content'] as $index => $chunkText) {
                ChunkModel::firstOrCreate(
                    ['document_id' => $document->id, 'chunk_index' => $index],
                    [
                        'tenant_id' => $tenantId,
                        'content' => $chunkText,
                        'metadata' => ['index' => $index],
                    ]
                );
            }
        }
    }
}
