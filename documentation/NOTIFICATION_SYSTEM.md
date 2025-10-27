# Notification System - Comprehensive Planning & Architecture

## 1. OVERVIEW & GOALS

### Tujuan Utama
- **Real-time notifications** untuk user experience yang responsif
- **Multi-channel delivery** (In-app, Email, Push, Waha)
- **User preferences** untuk kontrol penuh atas notifikasi
- **Scalable & reliable** dengan queue system
- **Production-ready** dengan monitoring dan error handling

### Key Metrics
- Delivery latency: < 1 detik untuk in-app
- Email delivery: < 5 menit
- Push delivery: < 10 detik
- System reliability: 99.9% uptime

---

## 2. ARSITEKTUR SISTEM

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT TRIGGER LAYER                          │
│  (ItemCreated, ItemUpdated, ItemDeleted, UserMentioned, etc)   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              NOTIFICATION DISPATCH LAYER                         │
│  - Check user preferences                                        │
│  - Determine channels (inapp, email, push, sms)                 │
│  - Queue async jobs                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  DATABASE    │  │  BROADCAST   │  │    EMAIL     │
│  CHANNEL     │  │  CHANNEL     │  │   CHANNEL    │
│              │  │              │  │              │
│ - Persist    │  │ - WebSocket  │  │ - Queue job  │
│ - Store in   │  │ - Real-time  │  │ - Send via   │
│   DB         │  │ - Echo       │  │   SMTP       │
└──────────────┘  └──────────────┘  └──────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER (React)                         │
│  - NotificationBell (badge + dropdown)                           │
│  - NotificationCenter (full page)                                │
│  - Toast notifications                                           │
│  - Real-time updates via Echo                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
1. EVENT TRIGGER
   └─> User creates Item
       └─> ItemCreated event dispatched

2. NOTIFICATION CREATION
   └─> Notification class determines channels
       └─> Check user preferences
           ├─> Inapp enabled? → Add 'broadcast' channel
           ├─> Email enabled? → Add 'mail' channel
           └─> Push enabled? → Add 'push' channel (future)

3. ASYNC QUEUE
   └─> Job queued to Redis
       └─> Worker processes job
           ├─> Save to database
           ├─> Broadcast via WebSocket
           └─> Send email (if enabled)

4. DELIVERY
   ├─> Database: Stored in notifications table
   ├─> Broadcast: Sent via WebSocket to user's private channel
   └─> Email: Sent via SMTP

5. FRONTEND UPDATES
   ├─> WebSocket listener receives broadcast
   ├─> Update notification badge count
   ├─> Show toast notification
   └─> Add to notification list (optimistic update)
```

---

## 3. DATABASE SCHEMA

### 3.1 Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    notifiable_type VARCHAR(255),      -- 'App\Models\User'
    notifiable_id UUID,                -- User ID
    type VARCHAR(255),                 -- 'item_created', 'item_updated', etc
    data JSON,                         -- {title, body, action_url, icon, meta}
    read_at TIMESTAMP NULL,            -- NULL = unread
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Indexes untuk performa query
INDEX (notifiable_id, notifiable_type, read_at)    -- Unread count
INDEX (notifiable_id, notifiable_type, created_at) -- List notifications
INDEX (notifiable_id, notifiable_type, type)       -- Filter by type
INDEX (created_at)                                  -- Cleanup old records
```

### 3.2 Notification Preferences Table

```sql
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY,
    user_id UUID,
    type VARCHAR(255),                 -- 'item_created', 'item_updated', 'all'
    channel VARCHAR(255),              -- 'inapp', 'email', 'push', 'sms'
    enabled BOOLEAN DEFAULT true,
    quiet_hours_start TIME NULL,       -- e.g., 22:00
    quiet_hours_end TIME NULL,         -- e.g., 08:00
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    UNIQUE (user_id, type, channel),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
INDEX (user_id, channel)
```

### 3.3 Data JSON Structure

```json
{
  "title": "Item Baru Dibuat",
  "body": "Item 'Samboza' telah dibuat oleh Admin",
  "action_url": "/sample/items/abc-123",
  "icon": "package-plus",
  "meta": {
    "item_id": "abc-123",
    "item_name": "Samboza",
    "created_by": "Admin",
    "timestamp": "2025-10-27T11:00:00Z"
  }
}
```

