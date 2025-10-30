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
        // The event implements ShouldBroadcastNow so it broadcasts immediately
        event(new NotificationCreated($notification, $notification->notifiable_id));
    }
}
