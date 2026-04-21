<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\VolunteerApplicationResource;

class UserApplicationController extends ApiController
{
    public function index()
    {
        $applications = request()->user()->volunteerApplications()->with('opportunity')->latest()->paginate(15);

        return $this->respond(VolunteerApplicationResource::collection($applications), [
            'pagination' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'total' => $applications->total(),
            ],
        ]);
    }
}
