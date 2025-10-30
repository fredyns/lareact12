<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * NotificationsAllRead Event
 *
 * Broadcasts when all notifications are marked as read for a user.
 * Notifies all other tabs/devices to update all notification statuses.
 *
 * @see \App\Models\User
 */
class NotificationsAllRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Constructor
     *
     * @param User $user The user whose notifications were all marked as read
     */
    public function __construct(public User $user)
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
            new PrivateChannel("App.Models.User.{$this->user->id}"),
        ];
    }

    /**
     * Get the data to broadcast
     *
     * @return array Event data with timestamp
     */
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->user->id,
            'marked_at' => now()->toISOString(),
        ];
    }

    /**
     * Get the name of the event to broadcast as
     *
     * @return string Event name for frontend listeners
     */
    public function broadcastAs(): string
    {
        return 'notifications.all-read';
    }
}
