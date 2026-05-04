<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DonationIntentTest extends TestCase
{
    use RefreshDatabase;

    public function test_donation_intent_creates_donation(): void
    {
        $this->app->instance(StripeService::class, new class extends StripeService {
            public function __construct() {}
            public function createPaymentIntent(int $amountCents, string $currency, array $metadata): array
            {
                return ['id' => 'pi_test', 'client_secret' => 'secret'];
            }
        });

        Organization::create([
            'public_id' => Str::uuid(),
            'name' => 'Hope Org',
            'slug' => 'hope-org',
            'status' => 'approved',
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/donations/intent', [
            'amount_cents' => 2500,
            'currency' => 'USD',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.client_secret', 'secret');
    }
}
