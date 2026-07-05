<?php

namespace App\Domain\Flow\Services;

class FlowTemplates
{
    /** @return array<int, array{id: string, name: string, description: string, icon: string, config: array{start_step: string, steps: array<string, array<string, mixed>>}}> */
    public static function all(): array
    {
        return [
            self::customerSupport(),
            self::appointmentReminder(),
            self::survey(),
            self::ivrMenu(),
            self::aiAssistant(),
        ];
    }

    /** @return array{id: string, name: string, description: string, icon: string, config: array{start_step: string, steps: array<string, array<string, mixed>>}} */
    public static function customerSupport(): array
    {
        return [
            'id' => 'customer-support',
            'name' => 'Customer Support',
            'description' => 'AI-powered support with knowledge base lookup and optional human transfer.',
            'icon' => 'Headset',
            'config' => [
                'start_step' => 'welcome',
                'steps' => [
                    'welcome' => ['id' => 'welcome', 'type' => 'say', 'config' => ['text' => 'Thank you for calling. How can I help you today?'], 'next' => 'llm_response'],
                    'llm_response' => ['id' => 'llm_response', 'type' => 'llm', 'config' => ['systemPrompt' => 'You are a helpful customer support agent. Answer the caller question concisely.', 'userPromptTemplate' => '', 'model' => 'gpt-4o'], 'next' => 'transfer_check'],
                    'transfer_check' => ['id' => 'transfer_check', 'type' => 'condition', 'config' => ['branches' => [['label' => 'Transfer', 'expression' => '{{transfer == true}}', 'next' => 'transfer_human']], 'elseNext' => 'end'], 'next' => null],
                    'transfer_human' => ['id' => 'transfer_human', 'type' => 'transfer', 'config' => ['destination' => 'number', 'value' => '']],
                    'end' => ['id' => 'end', 'type' => 'say', 'config' => ['text' => 'Thanks for calling. Have a great day!'], 'next' => 'hangup_step'],
                    'hangup_step' => ['id' => 'hangup_step', 'type' => 'hangup', 'config' => []],
                ],
            ],
        ];
    }

    /** @return array{id: string, name: string, description: string, icon: string, config: array{start_step: string, steps: array<string, array<string, mixed>>}} */
    public static function appointmentReminder(): array
    {
        return [
            'id' => 'appointment-reminder',
            'name' => 'Appointment Reminder',
            'description' => 'Remind callers of upcoming appointments with confirmation options.',
            'icon' => 'Calendar',
            'config' => [
                'start_step' => 'greeting',
                'steps' => [
                    'greeting' => ['id' => 'greeting', 'type' => 'say', 'config' => ['text' => 'Hello, this is a reminder about your upcoming appointment.'], 'next' => 'confirm'],
                    'confirm' => ['id' => 'confirm', 'type' => 'ask', 'config' => ['prompt' => 'Press 1 to confirm, press 2 to reschedule, or press 3 to cancel.', 'inputType' => 'dtmf', 'variable' => 'response', 'timeoutSec' => 10], 'next' => 'handle'],
                    'handle' => ['id' => 'handle', 'type' => 'condition', 'config' => ['branches' => [['label' => 'Confirmed', 'expression' => '{{response == 1}}', 'next' => 'confirmed_msg'], ['label' => 'Reschedule', 'expression' => '{{response == 2}}', 'next' => 'reschedule_msg'], ['label' => 'Cancel', 'expression' => '{{response == 3}}', 'next' => 'cancelled_msg']], 'elseNext' => 'error_msg'], 'next' => null],
                    'confirmed_msg' => ['id' => 'confirmed_msg', 'type' => 'say', 'config' => ['text' => 'Your appointment is confirmed. Thank you!'], 'next' => 'hangup_step'],
                    'reschedule_msg' => ['id' => 'reschedule_msg', 'type' => 'say', 'config' => ['text' => 'We will contact you to reschedule.'], 'next' => 'hangup_step'],
                    'cancelled_msg' => ['id' => 'cancelled_msg', 'type' => 'say', 'config' => ['text' => 'Your appointment has been cancelled.'], 'next' => 'hangup_step'],
                    'error_msg' => ['id' => 'error_msg', 'type' => 'say', 'config' => ['text' => 'Sorry, I did not understand your response.'], 'next' => 'hangup_step'],
                    'hangup_step' => ['id' => 'hangup_step', 'type' => 'hangup', 'config' => []],
                ],
            ],
        ];
    }

