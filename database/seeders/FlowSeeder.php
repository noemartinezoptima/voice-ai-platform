<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use Illuminate\Database\Seeder;

class FlowSeeder extends Seeder
{
    public function run(): void
    {
        FlowModel::firstOrCreate(
            ['name' => 'Customer Support IVR', 'tenant_id' => '00000000-0000-0000-0000-000000000001'],
            [
                'description' => 'Main support line with menu options for sales, technical support, and billing.',
                'phone_number' => '+525512345678',
                'config' => [
                    'start_step' => 'welcome',
                    'steps' => [
                        'welcome' => [
                            'id' => 'welcome',
                            'type' => 'say',
                            'config' => ['text' => 'Thank you for calling Acme Corp support. Press 1 for sales, 2 for technical support, 3 for billing.'],
                            'next' => 'gather_menu',
                        ],
                        'gather_menu' => [
                            'id' => 'gather_menu',
                            'type' => 'gather',
                            'config' => ['num_digits' => 1, 'timeout' => 5],
                            'next' => 'route_menu',
                        ],
                        'route_menu' => [
                            'id' => 'route_menu',
                            'type' => 'say',
                            'config' => ['text' => 'Please hold while we connect you.'],
                            'next' => 'hangup',
                        ],
                        'hangup' => [
                            'id' => 'hangup',
                            'type' => 'hangup',
                        ],
                    ],
                ],
                'is_active' => true,
                'version' => 2,
            ]
        );

        FlowModel::firstOrCreate(
            ['name' => 'Appointment Reminder', 'tenant_id' => '00000000-0000-0000-0000-000000000001'],
            [
                'description' => 'Outbound reminder calls for scheduled appointments.',
                'phone_number' => '+525598765432',
                'config' => [
                    'start_step' => 'greeting',
                    'steps' => [
                        'greeting' => [
                            'id' => 'greeting',
                            'type' => 'say',
                            'config' => ['text' => 'Hello, this is a reminder from Acme Corp about your appointment tomorrow at 10 AM.'],
                            'next' => 'confirm',
                        ],
                        'confirm' => [
                            'id' => 'confirm',
                            'type' => 'gather',
                            'config' => ['num_digits' => 1, 'timeout' => 5, 'text' => 'Press 1 to confirm, 2 to reschedule.'],
                            'next' => 'thank_you',
                        ],
                        'thank_you' => [
                            'id' => 'thank_you',
                            'type' => 'say',
                            'config' => ['text' => 'Thank you. Have a great day.'],
                            'next' => 'hangup',
                        ],
                        'hangup' => [
                            'id' => 'hangup',
                            'type' => 'hangup',
                        ],
                    ],
                ],
                'is_active' => true,
                'version' => 1,
            ]
        );

        FlowModel::firstOrCreate(
            ['name' => 'Survey Caller', 'tenant_id' => '00000000-0000-0000-0000-000000000002'],
            [
                'description' => 'Customer satisfaction survey for recent purchases.',
                'phone_number' => '+14155551234',
                'config' => [
                    'start_step' => 'intro',
                    'steps' => [
                        'intro' => [
                            'id' => 'intro',
                            'type' => 'say',
                            'config' => ['text' => 'Hi, this is DevTest Labs calling for a quick 2-minute survey.'],
                            'next' => 'question_1',
                        ],
                        'question_1' => [
                            'id' => 'question_1',
                            'type' => 'gather',
                            'config' => ['num_digits' => 1, 'timeout' => 8, 'text' => 'On a scale of 1 to 5, how satisfied are you with our service?'],
                            'next' => 'end',
                        ],
                        'end' => [
                            'id' => 'end',
                            'type' => 'say',
                            'config' => ['text' => 'Thank you for your feedback. Goodbye.'],
                            'next' => 'hangup',
                        ],
                        'hangup' => [
                            'id' => 'hangup',
                            'type' => 'hangup',
                        ],
                    ],
                ],
                'is_active' => false,
                'version' => 3,
            ]
        );
    }
}
