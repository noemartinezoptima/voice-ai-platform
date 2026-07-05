<?php

namespace Tests\Unit\Domain\Tenant;

use App\Domain\Tenant\Entities\Tenant;
use PHPUnit\Framework\TestCase;

class TenantEntityTest extends TestCase
{
    private Tenant $tenant;

    protected function setUp(): void
    {
        $this->tenant = new Tenant(
            id: 'tenant-1',
            name: 'Acme Corp',
            slug: 'acme-corp',
            settings: ['timezone' => 'UTC'],
            isActive: true,
        );
    }

    public function test_getters(): void
    {
        $this->assertEquals('tenant-1', $this->tenant->getId());
        $this->assertEquals('Acme Corp', $this->tenant->getName());
        $this->assertEquals('acme-corp', $this->tenant->getSlug());
        $this->assertEquals(['timezone' => 'UTC'], $this->tenant->getSettings());
        $this->assertTrue($this->tenant->isActive());
    }

    public function test_shorthand_getters(): void
    {
        $this->assertEquals($this->tenant->getId(), $this->tenant->id());
        $this->assertEquals($this->tenant->getName(), $this->tenant->name());
    }

    public function test_update_settings(): void
    {
        $this->tenant->updateSettings(['locale' => 'es']);

        $this->assertEquals(['locale' => 'es'], $this->tenant->getSettings());
    }

    public function test_inactive_tenant(): void
    {
        $tenant = new Tenant(
            id: 'tenant-2',
            name: 'Inactive',
            slug: 'inactive',
            isActive: false,
        );

        $this->assertFalse($tenant->isActive());
    }

    public function test_default_settings_is_empty(): void
    {
        $tenant = new Tenant(
            id: 'tenant-3',
            name: 'Empty',
            slug: 'empty',
        );

        $this->assertEquals([], $tenant->getSettings());
    }
}
