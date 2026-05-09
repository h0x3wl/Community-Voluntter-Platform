<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Campaign extends Model
{
    use SoftDeletes;

    /**
     * Clear campaigns cache whenever a campaign is created, updated, or deleted.
     */
    protected static function booted(): void
    {
        $clearCache = function (Campaign $campaign) {
            // Clear the default index cache
            Cache::forget('campaigns_index_' . md5(url('/api/v1/campaigns')));
            // Clear this campaign's detail cache
            if ($campaign->share_slug) {
                Cache::forget('campaign_detail_' . $campaign->share_slug);
            }
        };

        static::saved($clearCache);
        static::deleted($clearCache);
    }

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
