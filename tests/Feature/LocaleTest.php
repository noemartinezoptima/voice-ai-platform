<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_locale_switch_sets_session(): void
    {
        $this->get('/locale/es')
            ->assertRedirect();

        $this->assertEquals('es', session('locale'));
    }

    public function test_locale_switch_rejects_invalid_locale(): void
    {
        $this->get('/locale/fr')
            ->assertRedirect();

        $this->assertNotEquals('fr', session('locale'));
    }
}
