<?php

namespace App\Http\Controllers\Api\Org;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Org\OrganizationStoreRequest;
use App\Http\Requests\Org\OrganizationUpdateRequest;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use App\Models\OrganizationMember;
use Illuminate\Support\Str;

class OrganizationController extends ApiController
{
    public function store(OrganizationStoreRequest $request)
    {
        $org = Organization::create(array_merge($request->validated(), [
            'public_id' => Str::uuid(),
            'status' => 'pending',
        ]));

        OrganizationMember::create([
            'organization_id' => $org->id,
            'user_id' => $request->user()->id,
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        return $this->respond(new OrganizationResource($org));
    }

    public function show(string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('view', $org);

        return $this->respond(new OrganizationResource($org));
    }

    public function update(OrganizationUpdateRequest $request, string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('update', $org);
        $org->update($request->validated());

        return $this->respond(new OrganizationResource($org->refresh()));
    }
}
