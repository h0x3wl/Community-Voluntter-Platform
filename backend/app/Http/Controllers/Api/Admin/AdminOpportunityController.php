<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\OpportunityResource;
use App\Models\VolunteerOpportunity;

class AdminOpportunityController extends ApiController
{
    public function index()
    {
        $status = request()->query('status', 'pending_review');
        $opportunities = VolunteerOpportunity::where('status', $status)->latest()->paginate(15);

        return $this->respond(OpportunityResource::collection($opportunities), [
            'pagination' => [
                'current_page' => $opportunities->currentPage(),
                'last_page' => $opportunities->lastPage(),
                'total' => $opportunities->total(),
            ],
        ]);
    }

    public function approve(string $publicId)
    {
        $opportunity = VolunteerOpportunity::where('public_id', $publicId)->firstOrFail();
        $opportunity->update([
            'status' => 'approved',
            'approved_by' => request()->user()->id,
            'approved_at' => now(),
        ]);

        return $this->respond(new OpportunityResource($opportunity));
    }

    public function reject(string $publicId)
    {
        $opportunity = VolunteerOpportunity::where('public_id', $publicId)->firstOrFail();
        $opportunity->update([
            'status' => 'rejected',
            'approved_by' => request()->user()->id,
            'approved_at' => now(),
        ]);

        return $this->respond(new OpportunityResource($opportunity));
    }
}
