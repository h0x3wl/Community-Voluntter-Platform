<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;

class NotificationController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = $user->notifications();
        
        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        $notifications = $query->paginate(20);

        return $this->respond([
            'data' => $notifications->items(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
                'unread_count' => $user->unreadNotifications()->count(),
            ],
            // top level unread count for fast UI updates
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(Request $request, ?string $id = null)
    {
        $user = $request->user();

        if ($id) {
            $notification = $user->notifications()->where('id', $id)->firstOrFail();
            $notification->markAsRead();
        } else {
            $user->unreadNotifications->markAsRead();
        }

        return $this->respond([
            'message' => 'Notifications marked as read.',
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }
}
