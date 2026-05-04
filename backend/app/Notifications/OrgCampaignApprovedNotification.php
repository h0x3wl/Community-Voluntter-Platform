<?php

namespace App\Notifications;

use App\Models\Campaign;
use Illuminate\Notifications\Notification;

class OrgCampaignApprovedNotification extends Notification
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
        return [
            'type' => 'campaign_approved',
            'campaign_id' => $this->campaign->public_id,
            'campaign_title' => $this->campaign->title,
            'title' => '✅ Campaign Approved!',
            'message' => "Your campaign \"{$this->campaign->title}\" has been approved and is now live.",
        ];
    }
}
