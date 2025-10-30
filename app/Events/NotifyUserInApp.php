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
 * NotifyUserInApp Event
 *
 * Broadcasts notification to user via Laravel Reverb (WebSocket).
 * Implements ShouldBroadcastNow for immediate real-time delivery.
 *
 * @see \App\Models\Notification
 */
class NotifyUserInApp implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Constructor
     *
     * @param Notification $notification The notification to broadcast
     */
    public function __construct(public Notification $notification)
    {
    }

    /**
     * Get the channels the event should broadcast on
     *
     * Uses private channel to ensure only the recipient receives the notification.
     * Channel format: private-App.Models.User.{userId}
     *
     * The channel is authorized in routes/channels.php to ensure only
     * the authenticated user can listen to their own notifications.
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
        return 'notification.created';
    }
}