---

## 4. NOTIFICATION TYPES & TRIGGERS

### 4.1 Notification Types

| Type | Trigger | Recipients | Channels |
|------|---------|-----------|----------|
| `item_created` | Item dibuat | Admins, Subscribers | inapp, email |
| `item_updated` | Item diubah | Item owner, Admins | inapp |
| `item_deleted` | Item dihapus | Item owner, Admins | inapp, email |
| `user_mentioned` | User di-mention | Mentioned user | inapp, email |
| `comment_posted` | Komentar ditambah | Post owner | inapp, email |
| `permission_granted` | Permission diberikan | User | inapp, email |
| `role_assigned` | Role diberikan | User | inapp, email |

### 4.2 Recipient Rules

```php
// Item Created
Recipients:
- All users with 'view_items' permission
- OR specific subscribers

// Item Updated
Recipients:
- Item owner
- Users watching this item
- Admins

// User Mentioned
Recipients:
- Mentioned user only

// Permission Granted
Recipients:
- User yang menerima permission
```

---

## 5. BACKEND IMPLEMENTATION PLAN

### 5.1 Notification Classes

**Location:** `app/Notifications/`

```
ItemCreated.php
├─ via() → ['database', 'broadcast', 'mail']
├─ toDatabase() → Array format
├─ toBroadcast() → BroadcastMessage
├─ broadcastOn() → ['private-user.{id}']
└─ toMail() → MailMessage

ItemUpdated.php
ItemDeleted.php
UserMentioned.php
CommentPosted.php
PermissionGranted.php
RoleAssigned.php
```

### 5.2 Event Listeners

**Location:** `app/Listeners/`

```
SendNotificationListener.php
├─ Listen to ItemCreated event
├─ Determine recipients
├─ Dispatch notification to each recipient
└─ Log notification sent

NotificationMetricsListener.php
├─ Track notification metrics
├─ Log delivery status
└─ Alert on failures
```

### 5.3 API Endpoints

```
GET    /api/notifications
       - Query params: page, per_page, filter (unread/read), type
       - Response: paginated list with unread count

GET    /api/notifications/count
       - Response: { unread: 5, total: 42 }

PATCH  /api/notifications/{id}/read
       - Mark single notification as read
       - Response: 204 No Content

PATCH  /api/notifications/read-all
       - Mark all unread as read
       - Response: 204 No Content

DELETE /api/notifications/{id}
       - Delete notification
       - Response: 204 No Content

GET    /api/notification-preferences
       - Get user's notification preferences
       - Response: array of preferences

PUT    /api/notification-preferences
       - Update preferences
       - Body: { type, channel, enabled, quiet_hours_start, quiet_hours_end }
       - Response: updated preference

POST   /api/notification-preferences/reset
       - Reset to default preferences
       - Response: 204 No Content
```

### 5.4 Queue Configuration

**Queue:** `notifications` (separate from default)

```php
// config/queue.php
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => env('QUEUE_NAME', 'default'),
        'retry_after' => 90,
        'block_for' => null,
    ],
],

// .env
QUEUE_CONNECTION=redis
QUEUE_NAME=notifications
```

**Worker Command:**
```bash
php artisan queue:work redis --queue=notifications --tries=3 --timeout=60
```

### 5.5 Broadcasting Setup

**Broadcaster:** Soketi (self-hosted WebSocket server)

```php
// config/broadcasting.php
'default' => env('BROADCAST_DRIVER', 'soketi'),

'soketi' => [
    'driver' => 'pusher',
    'key' => env('SOKETI_APP_KEY'),
    'secret' => env('SOKETI_APP_SECRET'),
    'app_id' => env('SOKETI_APP_ID'),
    'options' => [
        'host' => env('SOKETI_HOST', 'localhost'),
        'port' => env('SOKETI_PORT', 6001),
        'scheme' => env('SOKETI_SCHEME', 'http'),
        'curl_options' => [
            CURLOPT_SSL_VERIFYPEER => false,
        ],
    ],
],
```

**Private Channel Authorization:**
```php
// routes/channels.php
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
```

---

## 6. FRONTEND IMPLEMENTATION PLAN

### 6.1 React Components

**Location:** `resources/js/components/notifications/`

