<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * NotificationDeleted Event
 *
 * Broadcasts when a single notification is deleted.
 * Notifies all other tabs/devices to remove the notification from their UI.
 */
class NotificationDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Constructor
     *
     * @param string $notificationId The ID of the deleted notification
     * @param string $userId The user ID who owns the notification
     */
    public function __construct(
        public string $notificationId,
        public string $userId
    ) {
    }

    /**
     * Get the channels the event should broadcast on
     *
     * Uses private channel to ensure only the recipient receives the update.
     * Channel format: private-App.Models.User.{userId}
     *
     * @return array<\Illuminate\Broadcasting\Channel> List of broadcast channels
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
     * @return array Notification ID that was deleted
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->notificationId,
        ];
    }

    /**
     * Get the name of the event to broadcast as
     *
     * @return string Event name for frontend listeners
     */
    public function broadcastAs(): string
    {
        return 'notification.deleted';
    }
}
