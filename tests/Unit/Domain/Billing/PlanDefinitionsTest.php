<?php

namespace Tests\Unit\Domain\Billing;

use App\Domain\Billing\PlanDefinitions;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PlanDefinitionsTest extends TestCase
{
    #[Test]
    public function all_returns_three_plans(): void
    {
        $plans = PlanDefinitions::all();

        $this->assertCount(3, $plans);
    }

    #[Test]
    public function all_includes_free_pro_enterprise(): void
    {
        $ids = array_column(PlanDefinitions::all(), 'id');

        $this->assertContains('free', $ids);
        $this->assertContains('pro', $ids);
        $this->assertContains('enterprise', $ids);
    }

    #[Test]
    public function each_plan_has_required_keys(): void
    {
        foreach (PlanDefinitions::all() as $plan) {
            $this->assertArrayHasKey('id', $plan);
            $this->assertArrayHasKey('name', $plan);
            $this->assertArrayHasKey('price', $plan);
            $this->assertArrayHasKey('calls', $plan);
            $this->assertArrayHasKey('flows', $plan);
            $this->assertArrayHasKey('team', $plan);
            $this->assertArrayHasKey('features', $plan);
            $this->assertIsArray($plan['features']);
        }
    }

    #[Test]
    public function find_returns_plan_by_id(): void
    {
        $plan = PlanDefinitions::find('pro');

        $this->assertNotNull($plan);
        $this->assertSame('Pro', $plan['name']);
        $this->assertSame('$29', $plan['price']);
    }

    #[Test]
    public function find_returns_null_for_invalid_id(): void
    {
        $this->assertNull(PlanDefinitions::find('nonexistent'));
    }

    #[Test]
    public function free_plan_has_zero_price(): void
    {
        $plan = PlanDefinitions::find('free');

        $this->assertSame('$0', $plan['price']);
    }

    #[Test]
    public function enterprise_has_unlimited_team(): void
    {
        $plan = PlanDefinitions::find('enterprise');

        $this->assertSame('Unlimited users', $plan['team']);
    }

    #[Test]
    public function pro_has_webhook_and_rag_features(): void
    {
        $plan = PlanDefinitions::find('pro');

        $this->assertContains('Webhook destinations', $plan['features']);
        $this->assertContains('Knowledge base (RAG)', $plan['features']);
    }
}
