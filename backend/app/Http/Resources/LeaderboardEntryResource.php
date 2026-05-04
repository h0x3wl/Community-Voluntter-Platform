<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaderboardEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_public_id' => $this['user_public_id'] ?? null,
            'name' => $this['name'] ?? null,
            'points' => $this['points'] ?? 0,
            'rank' => $this['rank'] ?? null,
        ];
    }
}
