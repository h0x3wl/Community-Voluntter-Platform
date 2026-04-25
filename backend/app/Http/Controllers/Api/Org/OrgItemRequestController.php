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

        // Check user is a member of the org
        $user = $request->user();
        $isMember = $org->members()->where('users.id', $user->id)->exists();
        if (!$isMember) {
            return response()->json(['message' => 'You are not a member of this organization.'], 403);
        }

        // Auto-accept: item goes directly to storage
        $itemRequest = ItemRequest::create([
            'public_id' => Str::uuid(),
            'item_listing_id' => $listing->id,
            'organization_id' => $org->id,
            'requested_by_user_id' => $user->id,
            'status' => 'accepted',
            'decided_by' => $user->id,
            'decided_at' => now(),
        ]);

        // Mark the listing as claimed so it's no longer available
        $listing->update(['status' => 'claimed']);

        return $this->respond([
            'public_id' => $itemRequest->public_id,
            'status' => $itemRequest->status,
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
        
        $user = request()->user();
        $isMember = $org->members()->where('users.id', $user->id)->exists();
        if (!$isMember) {
            return response()->json(['message' => 'You are not a member of this organization.'], 403);
        }

        $request = ItemRequest::where('public_id', $requestPublicId)
            ->where('organization_id', $org->id)
            ->firstOrFail();

        $request->update([
            'status' => $status,
            'decided_by' => $user->id,
            'decided_at' => now(),
        ]);

        return $this->respond([
            'public_id' => $request->public_id,
            'status' => $request->status,
        ]);
    }
}
