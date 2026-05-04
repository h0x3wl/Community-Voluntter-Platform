<?php

namespace App\Notifications;

use App\Models\Campaign;
use Illuminate\Notifications\Notification;

class AdminCampaignSubmittedNotification extends Notification
{

    public function __construct(public Campaign $campaign)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $orgName = $this->campaign->organization?->name ?? 'Unknown';

        return [
            'type' => 'campaign_submitted',
            'campaign_id' => $this->campaign->public_id,
            'campaign_title' => $this->campaign->title,
            'title' => '📋 Campaign Submitted for Review',
            'message' => "\"{$this->campaign->title}\" by {$orgName} needs your review.",
        ];
    }
}
