<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItemListing extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'public_id',
        'donor_user_id',
        'target_organization_id',
        'category_id',
        'title',
        'description',
        'condition',
        'ai_category',
        'ai_confidence',
        'location_text',
        'lat',
        'lng',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
            'ai_confidence' => 'float',
            'approved_at' => 'datetime',
        ];
    }

    public function donor()
    {
        return $this->belongsTo(User::class, 'donor_user_id');
    }

    public function images()
    {
        return $this->hasMany(ItemImage::class);
    }

    public function requests()
    {
        return $this->hasMany(ItemRequest::class);
    }

    public function targetOrganization()
    {
        return $this->belongsTo(Organization::class, 'target_organization_id');
    }
}
