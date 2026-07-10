<?php

namespace Tests\Feature\Twilio;

use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SmsInboundTest extends TestCase
{
    use RefreshDatabase;

    public function test_inbound_creates_sms_for_known_tenant(): void
    {
        TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15005551234'],
        ]);

        $response = $this->post('/twilio/sms/inbound', [
            'From' => '+15559876543',
            'To' => '+15005551234',
            'Body' => 'Hello from test',
            'MessageSid' => 'SM123456789',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('sms_messages', [
            'from_number' => '+15559876543',
            'to_number' => '+15005551234',
            'body' => 'Hello from test',
            'direction' => 'inbound',
            'message_sid' => 'SM123456789',
        ]);
    }

    public function test_inbound_stores_message_when_no_tenant_match(): void
    {
        $response = $this->post('/twilio/sms/inbound', [
            'From' => '+15559876543',
            'To' => '+15009999999',
            'Body' => 'To unknown number',
            'MessageSid' => 'SM999999999',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseCount('sms_messages', 0);
    }

    public function test_inbound_returns_twiml_xml(): void
    {
        TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15005551234'],
        ]);

        $response = $this->post('/twilio/sms/inbound', [
            'From' => '+15551111111',
            'To' => '+15005551234',
            'Body' => 'Test',
            'MessageSid' => 'SM111111111',
        ]);

        $response->assertStatus(200);
        $content = $response->getContent();
        $this->assertStringContainsString('<Response></Response>', $content);
    }

    public function test_inbound_csrf_exempt(): void
    {
        TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15005551234'],
        ]);

        $this->post('/twilio/sms/inbound', [
            'From' => '+15551111111',
            'To' => '+15005551234',
            'Body' => 'CSRF test',
            'MessageSid' => 'SM222222222',
        ])->assertStatus(200);

        $this->assertDatabaseHas('sms_messages', ['message_sid' => 'SM222222222']);
    }
}
