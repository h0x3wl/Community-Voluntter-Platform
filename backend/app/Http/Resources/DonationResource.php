<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'amount_cents' => $this->amount_cents,
            'currency' => $this->currency,
            'status' => $this->status,
            'is_anonymous' => (bool) $this->is_anonymous,
            'donor_name' => $this->is_anonymous ? 'Anonymous' : $this->donor_name,
            'paid_at' => optional($this->paid_at)->toIso8601String(),
            'confirmation_id' => $this->stripe_payment_intent_id,
            'receipt_url' => $this->receipt_url,
            'xp_earned' => $this->amount_cents ? (int) round(($this->amount_cents / 100) * 10) : 0,
            'campaign' => $this->whenLoaded('campaign', function () {
                return [
                    'public_id' => $this->campaign->public_id,
                    'title' => $this->campaign->title,
                    'share_slug' => $this->campaign->share_slug,
                ];
            }),
        ];
    }
}
