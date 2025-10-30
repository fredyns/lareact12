# Notification System - Quick Start Guide

## Overview

Comprehensive notification system dengan multi-channel delivery (In-app, Email, Push) dan real-time updates via WebSocket.

**Architecture:**
```
Event Trigger → Notification Class → Queue → Delivery (Database + Broadcast + Email)
                                              ↓
                                         Frontend (React + Echo)
```

---

## Phase 1: Core Infrastructure (Week 1-2)

### Step 1.1: Database Setup

```bash
# Run migrations
php artisan migrate

# Files created:
# - database/migrations/2025_10_27_110000_create_notifications_table.php
# - database/migrations/2025_10_27_110100_create_notification_preferences_table.php
```

**Tables:**
- `notifications` - Store all notifications
- `notification_preferences` - User preferences per type/channel

---

### Step 1.2: Create Models

**Files:**
- `app/Models/Notification.php` - Main notification model
- `app/Models/NotificationPreference.php` - User preferences model

**Key Methods:**
```php
// Notification model
$notification->markAsRead();
$notification->isUnread();
Notification::unread()->get();

// NotificationPreference model
$preference->isEnabled();
$preference->isWithinQuietHours();
```

---

### Step 1.3: Create Notification Classes

**Location:** `app/Notifications/`

**Files to create:**
```
ItemCreated.php       - When item is created
ItemUpdated.php       - When item is updated
ItemDeleted.php       - When item is deleted
UserMentioned.php     - When user is mentioned
PermissionGranted.php - When permission is granted
RoleAssigned.php      - When role is assigned
```

**Template:**
```php
<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class ItemCreated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private $item)
    {
        $this->onQueue('notifications');
    }

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => 'Item Baru Dibuat',
            'body' => "Item '{$this->item->string}' telah dibuat",
            'action_url' => route('sample.items.show', $this->item->id),
            'icon' => 'package-plus',
            'meta' => ['item_id' => $this->item->id],
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }

    public function broadcastOn(): array
    {
        return ["private-user.{$this->notifiable->id}"];
    }
}
```

---

### Step 1.4: Dispatch Notifications

**In Model (app/Models/Sample/Item.php):**

```php
use App\Notifications\Sample\ItemCreated;

class Item extends Model
{
    protected $dispatchesEvents = [
        'created' => ItemCreated::class,
    ];
}
```

**Or in Controller:**

```php
use App\Notifications\Sample\ItemCreated;

// After creating item
$admins = User::role('admin')->get();
foreach ($admins as $admin) {
    $admin->notify(new ItemCreated($item));
}
```

---

### Step 1.5: Create API Endpoints

**File:** `app/Http/Controllers/NotificationController.php`

**Routes:** `routes/web.php`
```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('api/notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/count', [NotificationController::class, 'count']);
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });
    
    Route::prefix('api/notification-preferences')->group(function () {
        Route::get('/', [NotificationPreferenceController::class, 'index']);
        Route::put('/', [NotificationPreferenceController::class, 'update']);
        Route::post('/reset', [NotificationPreferenceController::class, 'reset']);
    });
});
```

**Key Endpoints:**
```
GET    /api/notifications              - List notifications (paginated)
GET    /api/notifications/count        - Get unread count
PATCH  /api/notifications/{id}/read    - Mark as read
PATCH  /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/{id}         - Delete notification

GET    /api/notification-preferences   - Get user preferences
PUT    /api/notification-preferences   - Update preferences
POST   /api/notification-preferences/reset - Reset to defaults
```

---

### Step 1.6: Queue Configuration

**File:** `.env`
```env
QUEUE_CONNECTION=redis
QUEUE_NAME=notifications
```

**Start Worker:**
```bash
# Development
php artisan queue:work redis --queue=notifications --tries=3 --timeout=60

# Or use Supervisor for production
```

---

## Phase 2: Real-time Features (Week 3)

### Step 2.1: Setup Broadcasting

**File:** `config/broadcasting.php`
```php
'default' => env('BROADCAST_DRIVER', 'soketi'),

'soketi' => [
    'driver' => 'pusher',
    'key' => env('SOKETI_APP_KEY', 'app-key'),
    'secret' => env('SOKETI_APP_SECRET', 'app-secret'),
    'app_id' => env('SOKETI_APP_ID', 'app-id'),
    'options' => [
        'host' => env('SOKETI_HOST', 'localhost'),
        'port' => env('SOKETI_PORT', 6001),
        'scheme' => env('SOKETI_SCHEME', 'http'),
    ],
],
```

**File:** `.env`
```env
BROADCAST_DRIVER=soketi
SOKETI_APP_ID=app-id
SOKETI_APP_KEY=app-key
SOKETI_APP_SECRET=app-secret
SOKETI_HOST=localhost
SOKETI_PORT=6001
SOKETI_SCHEME=http
```

