<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Get the user's first organization (if any)
        $org = $this->organizations()->first();

        return [
            'public_id' => $this->public_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'role' => $this->role,
            'phone' => $this->phone,
            'address_line' => $this->address_line,
            'avatar_url' => $this->avatar_url,
            'points_balance' => $this->points_balance,
            'total_donated_cents' => $this->total_donated_cents ?? 0,
            'donation_count' => $this->donation_count ?? 0,
            'level' => $this->level ?? 1,
            'xp' => $this->xp ?? 0,
            'last_login_at' => optional($this->last_login_at)->toIso8601String(),
            'org_public_id' => $org?->public_id,
            'org_name' => $org?->name,
            'org_status' => $org?->status,
            'badges' => $this->badges->map(function ($b) {
                return [
                    'code' => $b->code,
                    'name' => $b->name,
                    'icon_url' => $b->icon_url,
                    'awarded_at' => $b->pivot->awarded_at,
                ];
            }),
        ];
    }
}
