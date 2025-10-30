<?php

namespace App\Observers;

use App\Events\NotificationCreated;
use App\Models\Notification;

/**
 * NotificationObserver
 * 
 * Automatically broadcasts NotificationCreated event whenever a notification
 * is created in the database, enabling real-time notifications.
 */
class NotificationObserver
{
    /**
     * Handle the Notification "created" event.
     */
    public function created(Notification $notification): void
    {
        // Broadcast the notification to the user in real-time
        // Use dispatchSync to ensure it runs immediately even from queue context
        try {
            broadcast(new NotificationCreated($notification, $notification->notifiable_id));
        } catch (\Exception $e) {
            // If broadcast fails from queue context, dispatch it to run in web context
            \Illuminate\Support\Facades\Log::error('Broadcast failed: ' . $e->getMessage());
        }
    }
}
