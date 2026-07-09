<?php

namespace App\Domain\Billing;

class PlanDefinitions
{
    /** @return array<int, array{id: string, name: string, price: string, calls: string, flows: string, team: string, features: array<int, string>}> */
    public static function all(): array
    {
        return [
            [
                'id' => 'free',
                'name' => 'Free',
                'price' => '$0',
                'calls' => '100 calls/mo',
                'flows' => 'Up to 3',
                'team' => '1 user',
                'features' => [
                    'Basic flow builder',
                    'Voice & SMS channels',
                    'Email support',
                ],
            ],
            [
                'id' => 'pro',
                'name' => 'Pro',
                'price' => '$29',
                'calls' => '5,000 calls/mo',
                'flows' => 'Unlimited',
                'team' => 'Up to 5 users',
                'features' => [
                    'Advanced flow builder',
                    'AI agent integration',
                    'Knowledge base (RAG)',
                    'Webhook destinations',
                    'Priority support',
                ],
            ],
            [
                'id' => 'enterprise',
                'name' => 'Enterprise',
                'price' => '$99',
                'calls' => '50,000 calls/mo',
                'flows' => 'Unlimited',
                'team' => 'Unlimited users',
                'features' => [
                    'Everything in Pro',
                    'Custom integrations',
                    'Dedicated support',
                    'SLA guarantee',
                    'Onboarding assistance',
                ],
            ],
        ];
    }

    /** @return array<string, mixed>|null */
    public static function find(string $id): ?array
    {
        foreach (self::all() as $plan) {
            if ($plan['id'] === $id) {
                return $plan;
            }
        }

        return null;
    }
}
