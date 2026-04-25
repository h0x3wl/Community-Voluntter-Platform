<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Items\ItemImageUploadRequest;
use App\Http\Requests\Items\ItemListingStoreRequest;
use App\Http\Resources\ItemListingResource;
use App\Models\ItemListing;
use App\Models\Organization;

class ItemController extends ApiController
{
    public function index()
    {
        $items = ItemListing::query()
            ->where('status', 'approved')
            ->with(['images', 'donor', 'targetOrganization'])
            ->withCount('requests')
            ->latest()
            ->paginate(15);

        return $this->respond(ItemListingResource::collection($items), [
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function show(string $publicId)
    {
        $item = ItemListing::with(['images', 'donor', 'targetOrganization'])
            ->withCount('requests')
            ->where('public_id', $publicId)
            ->firstOrFail();

        return $this->respond(new ItemListingResource($item));
    }

    public function store(ItemListingStoreRequest $request)
    {
        $data = $request->validated();

        // Resolve target_organization_id from public_id to internal id
        $targetOrgId = null;
        $targetOrg = null;
        if (!empty($data['target_organization_id'])) {
            $targetOrg = Organization::where('public_id', $data['target_organization_id'])->first();
            $targetOrgId = $targetOrg?->id;
        }
        unset($data['target_organization_id']);
        unset($data['image']);

        $listing = ItemListing::create(array_merge($data, [
            'public_id' => \Illuminate\Support\Str::uuid(),
            'donor_user_id' => $request->user()->id,
            'target_organization_id' => $targetOrgId,
            // If targeted to a specific org, mark as claimed immediately
            'status' => $targetOrgId ? 'claimed' : 'approved',
        ]));

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('items', 'public');
            $url = '/storage/' . $path;
            $listing->images()->create([
                'image_url' => $url,
                'sort_order' => 0,
            ]);
        }

        // If targeted to a specific org, auto-create an accepted request
        // so it goes directly to that org's storage
        if ($targetOrgId) {
            \App\Models\ItemRequest::create([
                'public_id' => \Illuminate\Support\Str::uuid(),
                'item_listing_id' => $listing->id,
                'organization_id' => $targetOrgId,
                'requested_by_user_id' => $request->user()->id,
                'status' => 'accepted',
                'decided_at' => now(),
            ]);
        }

        return $this->respond(
            new ItemListingResource($listing->load(['images', 'targetOrganization'])),
            ['message' => 'Item listing submitted.']
        );
    }

    public function uploadImage(ItemImageUploadRequest $request, string $publicId)
    {
        $listing = ItemListing::where('public_id', $publicId)
            ->where('donor_user_id', $request->user()->id)
            ->firstOrFail();

        $path = $request->file('image')->store('items', 'public');
        $url = '/storage/' . $path;
        $listing->images()->create([
            'image_url' => $url,
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return $this->respond(new ItemListingResource($listing->load('images')));
    }

    /**
     * Available items for organizations – items that are approved
     * and either targeted to the requesting org or available to all.
     */
    public function availableForOrg(string $orgPublicId)
    {
        $org = Organization::where('public_id', $orgPublicId)->firstOrFail();
        $this->authorize('view', $org);

        $items = ItemListing::query()
            ->where('status', 'approved')
            ->where(function ($q) use ($org) {
                $q->whereNull('target_organization_id')
                  ->orWhere('target_organization_id', $org->id);
            })
            ->with(['images', 'donor', 'targetOrganization'])
            ->withCount('requests')
            ->latest()
            ->paginate(20);

        return $this->respond(ItemListingResource::collection($items), [
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }
    /**
     * Organization clothing storage – items that the org has accepted/delivered.
     */
    public function orgStorage(string $orgPublicId)
    {
        $org = Organization::where('public_id', $orgPublicId)->firstOrFail();
        $this->authorize('view', $org);

        $items = ItemListing::query()
            ->whereHas('requests', function ($q) use ($org) {
                $q->where('organization_id', $org->id)
                  ->whereIn('status', ['accepted', 'delivered']);
            })
            ->with(['images', 'donor', 'targetOrganization', 'requests' => function ($q) use ($org) {
                $q->where('organization_id', $org->id)
                  ->whereIn('status', ['accepted', 'delivered']);
            }])
            ->withCount('requests')
            ->latest()
            ->paginate(20);

        // Compute summary stats
        $totalAccepted = ItemListing::whereHas('requests', function ($q) use ($org) {
            $q->where('organization_id', $org->id)->where('status', 'accepted');
        })->count();

        $totalDelivered = ItemListing::whereHas('requests', function ($q) use ($org) {
            $q->where('organization_id', $org->id)->where('status', 'delivered');
        })->count();

        $categoryCounts = ItemListing::query()
            ->whereHas('requests', function ($q) use ($org) {
                $q->where('organization_id', $org->id)
                  ->whereIn('status', ['accepted', 'delivered']);
            })
            ->whereNotNull('ai_category')
            ->selectRaw('ai_category, count(*) as count')
            ->groupBy('ai_category')
            ->pluck('count', 'ai_category');

        // Transform to include request info
        $transformed = $items->through(function ($item) {
            $req = $item->requests->first();
            $data = (new ItemListingResource($item))->resolve();
            $data['request_status'] = $req?->status;
            $data['request_public_id'] = $req?->public_id;
            return $data;
        });

        return response()->json([
            'data' => $transformed->items(),
            'meta' => [
                'pagination' => [
                    'current_page' => $items->currentPage(),
                    'last_page' => $items->lastPage(),
                    'total' => $items->total(),
                ],
                'summary' => [
                    'total_accepted' => $totalAccepted,
                    'total_delivered' => $totalDelivered,
                    'total_in_storage' => $totalAccepted + $totalDelivered,
                    'categories' => $categoryCounts,
                ],
            ],
        ]);
    }
}
