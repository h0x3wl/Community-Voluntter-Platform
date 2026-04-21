<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'title' => $this->title,
            'description' => $this->description,
            'condition' => $this->condition,
            'location_text' => $this->location_text,
            'status' => $this->status,
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(fn ($image) => [
                    'url' => $image->image_url,
                    'sort_order' => $image->sort_order,
                ]);
            }),
        ];
    }
}
