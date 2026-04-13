<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Items\ItemListingUpdateRequest;
use App\Http\Resources\ItemListingResource;
use App\Models\ItemListing;

class UserItemController extends ApiController
{
    public function index()
    {
        $items = request()->user()->itemListings()->with('images')->latest()->paginate(15);

        return $this->respond(ItemListingResource::collection($items), [
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function update(ItemListingUpdateRequest $request, string $publicId)
    {
        $listing = ItemListing::where('public_id', $publicId)
            ->where('donor_user_id', $request->user()->id)
            ->firstOrFail();

        $listing->update($request->validated());

        return $this->respond(new ItemListingResource($listing->refresh()));
    }
}
