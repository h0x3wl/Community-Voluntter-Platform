<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'public_id',
        'organization_id',
        'category_id',
        'title',
        'description',
        'location_text',
        'lat',
        'lng',
        'goal_cents',
        'raised_cents',
        'donors_count',
        'status',
        'approved_by',
        'approved_at',
        'starts_at',
        'ends_at',
        'share_slug',
        'is_urgent',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
            'approved_at' => 'datetime',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_urgent' => 'boolean',
        ];
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(CampaignImage::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }
}
