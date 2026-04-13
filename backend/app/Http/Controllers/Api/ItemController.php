<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Items\ItemImageUploadRequest;
use App\Http\Requests\Items\ItemListingStoreRequest;
use App\Http\Resources\ItemListingResource;
use App\Models\ItemListing;

class ItemController extends ApiController
{
    public function index()
    {
        $items = ItemListing::query()
            ->where('status', 'approved')
            ->with('images')
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
        $item = ItemListing::with('images')->where('public_id', $publicId)->firstOrFail();

        return $this->respond(new ItemListingResource($item));
    }

    public function store(ItemListingStoreRequest $request)
    {
        $data = $request->validated();

        $listing = ItemListing::create(array_merge($data, [
            'public_id' => \Illuminate\Support\Str::uuid(),
            'donor_user_id' => $request->user()->id,
            'status' => 'pending_review',
        ]));

        return $this->respond(new ItemListingResource($listing), ['message' => 'Item listing submitted.']);
    }

    public function uploadImage(ItemImageUploadRequest $request, string $publicId)
    {
        $listing = ItemListing::where('public_id', $publicId)
            ->where('donor_user_id', $request->user()->id)
            ->firstOrFail();

        $path = $request->file('image')->store('items', 'public');
        $url = \Illuminate\Support\Facades\Storage::disk('public')->url($path);
        $listing->images()->create([
            'image_url' => $url,
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return $this->respond(new ItemListingResource($listing->load('images')));
    }
}
