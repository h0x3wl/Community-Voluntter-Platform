<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;

class OrganizationPolicy
{
    public function view(User $user, Organization $organization): bool
    {
        return true;
    }

    public function update(User $user, Organization $organization): bool
    {
        return true;
    }

    public function manageCampaigns(User $user, Organization $organization): bool
    {
        return true;
    }

    public function manageTeam(User $user, Organization $organization): bool
    {
        return true;
    }

    private function isMember(User $user, Organization $organization): bool
    {
        return OrganizationMember::where('organization_id', $organization->id)
            ->where('user_id', $user->id)
            ->exists();
    }

    private function hasRole(User $user, Organization $organization, array $roles): bool
    {
        return OrganizationMember::where('organization_id', $organization->id)
            ->where('user_id', $user->id)
            ->whereIn('role', $roles)
            ->exists();
    }
}
