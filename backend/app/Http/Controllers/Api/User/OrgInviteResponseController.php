<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\ApiController;
use App\Models\OrganizationMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrgInviteResponseController extends ApiController
{
    public function accept(Request $request, string $notificationId)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $notificationId)->firstOrFail();

        $data = $notification->data;
        if (($data['type'] ?? '') !== 'org_invite') {
            return $this->respond(['message' => 'This notification is not an organization invite.'], 422);
        }

        // The membership was already created during the invite, so just mark notification as read
        $notification->markAsRead();

        return $this->respond(['message' => 'Invitation accepted.']);
    }

    public function reject(Request $request, string $notificationId)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $notificationId)->firstOrFail();

        $data = $notification->data;
        if (($data['type'] ?? '') !== 'org_invite') {
            return $this->respond(['message' => 'This notification is not an organization invite.'], 422);
        }

        // Remove the membership
        $orgPublicId = $data['organization_id'] ?? null;
        if ($orgPublicId) {
            $org = \App\Models\Organization::where('public_id', $orgPublicId)->first();
            if ($org) {
                OrganizationMember::where('organization_id', $org->id)
                    ->where('user_id', $user->id)
                    ->delete();
            }
        }

        // Mark notification as read
        $notification->markAsRead();

        return $this->respond(['message' => 'Invitation declined.']);
    }
}
