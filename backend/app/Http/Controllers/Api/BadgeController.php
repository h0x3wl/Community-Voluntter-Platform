<?php

namespace App\Http\Controllers\Api;

use App\Models\Badge;

class BadgeController extends ApiController
{
    public function index()
    {
        $badges = Badge::where('is_active', true)
            ->orderBy('display_order')
            ->get()
            ->map(fn ($b) => [
                'code' => $b->code,
                'name' => $b->name,
                'description' => $b->description,
                'criteria_type' => $b->criteria_type,
                'criteria_value' => $b->criteria_value,
                'icon_url' => $b->icon_url,
                'display_order' => $b->display_order,
            ]);
            
        return $this->respond($badges);
    }
}