### Step 2.2: Setup Private Channels

**File:** `routes/channels.php`
```php
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
```

### Step 2.3: Setup Laravel Echo

**Install packages:**
```bash
npm install laravel-echo pusher-js
```

**File:** `resources/js/lib/echo.ts`
```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_KEY || 'app-key',
    cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'mt1',
    forceTLS: false,
    wsHost: import.meta.env.VITE_SOKETI_HOST || 'localhost',
    wsPort: import.meta.env.VITE_SOKETI_PORT || 6001,
    wssPort: import.meta.env.VITE_SOKETI_PORT || 6001,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-XSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
    },
});
```

### Step 2.4: Create React Components

**File:** `resources/js/components/notifications/NotificationBell.tsx`
```typescript
import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { echo } from '@/lib/echo';

export function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
        
        // Subscribe to real-time updates
        const channel = echo.private(`user.${userId}`);
        channel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (payload) => {
            fetchNotifications();
        });

        return () => {
            echo.leaveChannel(`private-user.${userId}`);
        };
    }, []);

    const fetchNotifications = async () => {
        const response = await fetch('/api/notifications');
        const data = await response.json();
        setNotifications(data.data);
        setUnreadCount(data.unread_count);
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {/* Notification list */}
                </div>
            )}
        </div>
    );
}
```

---

## Phase 3: Extended Features (Week 4)

### Step 3.1: Email Notifications

**Update Notification Class:**
```php
public function via($notifiable): array
{
    $channels = ['database', 'broadcast'];
    
    // Check user preference
    $emailPref = $notifiable->notificationPreferences()
        ->where('type', 'item_created')
        ->where('channel', 'email')
        ->first();
    
    if ($emailPref?->isEnabled()) {
        $channels[] = 'mail';
    }
    
    return $channels;
}

public function toMail($notifiable)
{
    return (new MailMessage)
        ->subject('Item Baru Dibuat')
        ->greeting("Halo {$notifiable->name}!")
        ->line("Item '{$this->item->string}' telah dibuat.")
        ->action('Lihat Item', route('sample.items.show', $this->item->id));
}
```

### Step 3.2: Notification Preferences UI

**File:** `resources/js/pages/notifications/Preferences.tsx`
```typescript
import { useState, useEffect } from 'react';
import { Card, Button, Switch } from '@/components/ui';

export function NotificationPreferences() {
    const [preferences, setPreferences] = useState([]);

    useEffect(() => {
        fetch('/api/notification-preferences')
            .then(r => r.json())
            .then(data => setPreferences(data));
    }, []);

    const handleToggle = async (id, field, value) => {
        await fetch(`/api/notification-preferences/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ [field]: value }),
        });
    };

    return (
        <div className="space-y-4">
            {preferences.map(pref => (
                <Card key={pref.id} className="p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">{pref.type}</p>
                            <p className="text-sm text-gray-500">{pref.channel}</p>
                        </div>
                        <Switch
                            checked={pref.enabled}
                            onChange={(value) => handleToggle(pref.id, 'enabled', value)}
                        />
                    </div>
                </Card>
            ))}
        </div>
    );
}
```

---

## Phase 4: Testing & Deployment (Week 5)

### Step 4.1: Unit Tests

**File:** `tests/Unit/Notifications/ItemCreatedTest.php`

```php
<?php

namespace Tests\Unit\Notifications;

use App\Models\Sample\Item;use App\Models\User;use Illuminate\Support\Facades\Notification;use Tests\TestCase;

class ItemCreatedTest extends TestCase
{
    public function test_notification_has_correct_data()
    {
        $item = Item::factory()->create();
        $user = User::factory()->create();

        $notification = new \App\Notifications\Sample\ItemCreated($item);
        $data = $notification->toDatabase($user);

        $this->assertEquals('Item Baru Dibuat', $data['title']);
        $this->assertStringContainsString($item->string, $data['body']);
    }

    public function test_notification_is_queued()
    {
        Notification::fake();
        
        $user = User::factory()->create();
        $item = Item::factory()->create();

        $user->notify(new \App\Notifications\Sample\ItemCreated($item));

        Notification::assertSentTo($user, \App\Notifications\Sample\ItemCreated::class);
    }
}
```

### Step 4.2: Feature Tests

**File:** `tests/Feature/Notifications/NotificationApiTest.php`
```php
<?php

namespace Tests\Feature\Notifications;

