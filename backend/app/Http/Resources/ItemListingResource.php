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
            'ai_category' => $this->ai_category,
            'ai_confidence' => $this->ai_confidence,
            'location_text' => $this->location_text,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'donor' => $this->whenLoaded('donor', function () {
                return [
                    'name' => $this->donor->first_name . ' ' . $this->donor->last_name,
                    'avatar_url' => $this->donor->avatar_url,
                ];
            }),
            'target_organization' => $this->whenLoaded('targetOrganization', function () {
                return $this->targetOrganization ? [
                    'public_id' => $this->targetOrganization->public_id,
                    'name' => $this->targetOrganization->name,
                    'logo_url' => $this->targetOrganization->logo_url,
                ] : null;
            }),
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(fn ($image) => [
                    'url' => $image->image_url,
                    'sort_order' => $image->sort_order,
                ]);
            }),
            'requests_count' => $this->whenCounted('requests'),
        ];
    }
}
