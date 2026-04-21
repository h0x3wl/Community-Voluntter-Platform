<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'public_id',
        'name',
        'slug',
        'description',
        'logo_url',
        'website',
        'phone',
        'address',
        'city',
        'country',
        'lat',
        'lng',
        'status',
        'annual_goal_cents',
        'tax_id',
        'license_number',
        'org_type',
        'verification_status',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'organization_members')
            ->withPivot(['id', 'role', 'invited_by_user_id', 'joined_at'])
            ->withTimestamps();
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function opportunities()
    {
        return $this->hasMany(VolunteerOpportunity::class);
    }

    public function itemRequests()
    {
        return $this->hasMany(ItemRequest::class);
    }
}
