<?php

namespace App\Http\Controllers\Api;

use App\Models\Badge;

class BadgeController extends ApiController
{
    public function index()
    {
        $badges = Badge::where('is_active', true)
            ->orderBy('display_order')
            ->get();
            
        return $this->respond($badges);
    }
}
