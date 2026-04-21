<?php

namespace App\Notifications;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Notifications\Notification;

class OrgInviteNotification extends Notification
{
    public function __construct(
        public Organization $organization,
        public string $role,
        public User $invitedBy
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $inviterName = trim($this->invitedBy->first_name . ' ' . $this->invitedBy->last_name);

        return [
            'type' => 'org_invite',
            'organization_id' => $this->organization->public_id,
            'organization_name' => $this->organization->name,
            'role' => $this->role,
            'title' => '🏢 Organization Invitation',
            'message' => "{$inviterName} invited you to join \"{$this->organization->name}\" as {$this->role}.",
        ];
    }
}
