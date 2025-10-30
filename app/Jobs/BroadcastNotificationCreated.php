<?php

namespace App\Jobs;

use App\Events\NotificationCreated;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * BroadcastNotificationCreated Job
 * 
 * Broadcasts a notification creation event to connected WebSocket clients.
 * This job is dispatched synchronously to ensure broadcasts happen from
 * the web context, not the queue worker context.
 */
class BroadcastNotificationCreated implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Notification $notification,
        public string $userId
    ) {
        // Use the 'sync' queue to run immediately in web context
        $this->onQueue('sync');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        broadcast(new NotificationCreated($this->notification, $this->userId));
    }
}
