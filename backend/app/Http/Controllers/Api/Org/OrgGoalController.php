<?php

namespace App\Http\Controllers\Api\Org;

use App\Http\Controllers\Api\ApiController;
use App\Models\Organization;
use Illuminate\Http\Request;

class OrgGoalController extends ApiController
{
    public function update(Request $request, string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('update', $org);

        $request->validate([
            'annual_goal_cents' => ['required', 'integer', 'min:0'],
        ]);

        $org->update([
            'annual_goal_cents' => $request->input('annual_goal_cents'),
        ]);

        return $this->respond([
            'message' => 'Annual goal updated.',
            'annual_goal_cents' => $org->annual_goal_cents,
        ]);
    }
}
