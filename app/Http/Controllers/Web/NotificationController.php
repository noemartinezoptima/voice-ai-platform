<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\UserNotificationModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = UserNotificationModel::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        $unread = UserNotificationModel::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'count' => UserNotificationModel::where('user_id', $request->user()->id)->whereNull('read_at')->count(),
            'items' => $unread,
        ]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        UserNotificationModel::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        UserNotificationModel::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return redirect()->route('notifications.index')
            ->with('success', 'All notifications marked as read.');
    }
}
