<?php

namespace App\Http\Controllers\Api;

use App\Models\Donation;
use App\Models\StripeWebhookEvent;
use App\Services\DonationService;
use App\Services\StripeService;
use Illuminate\Http\Request;

class StripeWebhookController extends ApiController
{
    public function __construct(
        private readonly StripeService $stripe,
        private readonly DonationService $donationService,
    ) {
    }

    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        try {
            $event = $this->stripe->constructEvent($payload, $signature);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        $stored = StripeWebhookEvent::firstOrCreate(
            ['stripe_event_id' => $event->id],
            ['type' => $event->type, 'payload' => $event->toArray()]
        );

        if ($stored->processed_at) {
            return response()->json(['received' => true]);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $intent = $event->data->object;
            $donation = Donation::where('stripe_payment_intent_id', $intent->id)->first();
            if ($donation) {
                $chargeId = $intent->charges->data[0]->id ?? null;
                $this->donationService->markSucceeded($donation, $chargeId);
            }
        }

        if ($event->type === 'payment_intent.payment_failed') {
            $intent = $event->data->object;
            $donation = Donation::where('stripe_payment_intent_id', $intent->id)->first();
            if ($donation) {
                $this->donationService->markFailed($donation);
            }
        }

        $stored->update(['processed_at' => now()]);

        return response()->json(['received' => true]);
    }
}
