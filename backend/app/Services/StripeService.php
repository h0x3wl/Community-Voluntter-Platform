<?php

namespace App\Services;

use Stripe\StripeClient;
use Stripe\Webhook;
use Stripe\Event;

class StripeService
{
    public function __construct(private readonly StripeClient $client)
    {
    }

    public static function make(): self
    {
        return new self(new StripeClient(config('services.stripe.secret') ?? 'sk_test_mock'));
    }

    public function createPaymentIntent(int $amountCents, string $currency, array $metadata): array
    {
        $intent = $this->client->paymentIntents->create([
            'amount' => $amountCents,
            'currency' => strtolower($currency),
            'metadata' => $metadata,
            'automatic_payment_methods' => [
                'enabled' => true,
                'allow_redirects' => 'never',
            ],
        ]);

        return [
            'id' => $intent->id,
            'client_secret' => $intent->client_secret,
        ];
    }

    public function constructEvent(string $payload, string $signature): Event
    {
        $secret = config('services.stripe.webhook_secret');

        return Webhook::constructEvent($payload, $signature, $secret);
    }
}
