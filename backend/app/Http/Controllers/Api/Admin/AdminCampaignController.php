<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;

class AdminCampaignController extends ApiController
{
    public function index()
    {
        $query = Campaign::with(['organization', 'category', 'images'])->latest();

        if ($status = request()->query('status')) {
            $query->where('status', $status);
        }

        if ($search = request()->query('q')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $campaigns = $query->paginate(20);

        return $this->respond(CampaignResource::collection($campaigns), [
            'pagination' => [
                'current_page' => $campaigns->currentPage(),
                'last_page' => $campaigns->lastPage(),
                'total' => $campaigns->total(),
            ],
        ]);
    }

    public function update(string $publicId)
    {
        $campaign = Campaign::where('public_id', $publicId)->firstOrFail();

        $campaign->update(request()->only([
            'title', 'description', 'goal_cents', 'status',
            'location_text', 'starts_at', 'ends_at',
        ]));

        return $this->respond(new CampaignResource($campaign->refresh()->load(['organization', 'category', 'images'])));
    }

    public function approve(string $publicId)
    {
        $campaign = Campaign::where('public_id', $publicId)->firstOrFail();
        $campaign->update([
            'status' => 'active',
            'approved_by' => request()->user()->id,
            'approved_at' => now(),
        ]);

        return $this->respond(new CampaignResource($campaign->load(['organization', 'category', 'images'])));
    }

    public function reject(string $publicId)
    {
        $campaign = Campaign::where('public_id', $publicId)->firstOrFail();
        $campaign->update([
            'status' => 'rejected',
            'approved_by' => request()->user()->id,
            'approved_at' => now(),
        ]);

        return $this->respond(new CampaignResource($campaign->load(['organization', 'category', 'images'])));
    }

    public function destroy(string $publicId)
    {
        $campaign = Campaign::where('public_id', $publicId)->firstOrFail();
        $campaign->delete();

        return response()->json(null, 204);
    }
}
