<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_login(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'account_type' => 'user',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['data' => ['user' => ['public_id'], 'token']]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $login->assertOk()
            ->assertJsonStructure(['data' => ['token']]);

        $this->assertNotNull(User::where('email', 'jane@example.com')->first()?->last_login_at);
    }
}
