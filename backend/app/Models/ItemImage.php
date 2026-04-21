<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemImage extends Model
{
    protected $fillable = [
        'item_listing_id',
        'image_url',
        'sort_order',
    ];

    public function listing()
    {
        return $this->belongsTo(ItemListing::class, 'item_listing_id');
    }
}
