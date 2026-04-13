<?php

namespace App\Http\Controllers\Api\Org;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Org\OrganizationInviteRequest;
use App\Http\Requests\Org\OrganizationMemberUpdateRequest;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use Illuminate\Support\Str;

class OrgTeamController extends ApiController
{
    public function index(string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('view', $org);

        $members = $org->members()->withPivot('role', 'joined_at')->get()->map(function ($user) {
            return [
                'id' => $user->pivot->id,
                'public_id' => $user->public_id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'role' => $user->pivot->role,
                'joined_at' => optional($user->pivot->joined_at)->toIso8601String(),
            ];
        });

        return $this->respond($members);
    }

    public function invite(OrganizationInviteRequest $request, string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageTeam', $org);

        $user = User::where('email', $request->input('email'))->first();
        if (! $user) {
            $user = User::create([
                'public_id' => Str::uuid(),
                'first_name' => 'Invited',
                'last_name' => 'User',
                'email' => $request->input('email'),
                'password' => Str::random(16),
                'role' => 'user',
            ]);
        }

        $member = OrganizationMember::updateOrCreate(
            ['organization_id' => $org->id, 'user_id' => $user->id],
            [
                'role' => $request->input('role'),
                'invited_by_user_id' => $request->user()->id,
                'joined_at' => now(),
            ]
        );

        return $this->respond([
            'member_id' => $member->id,
            'user_public_id' => $user->public_id,
            'role' => $member->role,
        ]);
    }

    public function update(OrganizationMemberUpdateRequest $request, string $publicId, int $memberId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageTeam', $org);

        $member = OrganizationMember::where('organization_id', $org->id)->findOrFail($memberId);
        $member->update(['role' => $request->input('role')]);

        return $this->respond(['message' => 'Role updated.']);
    }

    public function destroy(string $publicId, int $memberId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageTeam', $org);

        OrganizationMember::where('organization_id', $org->id)->where('id', $memberId)->delete();

        return $this->respond(['message' => 'Member removed.']);
    }
}
