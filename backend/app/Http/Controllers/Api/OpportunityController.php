<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\OpportunityResource;
use App\Models\VolunteerOpportunity;

class OpportunityController extends ApiController
{
    public function index()
    {
        $opportunities = VolunteerOpportunity::query()
            ->where('status', 'approved')
            ->with('organization')
            ->latest()
            ->paginate(15);

        return $this->respond(OpportunityResource::collection($opportunities), [
            'pagination' => [
                'current_page' => $opportunities->currentPage(),
                'last_page' => $opportunities->lastPage(),
                'total' => $opportunities->total(),
            ],
        ]);
    }

    public function show(string $publicId)
    {
        $opportunity = VolunteerOpportunity::with('organization')
            ->where('public_id', $publicId)
            ->firstOrFail();

        return $this->respond(new OpportunityResource($opportunity));
    }
}
