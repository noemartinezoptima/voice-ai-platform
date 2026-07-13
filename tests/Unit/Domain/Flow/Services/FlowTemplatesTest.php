<?php

namespace Tests\Unit\Domain\Flow\Services;

use App\Domain\Flow\Services\FlowTemplates;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FlowTemplatesTest extends TestCase
{
    #[Test]
    public function all_returns_five_templates(): void
    {
        $this->assertCount(8, FlowTemplates::all());
    }

    #[Test]
    public function each_template_has_required_keys(): void
    {
        foreach (FlowTemplates::all() as $template) {
            $this->assertArrayHasKey('id', $template);
            $this->assertArrayHasKey('name', $template);
            $this->assertArrayHasKey('description', $template);
            $this->assertArrayHasKey('icon', $template);
            $this->assertArrayHasKey('config', $template);
            $this->assertArrayHasKey('start_step', $template['config']);
            $this->assertArrayHasKey('steps', $template['config']);
            $this->assertIsArray($template['config']['steps']);
        }
    }

    #[Test]
    public function customer_support_has_expected_structure(): void
    {
        $template = FlowTemplates::customerSupport();

        $this->assertSame('customer-support', $template['id']);
        $this->assertSame('welcome', $template['config']['start_step']);
        $this->assertArrayHasKey('welcome', $template['config']['steps']);
        $this->assertArrayHasKey('llm_response', $template['config']['steps']);
        $this->assertArrayHasKey('transfer_check', $template['config']['steps']);
        $this->assertArrayHasKey('end', $template['config']['steps']);
        $this->assertArrayHasKey('hangup_step', $template['config']['steps']);
    }

    #[Test]
    public function appointment_reminder_uses_dtmf(): void
    {
        $template = FlowTemplates::appointmentReminder();

        $this->assertSame('appointment-reminder', $template['id']);
        $this->assertSame('dtmf', $template['config']['steps']['confirm']['config']['inputType']);
    }

    #[Test]
    public function survey_has_speech_input(): void
    {
        $template = FlowTemplates::survey();

        $this->assertSame('survey', $template['id']);
        $this->assertSame('speech', $template['config']['steps']['q2']['config']['inputType']);
    }

    #[Test]
    public function ivr_menu_has_transfer_steps(): void
    {
        $template = FlowTemplates::ivrMenu();

        $this->assertSame('ivr-menu', $template['id']);
        $this->assertCount(4, $template['config']['steps']['route']['config']['branches']);
        $this->assertArrayHasKey('transfer_sales', $template['config']['steps']);
        $this->assertArrayHasKey('transfer_support', $template['config']['steps']);
    }

    #[Test]
    public function ai_assistant_has_llm_loop(): void
    {
        $template = FlowTemplates::aiAssistant();

        $this->assertSame('ai-assistant', $template['id']);
        $this->assertSame('llm', $template['config']['steps']['ai_loop']['type']);
        $this->assertSame('gpt-4o', $template['config']['steps']['ai_loop']['config']['model']);
    }

    #[Test]
    public function all_templates_have_unique_ids(): void
    {
        $ids = array_column(FlowTemplates::all(), 'id');
        $this->assertSame($ids, array_unique($ids));
    }

    #[Test]
    public function every_step_type_is_valid(): void
    {
        $validTypes = ['say', 'llm', 'condition', 'transfer', 'ask', 'hangup', 'knowledge', 'webhook'];

        foreach (FlowTemplates::all() as $template) {
            foreach ($template['config']['steps'] as $step) {
                $this->assertContains($step['type'], $validTypes, "Invalid step type: {$step['type']}");
            }
        }
    }
}
