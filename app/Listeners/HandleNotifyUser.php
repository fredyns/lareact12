<?php

namespace App\Listeners;

use App\Events\NotifyUser;
use App\Events\NotifyUserByEmail;
use App\Events\NotifyUserInApp;
use App\Models\NotificationPreference;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

/**
 * HandleNotifyUser Listener
 *
 * Checks user's notification preferences and dispatches appropriate channel events:
 * - NotifyUserInApp (Reverb/WebSocket)
 * - NotifyUserByEmail (Email)
 *
 * This listener is queued for async processing.
 */
class HandleNotifyUser implements ShouldQueue
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
     * Handle the event
     *
     * @param NotifyUser $event
     * @return void
     */
    public function handle(NotifyUser $event): void
    {
        $notification = $event->notification;
        $user = $notification->notifiable;

        if (!$user) {
            \Log::warning("User not found for notification", [
                'notification_id' => $notification->id,
                'notifiable_id' => $notification->notifiable_id,
            ]);
            return;
        }

        // Get user's notification preferences
        $preferences = $this->getUserPreferences($user, $notification->type);

        \Log::info("Processing notification with preferences", [
            'notification_id' => $notification->id,
            'user_id' => $user->id,
            'type' => $notification->type,
            'in_app_enabled' => $preferences['in_app'],
            'email_enabled' => $preferences['email'],
        ]);

        // Dispatch to appropriate channels based on preferences
        if ($preferences['in_app']) {
            event(new NotifyUserInApp($notification));
            \Log::info("Dispatched NotifyUserInApp", ['notification_id' => $notification->id]);
        }

        if ($preferences['email']) {
            event(new NotifyUserByEmail($notification));
            \Log::info("Dispatched NotifyUserByEmail", ['notification_id' => $notification->id]);
        }
    }

    /**
     * Get user's notification preferences for the given notification type
     *
     * @param \App\Models\User $user
     * @param string $notificationType
     * @return array{in_app: bool, email: bool}
     */
    protected function getUserPreferences($user, string $notificationType): array
    {
        // Get preferences for this notification type
        $preferences = NotificationPreference::where('user_id', $user->id)
            ->where('type', $notificationType)
            ->get()
            ->keyBy('channel');

        // Check each channel
        $inAppPref = $preferences->get('in-app');
        $emailPref = $preferences->get('email');

        return [
            'in_app' => $inAppPref ? $inAppPref->enabled : true, // Default: enabled
            'email' => $emailPref ? $emailPref->enabled : true,  // Default: enabled
        ];
    }

    /**
     * Handle a job failure
     *
     * @param NotifyUser $event
     * @param \Throwable $exception
     * @return void
     */
    public function failed(NotifyUser $event, \Throwable $exception): void
    {
        \Log::error("Failed to handle NotifyUser event", [
            'notification_id' => $event->notification->id ?? null,
            'error' => $exception->getMessage(),
        ]);
    }
}
