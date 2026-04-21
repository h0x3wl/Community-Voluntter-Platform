<?php

namespace App\Http\Controllers\Api\Org;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Items\ItemRequestStoreRequest;
use App\Models\ItemListing;
use App\Models\ItemRequest;
use App\Models\Organization;
use Illuminate\Support\Str;

class OrgItemRequestController extends ApiController
{
    public function requestItem(ItemRequestStoreRequest $request, string $publicId)
    {
        $listing = ItemListing::where('public_id', $publicId)->firstOrFail();
        $org = Organization::where('public_id', $request->input('organization_public_id'))
            ->orWhere('id', $request->input('organization_id'))
            ->firstOrFail();
        $this->authorize('manageCampaigns', $org);

        $request = ItemRequest::create([
            'public_id' => Str::uuid(),
            'item_listing_id' => $listing->id,
            'organization_id' => $org->id,
            'requested_by_user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return $this->respond([
            'public_id' => $request->public_id,
            'status' => $request->status,
        ]);
    }

    public function index(string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('view', $org);

        $requests = ItemRequest::where('organization_id', $org->id)->latest()->paginate(15);

        return $this->respond($requests->items(), [
            'pagination' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function accept(string $publicId, string $requestPublicId)
    {
        return $this->updateStatus($publicId, $requestPublicId, 'accepted');
    }

    public function reject(string $publicId, string $requestPublicId)
    {
        return $this->updateStatus($publicId, $requestPublicId, 'rejected');
    }

    public function markDelivered(string $publicId, string $requestPublicId)
    {
        return $this->updateStatus($publicId, $requestPublicId, 'delivered');
    }

    private function updateStatus(string $publicId, string $requestPublicId, string $status)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageCampaigns', $org);

        $request = ItemRequest::where('public_id', $requestPublicId)
            ->where('organization_id', $org->id)
            ->firstOrFail();

        $request->update([
            'status' => $status,
            'decided_by' => request()->user()->id,
            'decided_at' => now(),
        ]);

        return $this->respond([
            'public_id' => $request->public_id,
            'status' => $request->status,
        ]);
    }
}
