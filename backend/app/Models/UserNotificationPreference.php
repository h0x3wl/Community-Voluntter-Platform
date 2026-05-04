<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'email_notifications',
        'sms_alerts',
        'push_notifications',
        'campaign_updates',
    ];

    protected function casts(): array
    {
        return [
            'email_notifications' => 'boolean',
            'sms_alerts' => 'boolean',
            'push_notifications' => 'boolean',
            'campaign_updates' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
