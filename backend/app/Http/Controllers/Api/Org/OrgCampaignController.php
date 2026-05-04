<?php

namespace App\Http\Controllers\Api\Org;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Campaigns\CampaignImageUploadRequest;
use App\Http\Requests\Campaigns\CampaignStoreRequest;
use App\Http\Requests\Campaigns\CampaignUpdateRequest;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Models\Organization;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OrgCampaignController extends ApiController
{
    public function index(string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('view', $org);

        $campaigns = $org->campaigns()->with('images')->latest()->paginate(15);

        return $this->respond(CampaignResource::collection($campaigns), [
            'pagination' => [
                'current_page' => $campaigns->currentPage(),
                'last_page' => $campaigns->lastPage(),
                'total' => $campaigns->total(),
            ],
        ]);
    }

    public function store(CampaignStoreRequest $request, string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageCampaigns', $org);

        $campaign = $org->campaigns()->create(array_merge($request->validated(), [
            'public_id' => Str::uuid(),
            'share_slug' => Str::slug($request->input('title')) . '-' . Str::random(6),
            'status' => 'pending_review',
            'raised_cents' => 0,
            'donors_count' => 0,
        ]));

        // Notify all platform admins about the new campaign needing review
        $admins = \App\Models\User::where('role', 'platform_admin')->get();
        \Illuminate\Support\Facades\Notification::send(
            $admins,
            new \App\Notifications\AdminCampaignSubmittedNotification($campaign->load('organization'))
        );

        return $this->respond(new CampaignResource($campaign));
    }

    public function update(CampaignUpdateRequest $request, string $publicId, string $campaignPublicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageCampaigns', $org);

        $campaign = Campaign::where('public_id', $campaignPublicId)
            ->where('organization_id', $org->id)
            ->firstOrFail();

        $campaign->update($request->validated());

        return $this->respond(new CampaignResource($campaign->refresh()));
    }

    public function uploadImage(CampaignImageUploadRequest $request, string $publicId, string $campaignPublicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageCampaigns', $org);

        $campaign = Campaign::where('public_id', $campaignPublicId)
            ->where('organization_id', $org->id)
            ->firstOrFail();

        $path = $request->file('image')->store('campaigns', 'public');
        $url = '/storage/' . $path;

        $campaign->images()->create([
            'image_url' => $url,
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return $this->respond(new CampaignResource($campaign->load('images')));
    }

    public function pause(string $publicId, string $campaignPublicId)
    {
        return $this->updateStatus($publicId, $campaignPublicId, 'paused');
    }

    public function activate(string $publicId, string $campaignPublicId)
    {
        return $this->updateStatus($publicId, $campaignPublicId, 'active');
    }

    public function complete(string $publicId, string $campaignPublicId)
    {
        return $this->updateStatus($publicId, $campaignPublicId, 'completed');
    }

    public function destroy(string $publicId, string $campaignPublicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageCampaigns', $org);

        $campaign = Campaign::where('public_id', $campaignPublicId)
            ->where('organization_id', $org->id)
            ->firstOrFail();

        $campaign->delete();

        return response()->json(null, 204);
    }

    private function updateStatus(string $publicId, string $campaignPublicId, string $status)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageCampaigns', $org);

        $campaign = Campaign::where('public_id', $campaignPublicId)
            ->where('organization_id', $org->id)
            ->firstOrFail();

        $campaign->update(['status' => $status]);

        return $this->respond(new CampaignResource($campaign->refresh()));
    }
}
