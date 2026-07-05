<?php

namespace Tests\Feature\Console\Commands;

use Tests\TestCase;

class RegisterTwilioAiAssistantTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
