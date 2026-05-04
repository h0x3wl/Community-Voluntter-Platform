<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Organization;
use App\Notifications\DonationSuccessfulNotification;
use App\Notifications\OrgDonationReceivedNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DonationService
{
    public function __construct(
        private readonly StripeService $stripe,
        private readonly RewardService $rewards,
    ) {
    }

    public function createIntent(array $payload, ?int $donorUserId): array
    {
        $campaign = null;
        if (! empty($payload['campaign_id'])) {
            $campaign = Campaign::where('public_id', $payload['campaign_id'])->first();
        }
        if (! $campaign && ! empty($payload['share_slug'])) {
            $campaign = Campaign::where('share_slug', $payload['share_slug'])->first();
        }

        $organization = $campaign?->organization ?? Organization::first();
        if (! $organization) {
            throw new \RuntimeException('Organization not configured for donations.');
        }

        $amountCents = $payload['amount_cents'];

        $donation = Donation::create([
            'public_id' => Str::uuid(),
            'campaign_id' => $campaign?->id,
            'organization_id' => $organization->id,
            'donor_user_id' => $donorUserId,
            'donor_name' => $payload['donor_name'] ?? null,
            'donor_email' => $payload['donor_email'] ?? null,
            'amount_cents' => $amountCents,
            'currency' => strtoupper($payload['currency']),
            'frequency' => 'one_time',
            'status' => 'requires_payment',
        ]);

        $intent = $this->stripe->createPaymentIntent(
            $amountCents,
            $donation->currency,
            [
                'donation_id' => (string) $donation->id,
                'donation_public_id' => $donation->public_id,
                'org_id' => (string) $organization->id,
                'campaign_id' => $campaign?->id ? (string) $campaign->id : null,
            ]
        );

        $donation->update([
            'stripe_payment_intent_id' => $intent['id'],
            'status' => 'processing',
        ]);

        return [
            'donation' => $donation,
            'client_secret' => $intent['client_secret'],
        ];
    }

    public function markSucceeded(Donation $donation, ?string $chargeId = null): Donation
    {
        return DB::transaction(function () use ($donation, $chargeId) {
            $donation->update([
                'status' => 'succeeded',
                'stripe_charge_id' => $chargeId,
                'paid_at' => Carbon::now(),
            ]);

            if ($donation->campaign) {
                $donation->campaign->increment('raised_cents', $donation->amount_cents);
                $donation->campaign->increment('donors_count');
            }

            if ($donation->donor_user_id) {
                $this->rewards->awardDonationPoints($donation);
                $donation->donor->notify(new DonationSuccessfulNotification($donation));
            }

            // Notify org members about the donation
            $this->notifyOrgMembers($donation);

            return $donation->refresh();
        });
    }

    public function markFailed(Donation $donation): Donation
    {
        $donation->update(['status' => 'failed']);

        return $donation->refresh();
    }

    /**
     * Validate a credit card number using the Luhn algorithm.
     */
    public static function luhnCheck(string $number): bool
    {
        $number = preg_replace('/\D/', '', $number);

        if (strlen($number) < 13 || strlen($number) > 19) {
            return false;
        }

        $sum = 0;
        $alt = false;

        for ($i = strlen($number) - 1; $i >= 0; $i--) {
            $digit = (int) $number[$i];

            if ($alt) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
            $alt = !$alt;
        }

        return $sum % 10 === 0;
    }

    /**
     * Create a simulated donation (demo mode – no Stripe required).
     * Performs Luhn card validation and immediately marks the donation as succeeded.
     */
    public function createSimulatedDonation(array $payload, ?int $donorUserId): array
    {
        $cardNumber = preg_replace('/\D/', '', $payload['card_number'] ?? '');

        if (!self::luhnCheck($cardNumber)) {
            return ['success' => false, 'error' => 'Invalid card number. Please check and try again.'];
        }

        // Detect card brand
        $brand = 'unknown';
        if (preg_match('/^4/', $cardNumber)) {
            $brand = 'visa';
        } elseif (preg_match('/^5[1-5]/', $cardNumber)) {
            $brand = 'mastercard';
        } elseif (preg_match('/^3[47]/', $cardNumber)) {
            $brand = 'amex';
        }

        $campaign = null;
        if (!empty($payload['campaign_id'])) {
            $campaign = Campaign::where('public_id', $payload['campaign_id'])->first();
        }
        if (!$campaign && !empty($payload['share_slug'])) {
            $campaign = Campaign::where('share_slug', $payload['share_slug'])->first();
        }

        $organization = $campaign?->organization ?? Organization::first();
        if (!$organization) {
            return ['success' => false, 'error' => 'No organization configured for donations.'];
        }

        $amountCents = $payload['amount_cents'];
        $isAnonymous = filter_var($payload['anonymous'] ?? false, FILTER_VALIDATE_BOOLEAN);

        // For anonymous donations: we still link donor_user_id so XP/points
        // are tracked privately, but is_anonymous hides them from public views
        $donation = DB::transaction(function () use ($payload, $amountCents, $campaign, $organization, $donorUserId, $brand, $isAnonymous) {
            $donation = Donation::create([
                'public_id' => Str::uuid(),
                'campaign_id' => $campaign?->id,
                'organization_id' => $organization->id,
                'donor_user_id' => $donorUserId,
                'donor_name' => $isAnonymous ? null : ($payload['donor_name'] ?? null),
                'donor_email' => $isAnonymous ? null : ($payload['donor_email'] ?? null),
                'amount_cents' => $amountCents,
                'currency' => strtoupper($payload['currency'] ?? 'USD'),
                'frequency' => 'one_time',
                'status' => 'succeeded',
                'stripe_payment_intent_id' => 'sim_' . Str::random(24),
                'stripe_charge_id' => 'sim_ch_' . Str::random(24),
                'paid_at' => Carbon::now(),
                'is_anonymous' => $isAnonymous,
            ]);

            if ($campaign) {
                $campaign->increment('raised_cents', $amountCents);
                $campaign->increment('donors_count');
            }

            // Always award points/XP even for anonymous donations (tracked privately)
            if ($donorUserId) {
                $this->rewards->awardDonationPoints($donation);
                $donation->donor->notify(new DonationSuccessfulNotification($donation));
            }

            // Notify org members about the donation
            $this->notifyOrgMembers($donation);

            return $donation;
        });

        return [
            'success' => true,
            'donation' => $donation,
            'card_brand' => $brand,
        ];
    }

    /**
     * Notify all members of the donation's organization.
     */
    private function notifyOrgMembers(Donation $donation): void
    {
        $org = $donation->organization;
        if (!$org) return;

        $members = $org->members()->get();
        foreach ($members as $member) {
            if ($member->id !== $donation->donor_user_id) {
                $member->notify(new OrgDonationReceivedNotification($donation));
            }
        }
    }
}