    /** @return array{id: string, name: string, description: string, icon: string, config: array{start_step: string, steps: array<string, array<string, mixed>>}} */
    public static function survey(): array
    {
        return [
            'id' => 'survey',
            'name' => 'Customer Survey',
            'description' => 'Collect feedback with satisfaction ratings and open-ended responses.',
            'icon' => 'ClipboardList',
            'config' => [
                'start_step' => 'intro',
                'steps' => [
                    'intro' => ['id' => 'intro', 'type' => 'say', 'config' => ['text' => 'We value your feedback. This survey will take about 2 minutes.'], 'next' => 'q1'],
                    'q1' => ['id' => 'q1', 'type' => 'ask', 'config' => ['prompt' => 'On a scale of 1 to 5, how satisfied are you with our service? Press 1 for very dissatisfied, up to 5 for very satisfied.', 'inputType' => 'dtmf', 'variable' => 'satisfaction', 'timeoutSec' => 10], 'next' => 'q2'],
                    'q2' => ['id' => 'q2', 'type' => 'ask', 'config' => ['prompt' => 'Please tell us how we could improve. Speak after the beep.', 'inputType' => 'speech', 'variable' => 'feedback', 'timeoutSec' => 15], 'next' => 'thank'],
                    'thank' => ['id' => 'thank', 'type' => 'say', 'config' => ['text' => 'Thank you for your feedback!'], 'next' => 'hangup_step'],
                    'hangup_step' => ['id' => 'hangup_step', 'type' => 'hangup', 'config' => []],
                ],
            ],
        ];
    }

    /** @return array{id: string, name: string, description: string, icon: string, config: array{start_step: string, steps: array<string, array<string, mixed>>}} */
    public static function ivrMenu(): array
    {
        return [
            'id' => 'ivr-menu',
            'name' => 'IVR Menu',
            'description' => 'Multi-level phone menu routing callers to departments.',
            'icon' => 'Menu',
            'config' => [
                'start_step' => 'menu',
                'steps' => [
                    'menu' => ['id' => 'menu', 'type' => 'ask', 'config' => ['prompt' => 'Press 1 for Sales, 2 for Support, 3 for Billing, or 4 to speak with reception.', 'inputType' => 'dtmf', 'variable' => 'choice', 'timeoutSec' => 10], 'next' => 'route'],
                    'route' => ['id' => 'route', 'type' => 'condition', 'config' => ['branches' => [['label' => 'Sales', 'expression' => '{{choice == 1}}', 'next' => 'sales'], ['label' => 'Support', 'expression' => '{{choice == 2}}', 'next' => 'support'], ['label' => 'Billing', 'expression' => '{{choice == 3}}', 'next' => 'billing'], ['label' => 'Reception', 'expression' => '{{choice == 4}}', 'next' => 'reception']], 'elseNext' => 'invalid'], 'next' => null],
                    'sales' => ['id' => 'sales', 'type' => 'say', 'config' => ['text' => 'Transferring you to Sales.'], 'next' => 'transfer_sales'],
                    'transfer_sales' => ['id' => 'transfer_sales', 'type' => 'transfer', 'config' => ['destination' => 'number', 'value' => '']],
                    'support' => ['id' => 'support', 'type' => 'say', 'config' => ['text' => 'Transferring you to Support.'], 'next' => 'transfer_support'],
                    'transfer_support' => ['id' => 'transfer_support', 'type' => 'transfer', 'config' => ['destination' => 'number', 'value' => '']],
                    'billing' => ['id' => 'billing', 'type' => 'say', 'config' => ['text' => 'Transferring you to Billing.'], 'next' => 'transfer_billing'],
                    'transfer_billing' => ['id' => 'transfer_billing', 'type' => 'transfer', 'config' => ['destination' => 'number', 'value' => '']],
                    'reception' => ['id' => 'reception', 'type' => 'say', 'config' => ['text' => 'Transferring you to Reception.'], 'next' => 'transfer_reception'],
                    'transfer_reception' => ['id' => 'transfer_reception', 'type' => 'transfer', 'config' => ['destination' => 'number', 'value' => '']],
                    'invalid' => ['id' => 'invalid', 'type' => 'say', 'config' => ['text' => 'Sorry, that is not a valid option.'], 'next' => 'menu'],
                ],
            ],
        ];
    }

    /** @return array{id: string, name: string, description: string, icon: string, config: array{start_step: string, steps: array<string, array<string, mixed>>}} */
    public static function aiAssistant(): array
    {
        return [
            'id' => 'ai-assistant',
            'name' => 'AI Voice Assistant',
            'description' => 'Open-ended AI conversation with knowledge base access and webhook integration.',
            'icon' => 'Bot',
            'config' => [
                'start_step' => 'welcome',
                'steps' => [
                    'welcome' => ['id' => 'welcome', 'type' => 'say', 'config' => ['text' => 'Hello, I am your AI assistant. How can I help you today?'], 'next' => 'ai_loop'],
                    'ai_loop' => ['id' => 'ai_loop', 'type' => 'llm', 'config' => ['systemPrompt' => 'You are a helpful AI voice assistant. Be concise and friendly. If the caller mentions specific topics, ask clarifying questions.', 'userPromptTemplate' => '', 'model' => 'gpt-4o'], 'next' => 'gather_input'],
                    'gather_input' => ['id' => 'gather_input', 'type' => 'ask', 'config' => ['prompt' => '', 'inputType' => 'speech', 'variable' => 'user_input', 'timeoutSec' => 10], 'next' => 'ai_loop'],
                ],
            ],
        ];
    }
}
