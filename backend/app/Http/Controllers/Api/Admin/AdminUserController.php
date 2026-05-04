<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\UserResource;
use App\Models\User;

class AdminUserController extends ApiController
{
    public function index()
    {
        $users = User::query()->latest()->paginate(20);

        return $this->respond(UserResource::collection($users), [
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function destroy(string $publicId)
    {
        $user = User::where('public_id', $publicId)->firstOrFail();
        $user->forceDelete();

        return $this->respond(['message' => 'User permanently deleted.']);
    }
}
