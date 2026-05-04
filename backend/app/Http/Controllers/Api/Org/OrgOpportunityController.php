<?php

namespace App\Http\Controllers\Api\Org;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Opportunities\OpportunityStoreRequest;
use App\Http\Resources\OpportunityResource;
use App\Models\Organization;
use Illuminate\Support\Str;

class OrgOpportunityController extends ApiController
{
    public function index(string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('view', $org);

        $opportunities = $org->opportunities()->latest()->paginate(15);

        return $this->respond(OpportunityResource::collection($opportunities), [
            'pagination' => [
                'current_page' => $opportunities->currentPage(),
                'last_page' => $opportunities->lastPage(),
                'total' => $opportunities->total(),
            ],
        ]);
    }

    public function store(OpportunityStoreRequest $request, string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageCampaigns', $org);

        $opportunity = $org->opportunities()->create(array_merge($request->validated(), [
            'public_id' => Str::uuid(),
            'status' => 'pending_review',
        ]));

        return $this->respond(new OpportunityResource($opportunity));
    }
}
