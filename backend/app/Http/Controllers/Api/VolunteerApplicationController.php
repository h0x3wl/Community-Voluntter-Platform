<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Opportunities\OpportunityApplyRequest;
use App\Http\Resources\VolunteerApplicationResource;
use App\Models\VolunteerApplication;
use App\Models\VolunteerOpportunity;
use Illuminate\Support\Str;

class VolunteerApplicationController extends ApiController
{
    public function apply(OpportunityApplyRequest $request, string $publicId)
    {
        $opportunity = VolunteerOpportunity::where('public_id', $publicId)->firstOrFail();

        $application = VolunteerApplication::updateOrCreate(
            ['opportunity_id' => $opportunity->id, 'user_id' => $request->user()->id],
            array_merge($request->validated(), [
                'public_id' => Str::uuid(),
                'status' => 'pending',
            ])
        );

        return $this->respond(new VolunteerApplicationResource($application->load('opportunity')));
    }
}