use App\Models\User;
use App\Models\Notification;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    public function test_get_notifications_paginated()
    {
        $user = User::factory()->create();
        Notification::factory(25)->create(['notifiable_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/notifications?page=1');

        $response->assertStatus(200);
        $this->assertCount(20, $response['data']);
    }

    public function test_mark_notification_as_read()
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->create(['notifiable_id' => $user->id]);

        $response = $this->actingAs($user)
            ->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(204);
        $this->assertNotNull($notification->fresh()->read_at);
    }
}
```

---

## Soketi Setup (Docker)

### Option 1: Docker Compose

**File:** `docker-compose.yml`
```yaml
version: '3.8'

services:
  soketi:
    image: soketi/soketi:latest
    ports:
      - "6001:6001"
    environment:
      SOKETI_APP_ID: app-id
      SOKETI_APP_KEY: app-key
      SOKETI_APP_SECRET: app-secret
      SOKETI_DEBUG: "1"
    volumes:
      - soketi-data:/data
    networks:
      - lareact12

volumes:
  soketi-data:

networks:
  lareact12:
    driver: bridge
```

**Start:**
```bash
docker-compose up -d reverb
```

### Option 2: Artisan Command

```bash
docker run -d \
  -p 6001:6001 \
  -e SOKETI_APP_ID=app-id \
  -e SOKETI_APP_KEY=app-key \
  -e SOKETI_APP_SECRET=app-secret \
  --name soketi \
  soketi/soketi:latest
```

---

## Testing Notifications

### Manual Testing

**1. Create a test notification:**
```bash
php artisan tinker
>>> $user = User::first();
>>> $item = Item::factory()->create();
>>> $user->notify(new \App\Notifications\ItemCreated($item));
```

**2. Check database:**
```bash
php artisan tinker
>>> App\Models\Notification::latest()->first();
```

**3. Test WebSocket:**
- Open browser DevTools → Network → WS
- Check for WebSocket connection to `localhost:6001`

---

## Monitoring & Debugging

### Check Queue

```bash
# See queue size
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Monitor queue (with Horizon)
php artisan horizon
# Access at: http://localhost:8000/horizon
```

### Check Logs

```bash
# Tail logs
tail -f storage/logs/laravel.log

# Filter notifications
tail -f storage/logs/laravel.log | grep -i notification
```

### Test Broadcasting

```php
// In tinker
Broadcast::channel('user.1', fn($user, $id) => (int)$user->id === (int)$id);

// Test event
event(new \Illuminate\Notifications\Events\BroadcastNotificationCreated(
    new \App\Notifications\Sample\ItemCreated($item)
));
```

---

## Common Issues & Solutions

### Issue 1: WebSocket Connection Failed
**Solution:**
- Check Soketi is running: `docker ps | grep soketi`
- Check firewall: `netstat -an | grep 6001`
- Check config: `SOKETI_HOST`, `SOKETI_PORT`

### Issue 2: Notifications Not Appearing
**Solution:**
- Check queue worker: `php artisan queue:work`
- Check database: `SELECT * FROM notifications;`
- Check preferences: `SELECT * FROM notification_preferences;`

### Issue 3: Email Not Sending
**Solution:**
- Check mail config: `config/mail.php`
- Check `.env`: `MAIL_DRIVER`, `MAIL_FROM_ADDRESS`
- Test: `php artisan tinker` → `Mail::raw('test', fn($m) => $m->to('test@test.com'));`

---

## Performance Optimization

### Database Indexes
```sql
CREATE INDEX idx_notifications_unread 
ON notifications(notifiable_id, notifiable_type, read_at);

CREATE INDEX idx_notifications_list 
ON notifications(notifiable_id, notifiable_type, created_at DESC);
```

### Caching
```php
// Cache unread count
Cache::remember("user.{$userId}.notifications.unread", 300, fn() => 
    Notification::where('notifiable_id', $userId)->whereNull('read_at')->count()
);
```

### Pagination
```php
// Always paginate
$notifications = $user->notifications()->latest()->paginate(20);
```

---

## Deployment Checklist

- [ ] Database migrations run
- [ ] Notification classes created
- [ ] API endpoints working
- [ ] Soketi running
- [ ] Queue worker running
- [ ] React components built
- [ ] Laravel Echo configured
- [ ] Tests passing
- [ ] Monitoring setup
- [ ] Documentation complete

---

## Next Steps

1. **Review this plan** with team
2. **Approve architecture** decisions
3. **Setup Soketi** in development
4. **Start Phase 1** implementation
5. **Weekly reviews** to track progress

---

## Resources

- [Laravel Notifications](https://laravel.com/docs/11.x/notifications)
- [Laravel Broadcasting](https://laravel.com/docs/11.x/broadcasting)
- [Soketi Documentation](https://docs.soketi.app/)
- [Laravel Echo](https://laravel.com/docs/11.x/broadcasting#client-side-installation)
