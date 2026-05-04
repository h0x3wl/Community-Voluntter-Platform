<?php

namespace App\Http\Controllers\Api\Org;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Org\OrganizationStoreRequest;
use App\Http\Requests\Org\OrganizationUpdateRequest;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use App\Models\OrganizationMember;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class OrganizationController extends ApiController
{
    public function store(OrganizationStoreRequest $request)
    {
        $data = collect($request->validated())->except('legal_document')->toArray();

        // Handle legal document upload
        if ($request->hasFile('legal_document')) {
            $path = $request->file('legal_document')->store('organizations/legal_docs', 'public');
            $data['legal_document'] = '/storage/' . $path;
        }

        $org = Organization::create(array_merge($data, [
            'public_id' => Str::uuid(),
            'status' => 'pending',
        ]));

        OrganizationMember::create([
            'organization_id' => $org->id,
            'user_id' => $request->user()->id,
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        // Notify all platform admins about the new org
        $admins = \App\Models\User::where('role', 'platform_admin')->get();
        \Illuminate\Support\Facades\Notification::send(
            $admins,
            new \App\Notifications\AdminNewOrgRegisteredNotification($org)
        );

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

    public function uploadLogo(Request $request, string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('update', $org);

        $request->validate([
            'logo' => ['required', 'image', 'max:5120'], // 5MB max
        ]);

        $path = $request->file('logo')->store('organizations', 'public');
        $url = '/storage/' . $path;
        
        $org->update(['logo_url' => $url]);

        return $this->respond(new OrganizationResource($org->refresh()));
    }
}
