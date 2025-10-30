<?php

namespace App\Console\Commands;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class TestNotification extends Command
{
    protected $signature = 'test:notification {userId?}';
    protected $description = 'Test real-time notification broadcasting';

    public function handle()
    {
        $userId = $this->argument('userId') ?? User::first()->id;
        $user = User::find($userId);

        if (!$user) {
            $this->error("User not found: {$userId}");
            return 1;
        }

        $this->info("Creating test notification for user: {$user->name} (ID: {$user->id})");

        // Create notification
        $notification = Notification::create([
            'id' => Str::uuid(),
            'notifiable_id' => $user->id,
            'notifiable_type' => User::class,
            'type' => 'test_notification',
            'data' => [
                'title' => 'Test Notification',
                'body' => 'This is a test notification sent at ' . now()->format('H:i:s'),
                'action_url' => '/dashboard',
                'icon' => 'bell',
            ],
        ]);

        $this->info("Notification created: {$notification->id}");

        // Broadcast the event
        $this->info("Broadcasting notification...");
        $this->info("Broadcast Config:");
        $this->info("  Driver: " . config('broadcasting.default'));
        $this->info("  Connection: " . config('broadcasting.connections.reverb.driver'));
        $this->info("  Host: " . config('broadcasting.connections.reverb.options.host'));
        $this->info("  Port: " . config('broadcasting.connections.reverb.options.port'));
        $this->info("  Key: " . config('broadcasting.connections.reverb.key'));
        
        try {
            broadcast(new NotificationCreated($notification, $user->id));
            $this->info("✅ Notification broadcast complete!");
        } catch (\Exception $e) {
            $this->info("❌ Broadcast failed: " . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
        
        $this->info("Channel: private-App.Models.User.{$user->id}");
        $this->info("Event: notification.created");
        
        return 0;
    }
}
