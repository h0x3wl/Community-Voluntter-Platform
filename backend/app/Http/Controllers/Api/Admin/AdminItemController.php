<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\ItemListingResource;
use App\Models\ItemListing;

class AdminItemController extends ApiController
{
    public function index()
    {
        $status = request()->query('status', 'pending_review');
        $items = ItemListing::where('status', $status)->latest()->paginate(15);

        return $this->respond(ItemListingResource::collection($items), [
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function approve(string $publicId)
    {
        $item = ItemListing::where('public_id', $publicId)->firstOrFail();
        $item->update([
            'status' => 'approved',
            'approved_by' => request()->user()->id,
            'approved_at' => now(),
        ]);

        return $this->respond(new ItemListingResource($item));
    }

    public function reject(string $publicId)
    {
        $item = ItemListing::where('public_id', $publicId)->firstOrFail();
        $item->update([
            'status' => 'rejected',
            'approved_by' => request()->user()->id,
            'approved_at' => now(),
        ]);

        return $this->respond(new ItemListingResource($item));
    }
}
