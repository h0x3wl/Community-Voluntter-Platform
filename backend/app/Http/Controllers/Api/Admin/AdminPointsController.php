<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\ManualPointsRequest;
use App\Models\User;
use App\Services\RewardService;

class AdminPointsController extends ApiController
{
    public function __construct(private readonly RewardService $rewards)
    {
    }

    public function manualAdjust(ManualPointsRequest $request)
    {
        $user = User::where('public_id', $request->input('user_public_id'))->firstOrFail();

        $this->rewards->addPoints(
            $user,
            $request->input('points'),
            'manual_adjustment',
            null,
            $request->input('description'),
            $request->user()->id
        );

        return $this->respond(['message' => 'Points adjusted.']);
    }
}