```
NotificationBell.tsx
├─ Badge with unread count
├─ Dropdown with recent notifications
├─ Mark as read on click
└─ Real-time updates via Echo

NotificationCenter.tsx
├─ Full page view
├─ Pagination
├─ Filter by type/read status
├─ Bulk actions (mark all as read, delete)
└─ Search functionality

NotificationToast.tsx
├─ Toast notification component
├─ Auto-dismiss after 5 seconds
├─ Action button (View, Dismiss)
└─ Different styles per type

NotificationPreferences.tsx
├─ User preference settings
├─ Toggle channels per type
├─ Quiet hours configuration
└─ Save preferences
```

### 6.2 Hooks

**Location:** `resources/js/hooks/`

```
useNotifications.ts
├─ Fetch notifications list
├─ Pagination handling
├─ Real-time subscription via Echo
└─ Optimistic updates

useNotificationCount.ts
├─ Fetch unread count
├─ Real-time updates
└─ Polling fallback

useNotificationPreferences.ts
├─ Fetch user preferences
├─ Update preferences
└─ Reset to defaults
```

### 6.3 Laravel Echo Setup

**File:** `resources/js/lib/echo.ts`

```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_KEY,
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    forceTLS: false,
    wsHost: import.meta.env.VITE_SOKETI_HOST,
    wsPort: import.meta.env.VITE_SOKETI_PORT,
    wssPort: import.meta.env.VITE_SOKETI_PORT,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-XSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
    },
});
```

### 6.4 WebSocket Subscription

```typescript
useEffect(() => {
    const channel = echo.private(`user.${userId}`);
    
    channel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (payload) => {
        // Update notification list
        // Show toast
        // Update badge count
    });
    
    return () => {
        echo.leaveChannel(`private-user.${userId}`);
    };
}, [userId]);
```

---

## 7. QUEUE & WORKER MANAGEMENT

### 7.1 Queue Configuration

**Separate queue untuk notifications:**
```bash
# Development
php artisan queue:work redis --queue=notifications --tries=3 --timeout=60

# Production (via Supervisor)
[program:lareact12-notifications]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work redis --queue=notifications --tries=3 --timeout=60
autostart=true
autorestart=true
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/lareact12-notifications.log
```

### 7.2 Retry & Backoff Strategy

```php
// app/Notifications/ItemCreated.php
public function backoff(): array
{
    return [1, 5, 15, 60]; // Retry after 1s, 5s, 15s, 60s
}

public function retryUntil(): DateTime
{
    return now()->addHours(24); // Stop retrying after 24 hours
}
```

### 7.3 Monitoring dengan Horizon (Optional)

```bash
composer require laravel/horizon
php artisan horizon:install
php artisan migrate

# Access at: /horizon
```

---

## 8. SECURITY & AUTHORIZATION

### 8.1 Private Channels

```php
// Only authenticated user can access their own channel
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
```

### 8.2 API Authorization

```php
// NotificationController
public function index(Request $request)
{
    // Only get own notifications
    $notifications = $request->user()->notifications()->paginate();
    return response()->json($notifications);
}

public function markAsRead(Notification $notification, Request $request)
{
    // Verify ownership
    $this->authorize('update', $notification);
    $notification->markAsRead();
}
```

### 8.3 Audit Trail

```php
// Log preference changes
class NotificationPreferenceObserver
{
    public function updated(NotificationPreference $preference)
    {
        Log::info('Notification preference updated', [
            'user_id' => $preference->user_id,
            'type' => $preference->type,
            'channel' => $preference->channel,
            'enabled' => $preference->enabled,
        ]);
    }
}
```

---

## 9. PERFORMANCE OPTIMIZATION

### 9.1 Database Indexes

```sql
-- Unread count query
CREATE INDEX idx_notifications_unread 
ON notifications(notifiable_id, notifiable_type, read_at);

-- List notifications
CREATE INDEX idx_notifications_list 
ON notifications(notifiable_id, notifiable_type, created_at DESC);

-- Filter by type
CREATE INDEX idx_notifications_type 
ON notifications(notifiable_id, notifiable_type, type);

-- Cleanup old records
CREATE INDEX idx_notifications_created 
ON notifications(created_at);
```

### 9.2 Caching

