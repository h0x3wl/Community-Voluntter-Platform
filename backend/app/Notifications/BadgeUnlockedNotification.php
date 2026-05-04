<?php

namespace App\Notifications;

use App\Models\Badge;
use Illuminate\Notifications\Notification;

class BadgeUnlockedNotification extends Notification
{

    public function __construct(public Badge $badge)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'badge_unlocked',
            'badge_code' => $this->badge->code,
            'badge_name' => $this->badge->name,
            'title' => '🏆 Badge Unlocked: ' . $this->badge->name,
            'message' => $this->badge->description ?: 'Congratulations! You\'ve earned a new badge.',
            'icon' => $this->badge->icon_url,
        ];
    }
}
