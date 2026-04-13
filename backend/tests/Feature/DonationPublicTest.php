<?php

namespace Tests\Feature;

use App\Models\Donation;
use App\Models\Organization;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DonationPublicTest extends TestCase
{
    use RefreshDatabase;

    public function test_anonymous_donation_intent_without_auth(): void
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

        $response = $this->postJson('/api/v1/donations/intent', [
            'amount_cents' => 2500,
            'currency' => 'USD',
            'anonymous' => true,
            'donor_name' => 'Anonymous Donor',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.client_secret', 'secret');
    }

    public function test_anonymous_receipt_is_public(): void
    {
        $org = Organization::create([
            'public_id' => Str::uuid(),
            'name' => 'Hope Org',
            'slug' => 'hope-org',
            'status' => 'approved',
        ]);

        $donation = Donation::create([
            'public_id' => Str::uuid(),
            'organization_id' => $org->id,
            'amount_cents' => 1000,
            'currency' => 'USD',
            'status' => 'succeeded',
        ]);

        $this->getJson('/api/v1/donations/' . $donation->public_id)
            ->assertOk()
            ->assertJsonPath('data.public_id', $donation->public_id);
    }
}
