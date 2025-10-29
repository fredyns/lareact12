# Notification Preferences Seeder

## Overview

The `NotificationPreferenceSeeder` creates default notification preferences for all users in the system, enabling them to receive in-app notifications 24/7 without any quiet hours restrictions.

## What It Does

For each user in the system, the seeder creates notification preferences for:

### Notification Types
- `item_created` - When a new item is created
- `item_updated` - When an existing item is updated

### Notification Channels
- `in-app` - Real-time notifications via WebSocket (enabled by default)
- `email` - Email notifications via Mailgun/SendGrid (disabled by default)

## Configuration

### Default Settings
- **In-app notifications**: ✅ Enabled
- **Email notifications**: ❌ Disabled
- **Quiet hours**: None (users can receive notifications 24/7)

### Total Preferences Created
For each user, the seeder creates **4 preferences**:
1. `item_created` + `in-app` (enabled)
2. `item_created` + `email` (disabled)
3. `item_updated` + `in-app` (enabled)
4. `item_updated` + `email` (disabled)

## Usage

### Run the seeder individually:
```bash
php artisan db:seed --class=NotificationPreferenceSeeder
```

### Run with all seeders:
```bash
php artisan db:seed
```

### Run after creating new users:
```bash
# Create users first
php artisan db:seed --class=UserSeeder

# Then create their notification preferences
php artisan db:seed --class=NotificationPreferenceSeeder
```

## Features

✅ **Idempotent**: Safe to run multiple times - skips existing preferences
✅ **User-friendly**: Shows progress and summary messages
✅ **Flexible**: Easy to add new notification types or channels
✅ **Production-ready**: Checks for existing preferences before creating

## Example Output

```
INFO  Seeding database.

Creating notification preferences for 8 users...
✓ Created 32 notification preferences
✓ All users can now receive in-app notifications 24/7
```

## Customization

To modify default settings, edit the seeder:

```php
// Enable email notifications by default
'enabled' => true, // Instead of: $channel === 'in-app'

// Add quiet hours (10 PM to 8 AM)
'quiet_hours_start' => '22:00',
'quiet_hours_end' => '08:00',

// Add more notification types
protected array $notificationTypes = [
    'item_created',
    'item_updated',
    'user_mentioned',  // Add new type
];
```

## Database Structure

Each preference record contains:
- `id` - UUID primary key
- `user_id` - Foreign key to users table
- `type` - Notification type (e.g., 'item_created')
- `channel` - Delivery channel ('in-app' or 'email')
- `enabled` - Boolean flag
- `quiet_hours_start` - Optional time (HH:MM)
- `quiet_hours_end` - Optional time (HH:MM)
- `created_at` / `updated_at` - Timestamps

## Related Files

- **Model**: `app/Models/NotificationPreference.php`
- **Migration**: `database/migrations/2025_10_27_000001_create_notification_preferences_table.php`
- **Notifications**: 
  - `app/Notifications/ItemCreated.php`
  - `app/Notifications/ItemUpdated.php`

## Verification

Check created preferences:
```bash
# Count total preferences
php artisan tinker --execute="echo App\Models\NotificationPreference::count();"

# Count enabled in-app preferences
php artisan tinker --execute="echo App\Models\NotificationPreference::where('channel', 'in-app')->where('enabled', true)->count();"

# View preferences for a specific user
php artisan tinker --execute="App\Models\User::first()->notificationPreferences->each(fn(\$p) => print_r(\$p->toArray()));"
```
