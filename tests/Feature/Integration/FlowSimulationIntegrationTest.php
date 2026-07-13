<?php

namespace Tests\Feature\Integration;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\FlowSimulator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** @group integration */
class FlowSimulationIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_flow_simulator_processes_complete_flow(): void
    {
        $config = [
            'start_step' => 'welcome',
            'steps' => [
                'welcome' => ['id' => 'welcome', 'type' => 'say', 'config' => ['text' => 'Welcome!'], 'next' => 'ask_menu'],
                'ask_menu' => ['id' => 'ask_menu', 'type' => 'ask', 'config' => ['prompt' => 'Press 1'], 'next' => 'route_menu'],
                'route_menu' => ['id' => 'route_menu', 'type' => 'condition', 'config' => [
                    'branches' => [['label' => 'Support', 'expression' => "input === '1'", 'next' => 'support']],
                    'elseNext' => 'goodbye',
                ]],
                'support' => ['id' => 'support', 'type' => 'say', 'config' => ['text' => 'Connecting to support'], 'next' => 'goodbye'],
                'goodbye' => ['id' => 'goodbye', 'type' => 'hangup', 'config' => []],
            ],
        ];

        $simulator = new FlowSimulator;
        $results = $simulator->simulate(\App\Domain\Flow\ValueObjects\FlowConfig::fromArray($config));

        $this->assertGreaterThan(2, count($results));
        $this->assertEquals('say', $results[0]['type']);
        $this->assertEquals('hangup', $results[count($results) - 1]['type']);
    }

    public function test_flow_simulator_detects_loops(): void
    {
        $config = [
            'start_step' => 'a',
            'steps' => [
                'a' => ['id' => 'a', 'type' => 'say', 'config' => ['text' => 'Hello'], 'next' => 'b'],
                'b' => ['id' => 'b', 'type' => 'say', 'config' => ['text' => 'Back'], 'next' => 'a'],
            ],
        ];

        $simulator = new FlowSimulator;
        $results = $simulator->simulate(\App\Domain\Flow\ValueObjects\FlowConfig::fromArray($config));

        $lastResult = $results[count($results) - 1];
        $this->assertStringContainsString('loop', strtolower($lastResult['error'] ?? ''));
    }

    public function test_flow_simulator_handles_missing_start_step(): void
    {
        $config = [
            'start_step' => 'nonexistent',
            'steps' => ['dummy' => ['id' => 'dummy', 'type' => 'say', 'config' => ['text' => 'x']]],
        ];

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('not found');

        $simulator = new FlowSimulator;
        $simulator->simulate(\App\Domain\Flow\ValueObjects\FlowConfig::fromArray($config));
    }
}
