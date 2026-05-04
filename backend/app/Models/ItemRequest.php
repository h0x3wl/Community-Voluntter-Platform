<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemRequest extends Model
{
    protected $fillable = [
        'public_id',
        'item_listing_id',
        'organization_id',
        'requested_by_user_id',
        'status',
        'decided_by',
        'decided_at',
        'delivery_notes',
    ];

    protected function casts(): array
    {
        return [
            'decided_at' => 'datetime',
        ];
    }

    public function listing()
    {
        return $this->belongsTo(ItemListing::class, 'item_listing_id');
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
