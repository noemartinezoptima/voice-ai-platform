<?php

namespace Tests\Feature\Web;

use App\Domain\Flow\Services\FlowTemplates;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FlowTemplateTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_create_page_returns_templates(): void
    {
        $this->actingAs($this->user)
            ->get('/flows/create')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Flows/Create')
                ->has('templates', 8)
            );
    }

    public function test_create_from_template_stores_flow_with_template_config(): void
    {
        $response = $this->actingAs($this->user)->post('/flows', [
            'name' => 'My Support Flow',
            'description' => 'From template',
            'template_id' => 'customer-support',
            'is_active' => true,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('flows', [
            'name' => 'My Support Flow',
            'description' => 'From template',
        ]);

        $flow = FlowModel::where('name', 'My Support Flow')->first();
        $this->assertNotNull($flow);
        $this->assertEquals('welcome', $flow->config['start_step']);
    }

    public function test_create_without_template_uses_default_config(): void
    {
        $response = $this->actingAs($this->user)->post('/flows', [
            'name' => 'Blank Flow',
            'is_active' => true,
        ]);

        $response->assertRedirect();

        $flow = FlowModel::where('name', 'Blank Flow')->first();
        $this->assertNotNull($flow);
        $this->assertEquals('s1', $flow->config['start_step']);
    }

    public function test_templates_have_valid_structure(): void
    {
        foreach (FlowTemplates::all() as $template) {
            $this->assertArrayHasKey('id', $template);
            $this->assertArrayHasKey('name', $template);
            $this->assertArrayHasKey('config', $template);
            $this->assertArrayHasKey('start_step', $template['config']);
            $this->assertArrayHasKey('steps', $template['config']);
            $this->assertNotEmpty($template['config']['steps']);
        }
    }
}
