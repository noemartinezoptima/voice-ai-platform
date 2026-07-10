<?php

namespace Tests\Feature\Application\Call\UseCases;

use App\Application\Call\DTOs\InboundCallData;
use App\Application\Call\UseCases\HandleInboundCall;
use App\Domain\Call\Repositories\CallRepositoryInterface;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\Repositories\FlowRepositoryInterface;
use App\Domain\Flow\ValueObjects\FlowConfig;
use App\Domain\Tenant\Entities\Tenant;
use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HandleInboundCallTest extends TestCase
{
    use RefreshDatabase;

    private HandleInboundCall $useCase;

    private CallRepositoryInterface $calls;

    private TenantRepositoryInterface $tenants;

    private FlowRepositoryInterface $flows;

    protected function setUp(): void
    {
        parent::setUp();

        $this->calls = $this->createMock(CallRepositoryInterface::class);
        $this->tenants = $this->createMock(TenantRepositoryInterface::class);
        $this->flows = $this->createMock(FlowRepositoryInterface::class);

        $this->useCase = new HandleInboundCall(
            $this->calls,
            $this->tenants,
            $this->flows,
        );
    }

    public function test_executes_with_flow_id(): void
    {
        $config = FlowConfig::fromArray(['start_step' => 'start', 'steps' => ['start' => ['type' => 'say', 'config' => ['text' => 'Hi']]]]);
        $flow = new Flow('flow-1', 'tenant-1', 'Test Flow', null, null, $config, true, 1);

        $tenant = new Tenant('tenant-1', 'Test Tenant', 'test-tenant', [], true);

        $this->flows->method('findById')->willReturn($flow);
        $this->tenants->method('findById')->willReturn($tenant);
        $this->calls->expects($this->once())->method('save');

        $data = new InboundCallData(callSid: 'CA'.str_repeat('a', 32), fromNumber: '+15551111111', toNumber: '+15552222222', flowId: 'flow-1');

        $call = $this->useCase->execute($data);

        $this->assertSame('in_progress', $call->status());
        $this->assertSame('flow-1', $call->flowId());
    }

    public function test_resolves_flow_by_phone_number(): void
    {
        $config = FlowConfig::fromArray(['start_step' => 'start', 'steps' => ['start' => ['type' => 'say', 'config' => ['text' => 'Hi']]]]);
        $flow = new Flow('flow-2', 'tenant-1', 'Phone Flow', null, null, $config, true, 1);

        $tenant = new Tenant('tenant-1', 'Test Tenant', 'test-tenant', [], true);

        $this->flows->method('findByPhoneNumber')->willReturn($flow);
        $this->tenants->method('findById')->willReturn($tenant);
        $this->calls->expects($this->once())->method('save');

        $data = new InboundCallData('CA'.str_repeat('b', 32), '+15551111111', '+15552222222');

        $call = $this->useCase->execute($data);

        $this->assertSame('in_progress', $call->status());
    }

    public function test_throws_on_inactive_tenant(): void
    {
        $tenant = new Tenant('tenant-1', 'Inactive', 'inactive', [], false);

        $this->flows->method('findById')->willReturn(null);
        $this->tenants->method('findById')->willReturn($tenant);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Tenant not found or inactive');

        $data = new InboundCallData('CA'.str_repeat('c', 32), '+15551111111', '+15552222222');

        $this->useCase->execute($data);
    }
}
