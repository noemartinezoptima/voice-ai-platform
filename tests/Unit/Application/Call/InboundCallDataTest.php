<?php

namespace Tests\Unit\Application\Call;

use App\Application\Call\DTOs\InboundCallData;
use PHPUnit\Framework\TestCase;

class InboundCallDataTest extends TestCase
{
    public function test_constructor(): void
    {
        $data = new InboundCallData(
            callSid: 'CA'.str_repeat('a', 32),
            fromNumber: '+12345678901',
            toNumber: '+19876543210',
        );
        $this->assertEquals('CA'.str_repeat('a', 32), $data->callSid);
        $this->assertEquals('+12345678901', $data->fromNumber);
        $this->assertEquals('+19876543210', $data->toNumber);
        $this->assertNull($data->tenantId);
        $this->assertNull($data->flowId);
    }

    public function test_from_twilio(): void
    {
        $data = InboundCallData::fromTwilio([
            'CallSid' => 'CA'.str_repeat('a', 32),
            'From' => '+12345678901',
            'To' => '+19876543210',
        ]);

        $this->assertEquals('CA'.str_repeat('a', 32), $data->callSid);
        $this->assertEquals('+12345678901', $data->fromNumber);
        $this->assertEquals('+19876543210', $data->toNumber);
    }

    public function test_from_twilio_with_tenant(): void
    {
        $data = InboundCallData::fromTwilio([
            'CallSid' => 'CA'.str_repeat('b', 32),
            'From' => '+11111111111',
            'To' => '+22222222222',
            'tenant_id' => 'tenant-1',
            'flow_id' => 'flow-1',
        ]);

        $this->assertEquals('tenant-1', $data->tenantId);
        $this->assertEquals('flow-1', $data->flowId);
    }

    public function test_from_twilio_with_empty_payload(): void
    {
        $data = InboundCallData::fromTwilio([]);

        $this->assertEquals('', $data->callSid);
        $this->assertEquals('', $data->fromNumber);
        $this->assertEquals('', $data->toNumber);
    }
}
