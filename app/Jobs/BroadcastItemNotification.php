<?php

namespace App\Jobs;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

/**
 * BroadcastItemNotification Job
 *
 * Handles Fanout on Write (FOW) pattern for item notifications.
 * Creates notification in database and broadcasts to Reverb.
 *
 * This job runs asynchronously to avoid blocking HTTP responses.
 */
class BroadcastItemNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 3;

    /**
     * Constructor
     *
     * @param string $userId User ID to notify
     * @param string $notificationType Notification class name
     * @param array $notificationData Notification data
     */
    public function __construct(
        public string $userId,
        public string $notificationType,
        public array $notificationData
    ) {
        $this->onQueue('notifications');
    }

    /**
     * Execute the job
     *
     * Implements Fanout on Write (FOW):
     * 1. Write notification to database
     * 2. Broadcast to Reverb (real-time)
     *
     * @return void
     */
    public function handle(): void
    {
        // Find the user
        $user = User::find($this->userId);
        
        if (!$user) {
            \Log::warning("User not found for notification", ['user_id' => $this->userId]);
            return;
        }

        // Create notification in database (Write)
        $notification = Notification::create([
            'id' => Str::uuid(),
            'notifiable_id' => $user->id,
            'notifiable_type' => get_class($user),
            'type' => $this->notificationType,
            'data' => $this->notificationData,
        ]);

        // Broadcast to Reverb (Fanout)
        broadcast(new NotificationCreated($notification, $user->id));

        \Log::info("Notification broadcast completed", [
            'notification_id' => $notification->id,
            'user_id' => $user->id,
            'type' => $this->notificationType,
        ]);
    }

    /**
     * Handle a job failure
     *
     * @param \Throwable $exception
     * @return void
     */
    public function failed(\Throwable $exception): void
    {
        \Log::error("Failed to broadcast notification", [
            'user_id' => $this->userId,
            'type' => $this->notificationType,
            'error' => $exception->getMessage(),
        ]);
    }
}
