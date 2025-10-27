<?php

namespace App\Listeners;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use App\Notifications\ItemCreated;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * SendItemCreatedNotification Listener
 *
 * Handles the ItemCreated event by implementing Fanout on Write (FOW) strategy.
 * Determines recipients, batch inserts notifications, and dispatches notifications.
 *
 * @see \App\Events\ItemCreated
 * @see \App\Models\Notification
 * @see \App\Notifications\ItemCreated
 */
class SendItemCreatedNotification
{
    /**
     * Handle the ItemCreated event
     *
     * Implements Fanout on Write (FOW) strategy:
     * 1. Determine recipients
     * 2. Batch insert notifications (1 query vs N queries)
     * 3. Dispatch notifications to each recipient
     *
     * @param mixed $event The ItemCreated event
     * @return void
     */
    public function handle($event): void
    {
        $item = $event->model;

        Log::info('Item created event received', ['item_id' => $item->id]);

        // Determine recipients (admins and subscribers)
        $recipients = $this->getRecipients($item);

        if ($recipients->isEmpty()) {
            Log::info('No recipients for item notification', ['item_id' => $item->id]);
            return;
        }

        Log::info('Fanout started', [
            'item_id' => $item->id,
            'recipient_count' => $recipients->count(),
        ]);

        // Batch insert notifications
        $notifications = $this->fanoutNotifications($item, $recipients);

        // Broadcast to connected users (real-time via WebSocket)
        foreach ($notifications as $notification) {
            broadcast(new NotificationCreated($notification, $notification->notifiable_id))->toOthers();
        }

        // Send notifications to each recipient (email, etc)
        foreach ($recipients as $recipient) {
            $recipient->notify(new ItemCreated($item));
        }

        Log::info('Fanout completed', [
            'item_id' => $item->id,
            'recipients_notified' => $recipients->count(),
        ]);
    }

    /**
     * Determine who should receive this notification
     *
     * Currently sends to all active users except the creator.
     * Can be customized to filter by roles, permissions, or subscriptions.
     *
     * @param mixed $item The item that was created
     * @return \Illuminate\Database\Eloquent\Collection Collection of recipient users
     */
    private function getRecipients($item)
    {
        return User::query()
            ->where('id', '!=', $item->created_by) // Exclude creator
            ->where('active', true)
            ->get();
    }

    /**
     * Batch insert notifications for all recipients (FOW strategy)
     *
     * Creates a single INSERT query with multiple rows instead of N individual queries.
     * This significantly improves performance for large recipient lists.
     *
     * Performance: 50 recipients = 1 query (vs 50 queries)
     *
     * @param mixed $item The item that was created
     * @param \Illuminate\Database\Eloquent\Collection $recipients Collection of recipient users
     * @return \Illuminate\Database\Eloquent\Collection Collection of created notifications
     */
    private function fanoutNotifications($item, $recipients)
    {
        $notificationData = $recipients->map(function ($recipient) use ($item) {
            return [
                'id' => Str::uuid(),
                'notifiable_id' => $recipient->id,
                'notifiable_type' => User::class,
                'type' => 'item_created',
                'data' => json_encode([
                    'title' => 'New Item Created',
                    'body' => "Item '{$item->string}' just created",
                    'action_url' => route('sample.items.show', $item->id),
                    'icon' => 'package-plus',
                    'meta' => [
                        'item_id' => $item->id,
                        'item_name' => $item->string,
                        'created_by' => $item->created_by,
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        Notification::insert($notificationData);

        Log::info('Notifications fanned out', [
            'count' => count($notificationData),
        ]);

        // Return created notifications for broadcasting
        return Notification::whereIn('id', collect($notificationData)->pluck('id'))->get();
    }
}
