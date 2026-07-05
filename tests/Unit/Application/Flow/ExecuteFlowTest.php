<?php

namespace Tests\Unit\Application\Flow;

use App\Application\Flow\UseCases\ExecuteFlow;
use App\Domain\Call\Entities\Call;
use App\Domain\Call\ValueObjects\CallSid;
use App\Domain\Call\ValueObjects\PhoneNumber;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\Services\AiServiceInterface;
use App\Domain\Flow\ValueObjects\FlowConfig;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class ExecuteFlowTest extends TestCase
{
    private ExecuteFlow $executeFlow;

    private AiServiceInterface $aiService;

    protected function setUp(): void
    {
        $this->aiService = new class implements AiServiceInterface
        {
            public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
            {
                return 'This is a mock AI response.';
            }
        };

        $this->executeFlow = new ExecuteFlow($this->aiService);
    }

    private function makeCall(string $from = '+12345678901', string $to = '+19876543210'): Call
    {
        return new Call(
            id: 'call-1',
            tenantId: 'tenant-1',
            flowId: 'flow-1',
            callSid: new CallSid('CA'.str_repeat('a', 32)),
            fromNumber: new PhoneNumber($from),
            toNumber: new PhoneNumber($to),
        );
    }

    private function makeFlow(array $steps): Flow
    {
        $config = FlowConfig::fromArray([
            'start_step' => 's1',
            'steps' => $steps,
        ]);

        return new Flow(
            id: 'flow-1',
            tenantId: 'tenant-1',
            name: 'Test Flow',
            description: null,
            phoneNumber: '+19876543210',
            config: $config,
        );
    }

    public function test_run_say_step(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hello'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertArrayHasKey('results', $result);
        $this->assertArrayHasKey('variables', $result);
        $this->assertCount(2, $result['results']);
        $this->assertEquals('say', $result['results'][0]->type->value);
    }

    public function test_run_llm_step(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'llm', 'config' => ['system_prompt' => 'You are a bot'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertEquals('llm', $result['results'][0]->type->value);
        $this->assertEquals('This is a mock AI response.', $result['results'][0]->output);
        $this->assertEquals('This is a mock AI response.', $result['variables']['llm_response']);
    }

    public function test_run_llm_stores_custom_variable(): void
    {
        $flow = $this->makeFlow([
            's1' => [
                'id' => 's1',
                'type' => 'llm',
                'config' => ['response_variable' => 'greeting'],
                'next' => 'hangup',
            ],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertEquals('This is a mock AI response.', $result['variables']['greeting']);
    }

    public function test_run_condition_true(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'condition', 'config' => ['if' => '{{true}}', 'goto' => 'true_branch', 'else' => 'false_branch']],
            'true_branch' => ['id' => 'true_branch', 'type' => 'say', 'config' => ['text' => 'True'], 'next' => 'hangup'],
            'false_branch' => ['id' => 'false_branch', 'type' => 'say', 'config' => ['text' => 'False'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertEquals('true_branch', $result['results'][1]->stepId);
    }

    public function test_run_condition_false(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'condition', 'config' => ['if' => '{{false}}', 'goto' => 'true_branch', 'else' => 'false_branch']],
            'true_branch' => ['id' => 'true_branch', 'type' => 'say', 'config' => ['text' => 'True'], 'next' => 'hangup'],
            'false_branch' => ['id' => 'false_branch', 'type' => 'say', 'config' => ['text' => 'False'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertEquals('false_branch', $result['results'][1]->stepId);
    }

    public function test_run_hangup_ends_flow(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertCount(1, $result['results']);
        $this->assertEquals('hangup', $result['results'][0]->type->value);
    }

    public function test_run_goto_jumps_to_target(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'goto', 'config' => ['step_id' => 's3']],
            's2' => ['id' => 's2', 'type' => 'say', 'config' => ['text' => 'Skip'], 'next' => 'hangup'],
            's3' => ['id' => 's3', 'type' => 'say', 'config' => ['text' => 'Jumped'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertCount(3, $result['results']);
        $this->assertEquals('Jumped', $result['results'][1]->output);
    }

    public function test_run_transfer_ends_flow(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'transfer', 'config' => ['target' => '+12345678901']],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertCount(1, $result['results']);
        $this->assertEquals('transfer', $result['results'][0]->type->value);
    }

    public function test_run_throws_on_missing_step(): void
    {
        $this->expectException(\RuntimeException::class);

        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hi'], 'next' => 'nonexistent'],
        ]);

        $this->executeFlow->run($flow, $this->makeCall());
    }

    public function test_run_throws_on_no_start_step(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $config = FlowConfig::fromArray([
            'start_step' => 's1',
            'steps' => ['other' => ['type' => 'say']],
        ]);

        $flow = new Flow(
            id: 'flow-1',
            tenantId: 'tenant-1',
            name: 'Broken',
            description: null,
            phoneNumber: null,
            config: $config,
        );

        $this->executeFlow->run($flow, $this->makeCall());
    }

    public function test_initial_variables_accessible(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'condition', 'config' => ['if' => '{{call_sid exists}}', 'goto' => 'yes', 'else' => 'no']],
            'yes' => ['id' => 'yes', 'type' => 'say', 'config' => ['text' => 'Found'], 'next' => 'hangup'],
            'no' => ['id' => 'no', 'type' => 'say', 'config' => ['text' => 'Missing'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertEquals('yes', $result['results'][1]->stepId);
    }

    public function test_variable_resolution_in_config(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hello {{agent_name}}'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertEquals('Hello AI Assistant', $result['results'][0]->output);
    }

    public function test_run_returns_transcript(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hello'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertArrayHasKey('transcript', $result);
        $this->assertCount(2, $result['transcript']);
        $this->assertEquals('say', $result['transcript'][0]['type']);
        $this->assertEquals('hangup', $result['transcript'][1]['type']);
    }

    public function test_run_ask_step(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'ask', 'config' => ['prompt' => 'What is your name?', 'variable' => 'user_name'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertEquals('ask', $result['results'][0]->type->value);
        $this->assertEquals('What is your name?', $result['results'][0]->output);
    }

    public function test_run_mcp_tool_step(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'mcp_tool', 'config' => ['tool' => 'get_weather', 'params' => ['city' => 'Madrid']], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $result = $this->executeFlow->run($flow, $this->makeCall());

        $this->assertEquals('mcp_tool', $result['results'][0]->type->value);
        $this->assertNotNull($result['variables']['mcp_result']);
    }
}
