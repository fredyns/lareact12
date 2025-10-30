<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * NotificationRead Event
 *
 * Broadcasts when a single notification is marked as read.
 * Notifies all other tabs/devices to update the notification status.
 *
 * @see \App\Models\Notification
 */
class NotificationRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Constructor
     *
     * @param Notification $notification The notification that was marked as read
     */
    public function __construct(public Notification $notification)
    {
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
            new PrivateChannel("App.Models.User.{$this->notification->notifiable_id}"),
        ];
    }

    /**
     * Get the data to broadcast
     *
     * @return array Notification data with read_at timestamp
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'data' => $this->notification->data,
            'created_at' => $this->notification->created_at,
            'read_at' => $this->notification->read_at,
        ];
    }

    /**
     * Get the name of the event to broadcast as
     *
     * @return string Event name for frontend listeners
     */
    public function broadcastAs(): string
    {
        return 'notification.read';
    }
}
