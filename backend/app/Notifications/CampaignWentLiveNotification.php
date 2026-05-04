<?php

namespace App\Notifications;

use App\Models\Campaign;
use Illuminate\Notifications\Notification;

class CampaignWentLiveNotification extends Notification
{

    public function __construct(public Campaign $campaign)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database']; // Add 'mail' if needed based on preference
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'campaign_live',
            'campaign_id' => $this->campaign->public_id,
            'campaign_slug' => $this->campaign->share_slug,
            'title' => 'New Campaign: ' . $this->campaign->title,
            'message' => 'A new campaign you might be interested in is now live!',
            'image' => $this->campaign->images->first()?->image_url,
        ];
    }
}
