<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\NotificationPreference;
use Illuminate\Database\Seeder;

/**
 * NotificationPreferenceSeeder
 *
 * Seeds notification preferences for all users, enabling in-app notifications
 * for all notification types with no quiet hours restrictions.
 */
class NotificationPreferenceSeeder extends Seeder
{
    /**
     * The notification types to create preferences for
     *
     * @var array
     */
    protected array $notificationTypes = [
        'item_created',
        'item_updated',
    ];

    /**
     * The notification channels to create preferences for
     *
     * @var array
     */
    protected array $channels = [
        'in-app',
        'email',
    ];

    /**
     * Run the database seeds.
     *
     * Creates notification preferences for all existing users.
     * Each user gets preferences for all notification types and channels.
     * In-app notifications are enabled by default, email notifications are disabled.
     *
     * @return void
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        $this->command->info("Creating notification preferences for {$users->count()} users...");

        $createdCount = 0;

        foreach ($users as $user) {
            foreach ($this->notificationTypes as $type) {
                foreach ($this->channels as $channel) {
                    // Check if preference already exists
                    $exists = NotificationPreference::where('user_id', $user->id)
                        ->where('type', $type)
                        ->where('channel', $channel)
                        ->exists();

                    if (!$exists) {
                        NotificationPreference::create([
                            'user_id' => $user->id,
                            'type' => $type,
                            'channel' => $channel,
                            'enabled' => $channel === 'in-app', // Enable in-app, disable email
                            'quiet_hours_start' => null,
                            'quiet_hours_end' => null,
                        ]);

                        $createdCount++;
                    }
                }
            }
        }

        $this->command->info("✓ Created {$createdCount} notification preferences");
        $this->command->info("✓ All users can now receive in-app notifications 24/7");
    }
}
