<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VolunteerApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'status' => $this->status,
            'notes' => $this->notes,
            'reviewed_at' => optional($this->reviewed_at)->toIso8601String(),
            'opportunity' => $this->whenLoaded('opportunity', function () {
                return [
                    'public_id' => $this->opportunity->public_id,
                    'title' => $this->opportunity->title,
                ];
            }),
        ];
    }
}
