<?php

namespace App\Notifications;

use App\Models\Organization;
use Illuminate\Notifications\Notification;

class AdminNewOrgRegisteredNotification extends Notification
{

    public function __construct(public Organization $organization)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_org_registered',
            'org_id' => $this->organization->public_id,
            'org_name' => $this->organization->name,
            'title' => '🏢 New Organization Registered',
            'message' => "\"{$this->organization->name}\" has registered and needs approval.",
        ];
    }
}
