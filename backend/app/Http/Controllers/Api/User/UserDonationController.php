<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\DonationResource;

class UserDonationController extends ApiController
{
    public function index()
    {
        $donations = request()->user()->donations()->latest()->with('campaign')->paginate(15);

        return $this->respond(DonationResource::collection($donations), [
            'pagination' => [
                'current_page' => $donations->currentPage(),
                'last_page' => $donations->lastPage(),
                'total' => $donations->total(),
            ],
        ]);
    }
}
