<?php

namespace Tests\Feature;

use App\Models\Donation;
use App\Models\Organization;
use App\Models\RewardRule;
use App\Models\StripeWebhookEvent;
use App\Models\User;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_is_idempotent(): void
    {
        $user = User::factory()->create();
        $org = Organization::create([
            'public_id' => Str::uuid(),
            'name' => 'Hope Org',
            'slug' => 'hope-org',
            'status' => 'approved',
        ]);

        RewardRule::create([
            'code' => 'donation_points',
            'config' => ['points_per_usd' => 1],
            'is_active' => true,
        ]);

        $donation = Donation::create([
            'public_id' => Str::uuid(),
            'organization_id' => $org->id,
            'donor_user_id' => $user->id,
            'amount_cents' => 1000,
            'currency' => 'USD',
            'status' => 'processing',
            'stripe_payment_intent_id' => 'pi_test',
        ]);

        $this->app->instance(StripeService::class, new class extends StripeService {
            public function __construct() {}
            public function constructEvent(string $payload, string $signature): object
            {
                return new class {
                    public string $id = 'evt_test';
                    public string $type = 'payment_intent.succeeded';
                    public object $data;

                    public function __construct()
                    {
                        $this->data = (object) [
                            'object' => (object) [
                                'id' => 'pi_test',
                                'charges' => (object) ['data' => [(object) ['id' => 'ch_test']]],
                            ],
                        ];
                    }

                    public function toArray(): array
                    {
                        return ['id' => 'evt_test'];
                    }
                };
            }
        });

        $this->postJson('/api/v1/stripe/webhook', [], ['Stripe-Signature' => 'sig'])
            ->assertOk();

        $this->postJson('/api/v1/stripe/webhook', [], ['Stripe-Signature' => 'sig'])
            ->assertOk();

        $this->assertEquals(1, StripeWebhookEvent::count());
        $this->assertEquals('succeeded', $donation->refresh()->status);
    }
}
