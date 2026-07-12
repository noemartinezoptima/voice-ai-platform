<?php

namespace Tests\Unit\Domain\Call;

use App\Domain\Call\Entities\Call;
use App\Domain\Call\ValueObjects\CallSid;
use App\Domain\Call\ValueObjects\PhoneNumber;
use PHPUnit\Framework\TestCase;

class CallEntityTest extends TestCase
{
    private Call $call;

    protected function setUp(): void
    {
        $this->call = new Call(
            id: 'test-call-id',
            tenantId: 'tenant-1',
            flowId: 'flow-1',
            callSid: new CallSid('CA'.str_repeat('a', 32)),
            fromNumber: new PhoneNumber('+12345678901'),
            toNumber: new PhoneNumber('+19876543210'),
        );
    }

    public function test_getters_return_expected_values(): void
    {
        $this->assertEquals('test-call-id', $this->call->getId());
        $this->assertEquals('tenant-1', $this->call->getTenantId());
        $this->assertEquals('flow-1', $this->call->getFlowId());
        $this->assertEquals('initiated', $this->call->getStatus());
    }

    public function test_shorthand_getters(): void
    {
        $this->assertEquals($this->call->getId(), $this->call->id());
        $this->assertEquals($this->call->getTenantId(), $this->call->tenantId());
        $this->assertEquals($this->call->getStatus(), $this->call->status());
    }

    public function test_mark_in_progress(): void
    {
        $this->call->markInProgress();
        $this->assertEquals('in_progress', $this->call->getStatus());
    }

    public function test_mark_completed(): void
    {
        $this->call->markCompleted();
        $this->assertEquals('completed', $this->call->getStatus());
    }

    public function test_mark_failed_sets_error(): void
    {
        $this->call->markFailed('Connection lost');

        $this->assertEquals('failed', $this->call->getStatus());
        $this->assertEquals(['error' => 'Connection lost'], $this->call->getContext());
    }

    public function test_mark_failed_without_error(): void
    {
        $this->call->markFailed();

        $this->assertEquals('failed', $this->call->getStatus());
        $this->assertEquals([], $this->call->getContext());
    }

    public function test_mark_transferred(): void
    {
        $this->call->markTransferred();
        $this->assertEquals('transferred', $this->call->getStatus());
    }

    public function test_set_duration(): void
    {
        $this->call->setDurationSeconds(120);
        $this->assertEquals(120, $this->call->getDurationSeconds());
    }

    public function test_set_current_step(): void
    {
        $this->call->setCurrentStep('step_2');
        $this->assertEquals('step_2', $this->call->getCurrentStep());
    }

    public function test_update_context_merges_data(): void
    {
        $this->call->updateContext(['user_name' => 'Alice']);

        $this->assertEquals(['user_name' => 'Alice'], $this->call->getContext());

        $this->call->updateContext(['user_email' => 'alice@test.com']);

        $this->assertEquals([
            'user_name' => 'Alice',
            'user_email' => 'alice@test.com',
        ], $this->call->getContext());
    }

    public function test_set_context_overwrites(): void
    {
        $this->call->setContext(['key' => 'value']);

        $this->assertEquals(['key' => 'value'], $this->call->getContext());
    }

    public function test_recording_path_can_be_set_and_retrieved(): void
    {
        $this->assertNull($this->call->getRecordingPath());

        $this->call->setRecordingPath('tenants/tenant-1/calls/test-call-id.enc');

        $this->assertEquals('tenants/tenant-1/calls/test-call-id.enc', $this->call->getRecordingPath());
    }
}
