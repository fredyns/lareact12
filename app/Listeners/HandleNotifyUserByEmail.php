<?php

namespace App\Listeners;

use App\Events\NotifyUserByEmail;
use App\Notifications\Sample\ItemCreated;
use App\Notifications\Sample\ItemUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

/**
 * HandleNotifyUserByEmail Listener
 *
 * Sends notification via email using Laravel's notification system.
 * This listener is queued for async processing.
 */
class HandleNotifyUserByEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The name of the queue the job should be sent to.
     */
    public string $queue = 'notifications';

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 10;

    /**
     * Handle the event
     *
     * @param NotifyUserByEmail $event
     * @return void
     */
    public function handle(NotifyUserByEmail $event): void
    {
        $notification = $event->notification;
        $user = $notification->notifiable;

        if (!$user) {
            \Log::warning("User not found for email notification", [
                'notification_id' => $notification->id,
            ]);
            return;
        }

        // Map notification type to Laravel notification class
        $laravelNotification = $this->createLaravelNotification($notification);

        if (!$laravelNotification) {
            \Log::warning("Unknown notification type for email", [
                'notification_id' => $notification->id,
                'type' => $notification->type,
            ]);
            return;
        }

        // Send email via Laravel's notification system
        $user->notify($laravelNotification);

        \Log::info("Email notification sent", [
            'notification_id' => $notification->id,
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }

    /**
     * Create Laravel notification instance based on notification type
     *
     * @param \App\Models\Notification $notification
     * @return \Illuminate\Notifications\Notification|null
     */
    protected function createLaravelNotification($notification): ?\Illuminate\Notifications\Notification
    {
        $data = $notification->data;
        
        // Extract item information from notification data
        $itemId = $data['item_id'] ?? null;
        $itemName = $data['item_name'] ?? 'Unknown Item';

        // Create a mock item object for the notification
        $item = (object) [
            'id' => $itemId,
            'name' => $itemName,
        ];

        return match ($notification->type) {
            ItemCreated::class => new ItemCreated($item),
            ItemUpdated::class => new ItemUpdated($item),
            default => null,
        };
    }

    /**
     * Handle a job failure
     *
     * @param NotifyUserByEmail $event
     * @param \Throwable $exception
     * @return void
     */
    public function failed(NotifyUserByEmail $event, \Throwable $exception): void
    {
        \Log::error("Failed to send email notification", [
            'notification_id' => $event->notification->id ?? null,
            'error' => $exception->getMessage(),
        ]);
    }
}
