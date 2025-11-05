<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * NotificationController
 *
 * Handles all notification-related API endpoints including:
 * - Listing and filtering notifications
 * - Marking notifications as read/unread
 * - Managing user notification preferences
 *
 * All endpoints require authentication via Sanctum.
 */
class NotificationController extends Controller
{
    /**
     * Get paginated notifications for authenticated user
     *
     * Supports filtering by read status and notification type.
     * Results are ordered by creation date (newest first).
     *
     * @param \Illuminate\Http\Request $request
     * @return \Inertia\Response
     *
     * @queryParam filter string Filter by status: 'unread' or 'read'. Optional.
     * @queryParam type string Filter by notification type. Optional.
     * @queryParam per_page int Number of results per page. Default: 20.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Notification::forUser($user->id);

        // Filter by read status
        if ($request->has('filter')) {
            if ($request->filter === 'unread') {
                $query->unread();
            } elseif ($request->filter === 'read') {
                $query->read();
            }
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        $notifications = $query->latest()
            ->paginate($request->get('per_page', 20));

        return Inertia::render('notifications', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Get unread and total notification counts
     *
     * Returns both unread count and total notification count for the user.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @response {
     *   "unread": 5,
     *   "total": 42
     * }
     */
    public function count(Request $request): JsonResponse
    {
        $user = $request->user();

        $unreadCount = Notification::forUser($user->id)
            ->unread()
            ->count();

        $totalCount = Notification::forUser($user->id)->count();

        return response()->json([
            'unread' => $unreadCount,
            'total' => $totalCount,
        ]);
    }

    /**
     * Mark a single notification as read
     *
     * Updates the read_at timestamp for the specified notification.
     * Verifies ownership before updating.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $id The notification ID
     * @return \Illuminate\Http\JsonResponse
     *
     * @response {
     *   "success": true
     * }
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);

        // Verify ownership
        if ($notification->notifiable_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->markAsRead();

        // Broadcast the read event to all user's tabs
        broadcast(new \App\Events\NotificationRead($notification))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read for the user
     *
     * Updates read_at timestamp for all unread notifications.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @response {
     *   "success": true
     * }
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        Notification::forUser($user->id)
            ->unread()
            ->update(['read_at' => now()]);

        // Broadcast the "all read" event to all user's tabs
        broadcast(new \App\Events\NotificationsAllRead($user))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification
     *
     * Permanently removes the specified notification.
     * Verifies ownership before deletion.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $id The notification ID
     * @return \Illuminate\Http\JsonResponse
     *
     * @response {
     *   "success": true
     * }
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);

        // Verify ownership
        if ($notification->notifiable_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notificationId = $notification->id;
        $userId = $notification->notifiable_id;

        $notification->delete();

        // Broadcast the deletion event to all user's tabs
        broadcast(new \App\Events\NotificationDeleted($notificationId, $userId))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Delete all notifications for the user
     *
     * Permanently removes all notifications belonging to the authenticated user.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @response {
     *   "success": true,
     *   "deleted": 42
     * }
     */
    public function destroyAll(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = Notification::forUser($user->id)->delete();

        // Broadcast the "all deleted" event to all user's tabs
        broadcast(new \App\Events\NotificationsAllDeleted($user))->toOthers();

        return response()->json([
            'success' => true,
            'deleted' => $count,
        ]);
    }

    /**
     * Get all notification preferences for the user
     *
     * Returns preferences grouped by notification type.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPreferences(Request $request): JsonResponse
    {
        $user = $request->user();

        $preferences = NotificationPreference::forUser($user->id)
            ->get()
            ->groupBy('type');

        return response()->json($preferences);
    }

    /**
     * Update or create a notification preference
     *
     * Allows users to enable/disable notifications per type and channel,
     * and configure quiet hours.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam type string required The notification type (e.g., 'item_created')
     * @bodyParam channel string required The delivery channel: 'in-app' or 'email'
     * @bodyParam enabled boolean required Whether to enable this preference
     * @bodyParam quiet_hours_start string optional Start time in H:i format (e.g., '22:00')
     * @bodyParam quiet_hours_end string optional End time in H:i format (e.g., '08:00')
     */
    public function updatePreference(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'type' => 'required|string',
            'channel' => 'required|string|in:in-app,email',
            'enabled' => 'required|boolean',
            'quiet_hours_start' => 'nullable|date_format:H:i',
            'quiet_hours_end' => 'nullable|date_format:H:i',
        ]);

        $preference = NotificationPreference::updateOrCreate(
            [
                'user_id' => $user->id,
                'type' => $validated['type'],
                'channel' => $validated['channel'],
            ],
            [
                'enabled' => $validated['enabled'],
                'quiet_hours_start' => $validated['quiet_hours_start'] ?? null,
                'quiet_hours_end' => $validated['quiet_hours_end'] ?? null,
            ]
        );

        return response()->json($preference);
    }

    /**
     * Reset all notification preferences to defaults
     *
     * Deletes all existing preferences and creates default preferences
     * for all notification types and channels (all enabled).
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @response {
     *   "success": true
     * }
     */
    public function resetPreferences(Request $request): JsonResponse
    {
        $user = $request->user();

        NotificationPreference::forUser($user->id)->delete();

        // Create default preferences
        $types = ['item_created', 'item_updated', 'item_deleted'];
        $channels = ['in-app', 'email'];

        foreach ($types as $type) {
            foreach ($channels as $channel) {
                NotificationPreference::create([
                    'user_id' => $user->id,
                    'type' => $type,
                    'channel' => $channel,
                    'enabled' => true,
                ]);
            }
        }

        return response()->json(['success' => true]);
    }
}
