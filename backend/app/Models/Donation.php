<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = [
        'public_id',
        'campaign_id',
        'organization_id',
        'donor_user_id',
        'donor_name',
        'donor_email',
        'amount_cents',
        'currency',
        'frequency',
        'status',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'paid_at',
        'receipt_url',
        'is_anonymous',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'is_anonymous' => 'boolean',
        ];
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function donor()
    {
        return $this->belongsTo(User::class, 'donor_user_id');
    }
}
