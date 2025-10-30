<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * NotificationCreated Event
 *
 * Broadcast event fired when a notification is created.
 * Sends real-time updates to connected users via WebSocket.
 *
 * @see \App\Models\Notification
 * @see \App\Listeners\SendItemCreatedNotification
 */
class NotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Constructor
     *
     * @param \App\Models\Notification $notification The notification that was created
     * @param string $userId The user ID receiving the notification
     */
    public function __construct(
        public Notification $notification,
        public string $userId
    ) {
    }

    /**
     * Get the channels the event should broadcast on
     *
     * Uses private channel to ensure only the recipient receives the notification.
     * Format: private-user.{userId}
     *
     * @return array List of broadcast channels
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("App.Models.User.{$this->userId}"),
        ];
    }

    /**
     * Get the data to broadcast
     *
     * Transforms the notification into a format suitable for broadcasting.
     *
     * @return array Notification data
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'data' => $this->notification->data,
            'created_at' => $this->notification->created_at,
        ];
    }

    /**
     * Get the name of the event to broadcast as
     *
     * @return string Event name for frontend listeners
     */
    public function broadcastAs(): string
    {
        return 'notification.created';
    }
}