```php
// Cache unread count for 5 minutes
$unreadCount = Cache::remember(
    "user.{$userId}.notifications.unread",
    now()->addMinutes(5),
    fn() => Notification::where('notifiable_id', $userId)
        ->whereNull('read_at')
        ->count()
);

// Invalidate on new notification
Cache::forget("user.{$userId}.notifications.unread");
```

### 9.3 Pagination

```php
// Always paginate, never load all
$notifications = $user->notifications()
    ->latest()
    ->paginate(20);
```

---

## 10. TESTING STRATEGY

### 10.1 Unit Tests

```
tests/Unit/Notifications/
├─ ItemCreatedTest.php
│  ├─ test_notification_has_correct_data()
│  ├─ test_notification_respects_user_preferences()
│  └─ test_notification_queued()
├─ NotificationPreferenceTest.php
│  ├─ test_quiet_hours_calculation()
│  └─ test_preference_scope_queries()
└─ NotificationTest.php
   ├─ test_mark_as_read()
   └─ test_notification_scopes()
```

### 10.2 Feature Tests

```
tests/Feature/Notifications/
├─ NotificationApiTest.php
│  ├─ test_get_notifications_paginated()
│  ├─ test_mark_notification_as_read()
│  ├─ test_mark_all_as_read()
│  ├─ test_delete_notification()
│  └─ test_get_unread_count()
├─ NotificationPreferenceApiTest.php
│  ├─ test_get_preferences()
│  ├─ test_update_preferences()
│  └─ test_reset_preferences()
└─ BroadcastingTest.php
   ├─ test_notification_broadcast_sent()
   └─ test_private_channel_auth()
```

### 10.3 E2E Tests (Cypress/Playwright)

```
e2e/notifications/
├─ notification-bell.spec.ts
│  ├─ Badge shows unread count
│  ├─ Dropdown opens/closes
│  ├─ Mark as read works
│  └─ Real-time updates
├─ notification-center.spec.ts
│  ├─ List displays notifications
│  ├─ Pagination works
│  ├─ Filters work
│  └─ Bulk actions work
└─ preferences.spec.ts
   ├─ Toggle channels
   ├─ Set quiet hours
   └─ Save preferences
```

---

## 11. OBSERVABILITY & MONITORING

### 11.1 Logging

```php
// Log notification events
Log::channel('notifications')->info('Notification sent', [
    'notification_id' => $notification->id,
    'user_id' => $user->id,
    'type' => $notification->type,
    'channels' => $channels,
    'duration_ms' => $duration,
]);
```

### 11.2 Metrics

```
- Notifications sent per hour
- Delivery latency (p50, p95, p99)
- Failed deliveries
- Queue backlog size
- Unread count per user
```

### 11.3 Alerts

```
- Queue backlog > 1000 items
- Failed deliveries > 5% in last hour
- Broadcast connection failures
- Email delivery failures
```

---

## 12. DEPLOYMENT CHECKLIST

- [ ] Database migrations run
- [ ] Notification classes created
- [ ] Broadcasting configured (Soketi)
- [ ] Queue worker running
- [ ] API endpoints implemented
- [ ] React components built
- [ ] Laravel Echo configured
- [ ] Tests passing
- [ ] Monitoring setup
- [ ] Documentation complete
- [ ] Load testing done
- [ ] Security review passed

---

## 13. TIMELINE & PHASES

### Phase 1: Core Infrastructure (Week 1)
- Database migrations
- Notification models
- Basic notification classes
- API endpoints

### Phase 2: Real-time Features (Week 2)
- Broadcasting setup
- Laravel Echo integration
- React components
- WebSocket subscription

### Phase 3: Advanced Features (Week 3)
- Web Push (Service Worker)
- Email notifications
- Preferences UI
- Monitoring & alerts

### Phase 4: Polish & Optimization (Week 4)
- Performance tuning
- Testing & QA
- Documentation
- Deployment

---

## 14. FUTURE ENHANCEMENTS

- [ ] Mobile push (FCM, APNs)
- [ ] Notification digest/batching
- [ ] Notification templates
- [ ] A/B testing for notification content
- [ ] Analytics dashboard
- [ ] Notification scheduling
- [ ] Webhook integrations
- [ ] WhatsApp integration (Waha)
- [ ] SMS integration (Twilio)
