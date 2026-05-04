<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Organization;
use Illuminate\Http\Request;

class AdminOrganizationController extends ApiController
{
    public function index()
    {
        $query = Organization::withCount(['campaigns', 'members'])->latest();

        if ($search = request()->query('q')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status = request()->query('status')) {
            $query->where('status', $status);
        }

        $orgs = $query->paginate(20);

        return $this->respond($orgs->map(fn ($org) => [
            'id' => $org->id,
            'public_id' => $org->public_id,
            'name' => $org->name,
            'slug' => $org->slug,
            'description' => $org->description,
            'logo_url' => $org->logo_url,
            'website' => $org->website,
            'phone' => $org->phone,
            'city' => $org->city,
            'country' => $org->country,
            'status' => $org->status,
            'tax_id' => $org->tax_id,
            'license_number' => $org->license_number,
            'org_type' => $org->org_type,
            'authorized_rep_name' => $org->authorized_rep_name,
            'authorized_rep_id' => $org->authorized_rep_id,
            'legal_document' => $org->legal_document,
            'campaigns_count' => $org->campaigns_count,
            'members_count' => $org->members_count,
            'created_at' => $org->created_at,
        ]), [
            'pagination' => [
                'current_page' => $orgs->currentPage(),
                'last_page' => $orgs->lastPage(),
                'total' => $orgs->total(),
            ],
        ]);
    }

    public function update(string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();

        $org->update(request()->only([
            'name', 'description', 'status', 'website', 'phone', 'city', 'country',
            'org_type', 'tax_id', 'license_number', 'authorized_rep_name', 'authorized_rep_id',
        ]));

        return $this->respond([
            'public_id' => $org->public_id,
            'name' => $org->name,
            'status' => $org->status,
        ]);
    }

    public function destroy(string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $org->delete();

        return response()->json(null, 204);
    }
}
