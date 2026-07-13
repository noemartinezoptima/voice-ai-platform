<?php

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Sms\SmsCampaignModel;
use Illuminate\Database\Seeder;

class SmsCampaignSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = '00000000-0000-0000-0000-000000000001';

        SmsCampaignModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'July Promotion'],
            [
                'message' => 'Summer sale! Use code SUMMER25 for 25% off your first month of Voice AI Platform. Valid until July 31.',
                'recipients' => ['+52551000111', '+52551000222', '+52551000333'],
                'status' => 'completed',
                'sent_count' => 3,
                'total_count' => 3,
            ]
        );

        SmsCampaignModel::firstOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Welcome Onboarding'],
            [
                'message' => 'Welcome to Voice AI Platform! Start building your first flow at voice-ai-platform.test/flows. Reply HELP for support.',
                'recipients' => ['+52551000444', '+52551000555', '+52551000666', '+52551000777', '+52551000888'],
                'status' => 'draft',
                'sent_count' => 0,
                'total_count' => 5,
            ]
        );
    }
}
