<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Donations\DonationIntentRequest;
use App\Http\Resources\DonationResource;
use App\Models\Donation;
use App\Services\DonationService;

class DonationController extends ApiController
{
    public function __construct(private readonly DonationService $donationService)
    {
    }

    public function intent(DonationIntentRequest $request)
    {
        $amountCents = $request->amountCents();
        if ($amountCents < 100) {
            return response()->json(['message' => 'Minimum donation is $1.00'], 422);
        }

        $data = $request->validated();
        $data['amount_cents'] = $amountCents;
        $data['anonymous'] = $request->boolean('anonymous');

        // Always link user for XP tracking; the is_anonymous flag controls public visibility
        $donorUserId = $request->user()?->id;

        $intent = $this->donationService->createIntent($data, $donorUserId);

        return $this->respond([
            'donation' => new DonationResource($intent['donation']),
            'client_secret' => $intent['client_secret'],
        ]);
    }

    public function show(string $publicId)
    {
        $donation = Donation::with('campaign')->where('public_id', $publicId)->firstOrFail();
        $user = request()->user();

        if ($donation->donor_user_id && (! $user || $user->id !== $donation->donor_user_id)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $this->respond(new DonationResource($donation));
    }

    /**
     * Simulate a donation (demo mode – no Stripe required).
     * Validates card number with Luhn algorithm and processes immediately.
     */
    public function simulate(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'currency' => ['required', 'string', 'size:3'],
            'card_number' => ['required', 'string', 'min:13', 'max:19'],
            'card_expiry' => ['required', 'string', 'regex:/^\d{2}\s*\/\s*\d{2}$/'],
            'card_cvv' => ['required', 'string', 'min:3', 'max:4'],
            'cardholder_name' => ['required', 'string', 'max:150'],
            'campaign_id' => ['nullable', 'string'],
            'share_slug' => ['nullable', 'string'],
            'donor_name' => ['nullable', 'string', 'max:150'],
            'donor_email' => ['nullable', 'email', 'max:255'],
            'anonymous' => ['sometimes', 'boolean'],
        ]);

        $amountCents = (int) round(((float) $request->input('amount')) * 100);
        if ($amountCents < 100) {
            return response()->json(['message' => 'Minimum donation is $1.00'], 422);
        }

        // Always link user for private XP/level tracking; is_anonymous flag controls public visibility
        $donorUserId = $request->user()?->id;

        $payload = $request->all();
        $payload['amount_cents'] = $amountCents;

        $result = $this->donationService->createSimulatedDonation($payload, $donorUserId);

        if (!$result['success']) {
            return response()->json(['message' => $result['error']], 422);
        }

        return $this->respond([
            'donation' => new DonationResource($result['donation']),
            'card_brand' => $result['card_brand'],
            'simulated' => true,
        ]);
    }
}
