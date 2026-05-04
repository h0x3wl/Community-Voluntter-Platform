<?php

namespace App\Notifications;

use App\Models\Donation;
use Illuminate\Notifications\Notification;

class OrgDonationReceivedNotification extends Notification
{

    public function __construct(public Donation $donation)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $amount = number_format($this->donation->amount_cents / 100, 2);
        $donorName = $this->donation->is_anonymous ? 'An anonymous donor' : ($this->donation->donor_name ?: 'A supporter');
        $campaignTitle = $this->donation->campaign?->title ?? 'General Fund';

        return [
            'type' => 'org_donation_received',
            'donation_id' => $this->donation->public_id,
            'amount_cents' => $this->donation->amount_cents,
            'title' => '💰 New Donation Received!',
            'message' => "{$donorName} donated \${$amount} to {$campaignTitle}.",
        ];
    }
}
