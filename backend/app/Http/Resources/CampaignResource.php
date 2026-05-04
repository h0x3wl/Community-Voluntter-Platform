<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $daysLeft = null;
        if ($this->ends_at) {
            $daysLeft = now()->diffInDays($this->ends_at, false);
        }

        return [
            'public_id' => $this->public_id,
            'share_slug' => $this->share_slug,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'is_urgent' => (bool) $this->is_urgent,
            'goal_cents' => $this->goal_cents,
            'raised_cents' => $this->raised_cents,
            'donors_count' => $this->donors_count,
            'days_left' => $daysLeft,
            'location' => $this->location_text,
            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'public_id' => $this->organization->public_id,
                    'name' => $this->organization->name,
                    'slug' => $this->organization->slug,
                ];
            }),
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                ];
            }),
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(fn ($image) => [
                    'url' => $image->image_url,
                    'sort_order' => $image->sort_order,
                ]);
            }),
        ];
    }
}
