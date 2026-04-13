<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpportunityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'title' => $this->title,
            'description' => $this->description,
            'required_skills' => $this->required_skills,
            'location_type' => $this->location_type,
            'location_text' => $this->location_text,
            'start_date' => optional($this->start_date)->toDateString(),
            'end_date' => optional($this->end_date)->toDateString(),
            'duration_hours' => $this->duration_hours,
            'session' => [
                'title' => $this->session_title,
                'starts_at' => optional($this->session_starts_at)->toIso8601String(),
                'timezone' => $this->session_timezone,
                'join_url' => $this->session_join_url,
            ],
            'status' => $this->status,
            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'public_id' => $this->organization->public_id,
                    'name' => $this->organization->name,
                    'slug' => $this->organization->slug,
                ];
            }),
        ];
    }
}
