<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;

class OrganizationPolicy
{
    /**
     * Anyone can view an organization's public data.
     */
    public function view(User $user, Organization $organization): bool
    {
        return $this->isMember($user, $organization);
    }

    /**
     * Only owner and admin can update org settings.
     */
    public function update(User $user, Organization $organization): bool
    {
        return $this->hasRole($user, $organization, ['owner', 'admin']);
    }

    /**
     * Owner, admin, and manager can manage campaigns.
     */
    public function manageCampaigns(User $user, Organization $organization): bool
    {
        return $this->hasRole($user, $organization, ['owner', 'admin', 'manager']);
    }

    /**
     * Only owner and admin can manage team (invite, remove, edit roles).
     */
    public function manageTeam(User $user, Organization $organization): bool
    {
        return $this->hasRole($user, $organization, ['owner', 'admin']);
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
