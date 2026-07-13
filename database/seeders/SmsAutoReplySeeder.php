<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Sms\SmsAutoReplyModel;
use Illuminate\Database\Seeder;

class SmsAutoReplySeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = '00000000-0000-0000-0000-000000000001';

        SmsAutoReplyModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'keyword' => 'help'],
            ['reply_text' => 'Thanks for contacting us. Our support team is available Mon-Fri 9am-6pm. Call +525512345678 for urgent issues.', 'match_type' => 'contains', 'is_active' => true]
        );

        SmsAutoReplyModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'keyword' => 'hours'],
            ['reply_text' => 'Our business hours are Monday to Friday, 9:00 AM to 6:00 PM CST. We are closed on weekends and holidays.', 'match_type' => 'contains', 'is_active' => true]
        );

        SmsAutoReplyModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'keyword' => 'pricing'],
            ['reply_text' => 'Our plans start at $49/month (Pro) with unlimited flows. Enterprise plans include custom pricing. Visit our website for details.', 'match_type' => 'exact', 'is_active' => true]
        );

        SmsAutoReplyModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'keyword' => 'stop'],
            ['reply_text' => 'You have been unsubscribed from SMS notifications. Reply START to re-subscribe.', 'match_type' => 'exact', 'is_active' => true]
        );

        SmsAutoReplyModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'keyword' => 'info'],
            ['reply_text' => 'Acme Corp — Voice AI Platform. Manage your calls, flows, and team at https://voice-ai-platform.test. Contact support for help.', 'match_type' => 'exact', 'is_active' => true]
        );
    }
}
