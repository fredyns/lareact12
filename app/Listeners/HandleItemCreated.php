<?php

namespace App\Listeners;

use App\Events\ItemCreated;
use App\Events\NotifyUser;
use App\Models\Notification;
use App\Models\Sample\Item;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Str;

/**
 * HandleItemCreated Listener
 *
 * Implements Fanout on Write (FOW) pattern:
 * 1. Get all affected users
 * 2. Prepare batch insert for notifications table
 * 3. Execute batch insert
 * 4. Dispatch NotifyUser event for each notification
 *
 * This listener is queued for async processing.
 */
class HandleItemCreated implements ShouldQueue
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
     * @param ItemCreated $event
     * @return void
     */
    public function handle(ItemCreated $event): void
    {
        $item = $event->model;

        // 1. Get all affected users (FOW - determine recipients)
        $affectedUsers = $this->getAffectedUsers($item);

        if ($affectedUsers->isEmpty()) {
            \Log::info("No users to notify for item created", ['item_id' => $item->id]);
            return;
        }

        // 2. Prepare batch insert data
        $notificationsData = [];
        $now = now();

        foreach ($affectedUsers as $user) {
            $notificationsData[] = [
                'id' => (string) Str::uuid(),
                'notifiable_type' => get_class($user),
                'notifiable_id' => $user->id,
                'type' => \App\Notifications\ItemCreated::class,
                'data' => json_encode([
                    'title' => 'New Item Created',
                    'body' => "Item '{$item->name}' was created",
                    'action_url' => "/sample/items/{$item->id}",
                    'icon' => 'plus-circle',
                    'item_id' => $item->id,
                    'item_name' => $item->name,
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // 3. Execute batch insert (FOW - Write phase)
        \DB::table('notifications')->insert($notificationsData);

        \Log::info("Batch inserted notifications", [
            'count' => count($notificationsData),
            'item_id' => $item->id,
        ]);

        // 4. Dispatch NotifyUser event for each notification (FOW - Fanout phase)
        // Hydrate models from batch data instead of querying database
        foreach ($notificationsData as $notificationData) {
            // Decode JSON data back to array for model
            $notificationData['data'] = json_decode($notificationData['data'], true);
            
            // Create and hydrate Notification model from array data
            $notification = (new Notification())->forceFill($notificationData);
            $notification->exists = true; // Mark as existing in database
            
            event(new NotifyUser($notification));
        }
    }

    /**
     * Get all users that should be notified
     *
     * Business logic to determine who gets notified.
     * Can be customized based on requirements.
     *
     * @param mixed $item
     * @return \Illuminate\Support\Collection<User>
     */
    protected function getAffectedUsers($item): \Illuminate\Support\Collection
    {
        // Get users to notify based on item relationships
        // In production, this could be:
        // - All users in a team
        // - Users following the item
        // - Users with specific permissions
        // - Users subscribed to notifications
        
        $users = collect();
        
        // Add item owner (creator)
        if ($item->user) {
            $users->push($item->user);
        }
        
        // Add user who created the item (if tracked separately and different from owner)
        if ($item->created_by && $item->creator) {
            $users->push($item->creator);
        }

        return $users->unique('id');
    }

    /**
     * Handle a job failure
     *
     * @param ItemCreated $event
     * @param \Throwable $exception
     * @return void
     */
    public function failed(ItemCreated $event, \Throwable $exception): void
    {
        \Log::error("Failed to handle ItemCreated event", [
            'item_id' => $event->model->id ?? null,
            'error' => $exception->getMessage(),
        ]);
    }
}
