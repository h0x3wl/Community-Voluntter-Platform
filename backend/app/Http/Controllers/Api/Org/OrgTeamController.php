<?php

namespace App\Http\Controllers\Api\Org;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Org\OrganizationInviteRequest;
use App\Http\Requests\Org\OrganizationMemberUpdateRequest;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Notifications\OrgInviteNotification;
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

        // Send notification to the invited user
        $user->notify(new OrgInviteNotification($org, $request->input('role'), $request->user()));

        return $this->respond([
            'member_id' => $member->id,
            'user_public_id' => $user->public_id,
            'role' => $member->role,
        ]);
    }

    public function update(OrganizationMemberUpdateRequest $request, string $publicId, string $memberId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageTeam', $org);

        $member = OrganizationMember::where('organization_id', $org->id)->where('id', $memberId)->first();
        if (!$member) {
            // Fallback: find by user public_id
            $user = User::where('public_id', $memberId)->first();
            if ($user) {
                $member = OrganizationMember::where('organization_id', $org->id)->where('user_id', $user->id)->first();
            }
        }

        if (!$member) {
            return $this->respond(['message' => 'Member not found.'], 404);
        }

        // Cannot change the owner's role
        if ($member->role === 'owner') {
            return $this->respond(['message' => 'Cannot change the owner\'s role.'], 403);
        }

        // Only owner can edit an admin's role
        $currentMember = OrganizationMember::where('organization_id', $org->id)
            ->where('user_id', $request->user()->id)
            ->first();
        if ($member->role === 'admin' && $currentMember?->role !== 'owner') {
            return $this->respond(['message' => 'Only the owner can change an admin\'s role.'], 403);
        }

        // Cannot set anyone to owner role
        $newRole = $request->input('role');
        if ($newRole === 'owner') {
            return $this->respond(['message' => 'Cannot assign owner role.'], 403);
        }

        $member->update(['role' => $newRole]);

        return $this->respond(['message' => 'Role updated.']);
    }

    public function destroy(string $publicId, string $memberId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('manageTeam', $org);

        // Find the member
        $member = OrganizationMember::where('organization_id', $org->id)->where('id', $memberId)->first();

        if (!$member) {
            // Fallback: try to find user by public_id and delete their membership
            $user = User::where('public_id', $memberId)->first();
            if ($user) {
                $member = OrganizationMember::where('organization_id', $org->id)
                    ->where('user_id', $user->id)
                    ->first();
            }
        }

        // Cannot remove the owner
        if ($member && $member->role === 'owner') {
            return $this->respond(['message' => 'Cannot remove the organization owner.'], 403);
        }

        // Only owner can remove an admin
        if ($member && $member->role === 'admin') {
            $currentMember = OrganizationMember::where('organization_id', $org->id)
                ->where('user_id', request()->user()->id)
                ->first();
            if ($currentMember?->role !== 'owner') {
                return $this->respond(['message' => 'Only the owner can remove an admin.'], 403);
            }
        }

        if ($member) {
            $member->delete();
        }

        return $this->respond(['message' => 'Member removed.']);
    }
}
