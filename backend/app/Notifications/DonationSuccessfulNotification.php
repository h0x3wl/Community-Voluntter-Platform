<?php

namespace App\Notifications;

use App\Models\Donation;
use Illuminate\Notifications\Notification;

class DonationSuccessfulNotification extends Notification
{

    public function __construct(public Donation $donation)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database']; // Add 'mail' based on preference if needed
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'donation_success',
            'donation_id' => $this->donation->public_id,
            'amount_cents' => $this->donation->amount_cents,
            'campaign_title' => $this->donation->campaign?->title ?? 'General Fund',
            'title' => 'Donation Successful!',
            'message' => 'Thank you! Your donation of $' . number_format($this->donation->amount_cents / 100, 2) . ' was successful.',
        ];
    }
}
