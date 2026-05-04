<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Me\AvatarRequest;
use App\Http\Requests\Me\NotificationPreferencesRequest;
use App\Http\Requests\Me\UpdatePasswordRequest;
use App\Http\Requests\Me\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\UserNotificationPreference;
use Illuminate\Support\Facades\Storage;

class MeController extends ApiController
{
    public function show()
    {
        return $this->respond(new UserResource(request()->user()));
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return $this->respond(new UserResource($user->refresh()));
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $request->user()->update([
            'password' => $request->input('new_password'),
        ]);

        return $this->respond(['message' => 'Password updated.']);
    }

    public function updateNotifications(NotificationPreferencesRequest $request)
    {
        $prefs = UserNotificationPreference::firstOrCreate(['user_id' => $request->user()->id]);
        $prefs->update($request->validated());

        return $this->respond(['message' => 'Notification preferences updated.']);
    }

    public function uploadAvatar(AvatarRequest $request)
    {
        $user = $request->user();
        $path = $request->file('avatar')->store('avatars', 'public');
        $url = '/storage/' . $path;
        $user->update(['avatar_url' => $url]);

        return $this->respond(new UserResource($user->refresh()));
    }

    public function deleteAvatar()
    {
        $user = request()->user();
        $user->update(['avatar_url' => null]);

        return $this->respond(['message' => 'Avatar removed.']);
    }
}
