<?php

namespace App\Http\Controllers\Api\Org;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\VolunteerApplicationResource;
use App\Models\Organization;
use App\Models\VolunteerApplication;

class OrgApplicationController extends ApiController
{
    public function index(string $publicId, string $opportunityPublicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('view', $org);

        $applications = VolunteerApplication::whereHas('opportunity', function ($query) use ($org, $opportunityPublicId) {
            $query->where('organization_id', $org->id)->where('public_id', $opportunityPublicId);
        })->with('opportunity')->latest()->paginate(15);

        return $this->respond(VolunteerApplicationResource::collection($applications), [
            'pagination' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    public function accept(string $publicId, string $applicationPublicId)
    {
        return $this->updateStatus($publicId, $applicationPublicId, 'accepted');
    }

    public function reject(string $publicId, string $applicationPublicId)
    {
        return $this->updateStatus($publicId, $applicationPublicId, 'rejected');
    }

    public function complete(string $publicId, string $applicationPublicId)
    {
        return $this->updateStatus($publicId, $applicationPublicId, 'completed');
    }

    private function updateStatus(string $publicId, string $applicationPublicId, string $status)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageCampaigns', $org);

        $application = VolunteerApplication::where('public_id', $applicationPublicId)
            ->whereHas('opportunity', fn ($q) => $q->where('organization_id', $org->id))
            ->firstOrFail();

        $application->update([
            'status' => $status,
            'reviewed_by' => request()->user()->id,
            'reviewed_at' => now(),
        ]);

        return $this->respond(new VolunteerApplicationResource($application->load('opportunity')));
    }
}
