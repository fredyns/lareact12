# Fanout on Write (FOW) Strategy - Implementation Guide

## 1. KONSEP FANOUT ON WRITE

**Fanout on Write (FOW)** adalah strategi di mana ketika event terjadi, kita langsung "fan out" (menyebarkan) notifikasi ke semua recipient users secara immediate.

### Analogi Sederhana
```
Tanpa FOW (Pull Model):
Event → Store in DB → User polls → Get notifications (delay)

Dengan FOW:
Event → Fan out to all users → Store in DB → User gets instantly
```

### Kapan Gunakan FOW?
- ✅ **Notifications** - Time-sensitive, perlu real-time
- ✅ **Activity feeds** - Followers perlu tahu langsung
- ✅ **Alerts** - Urgent information
- ❌ **Analytics** - Batch processing lebih baik
- ❌ **Reports** - Pull model lebih efisien

---

## 2. FOW ARCHITECTURE

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. EVENT TRIGGERED                                      │
│    User creates Item                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. DETERMINE RECIPIENTS                                 │
│    - Admins with 'view_items' permission               │
│    - Subscribers of this category                       │
│    - Result: [User1, User2, User3, ...]                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. FAN OUT (Batch Insert)                               │
│    Create N notifications (1 per recipient)             │
│    - Notification 1 → User1                            │
│    - Notification 2 → User2                            │
│    - Notification 3 → User3                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. ASYNC DELIVERY (Queue)                               │
│    - Broadcast via WebSocket (< 100ms)                 │
│    - Send Email (queued)                               │
│    - Send WhatsApp (queued)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. FRONTEND UPDATES                                     │
│    - Badge count updates                               │
│    - Toast appears                                     │
│    - Notification added to list                        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. IMPLEMENTATION

### Step 1: Create Event Listener

**File:** `app/Listeners/SendNotificationListener.php`

```php
<?php

namespace App\Listeners;

use App\Events\Sample\ItemCreated;use App\Models\Notification;use App\Models\User;use Illuminate\Support\Facades\Log;use Illuminate\Support\Str;

class SendNotificationListener
{
    public function handle(ItemCreated $event)
    {
        $item = $event->item;

        // 1. Determine recipients
        $recipients = $this->getRecipients($item);

        Log::info('Fanout started', [
            'item_id' => $item->id,
            'recipient_count' => $recipients->count(),
        ]);

        // 2. Batch insert notifications
        $this->fanoutNotifications($item, $recipients);

        // 3. Broadcast to connected users
        $this->broadcastToUsers($item, $recipients);
    }

    /**
     * Determine who should receive this notification
     */
    private function getRecipients($item)
    {
        return User::query()
            ->where('id', '!=', $item->created_by) // Exclude creator
            ->where('active', true)
            ->role('admin') // Or other criteria
            ->get();
    }

    /**
     * FOW: Batch insert notifications for all recipients
     */
    private function fanoutNotifications($item, $recipients)
    {
        $notifications = $recipients->map(function ($recipient) use ($item) {
            return [
                'id' => Str::uuid(),
                'notifiable_id' => $recipient->id,
                'notifiable_type' => User::class,
                'type' => 'item_created',
                'data' => json_encode([
                    'title' => 'Item Baru Dibuat',
                    'body' => "Item '{$item->string}' telah dibuat",
                    'action_url' => route('sample.items.show', $item->id),
                    'icon' => 'package-plus',
                    'meta' => [
                        'item_id' => $item->id,
                        'item_name' => $item->string,
                        'created_by' => $item->created_by,
                    ],
                ]),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        // Batch insert (1 query instead of N queries)
        Notification::insert($notifications);

        Log::info('Notifications fanned out', [
            'count' => count($notifications),
        ]);
    }

    /**
     * Broadcast to connected users via WebSocket
     */
    private function broadcastToUsers($item, $recipients)
    {
        foreach ($recipients as $recipient) {
            broadcast(new \App\Events\NotificationCreated($recipient, $item))
                ->toOthers();
        }
    }
}
```

### Step 2: Register Event Listener

**File:** `app/Providers/EventServiceProvider.php`

```php
<?php

namespace App\Providers;

use App\Events\Sample\ItemCreated;use App\Listeners\SendNotificationListener;use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        ItemCreated::class => [
            SendNotificationListener::class,
        ],
    ];
}
```

### Step 3: Create Broadcast Event

**File:** `app/Events/NotificationCreated.php`

```php
<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public $item
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->user->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        return [
            'title' => 'Item Baru Dibuat',
            'body' => "Item '{$this->item->string}' telah dibuat",
            'action_url' => route('sample.items.show', $this->item->id),
            'icon' => 'package-plus',
        ];
    }
}
```

### Step 4: Dispatch Event

**File:** `app/Models/Sample/Item.php`

```php
<?php

namespace App\Models\Sample;

use App\Events\Sample\ItemCreated;use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $dispatchesEvents = [
        'created' => ItemCreated::class,
    ];
}
```

---

## 4. OPTIMIZATION STRATEGIES

### Strategy 1: Batch Insert (Reduce Queries)

```php
// ❌ BAD: N queries
foreach ($recipients as $recipient) {
    Notification::create([...]);  // 1 query per recipient
}

// ✅ GOOD: 1 query
$notifications = $recipients->map(fn($r) => [...])->toArray();
Notification::insert($notifications);  // 1 query for all
```

**Performance Impact:**
- 50 recipients: 50 queries → 1 query (50x faster)
- 1000 recipients: 1000 queries → 1 query (1000x faster)

---

### Strategy 2: Chunk Processing (Memory Efficient)

```php
// For large recipient lists, process in chunks
$recipients = User::role('admin')->get();

$recipients->chunk(100)->each(function ($chunk) use ($item) {
    $notifications = $chunk->map(function ($recipient) use ($item) {
        return [
            'id' => Str::uuid(),
            'notifiable_id' => $recipient->id,
            'notifiable_type' => User::class,
            'type' => 'item_created',
            'data' => json_encode([...]),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    })->toArray();

    Notification::insert($notifications);
});
```

**Benefits:**
- Handles millions of recipients
- Doesn't load all in memory
- Prevents timeout

---

### Strategy 3: Queue Prioritization

```php
// High priority: Urgent notifications
$notification->onQueue('notifications-high');

// Normal priority: Regular notifications
$notification->onQueue('notifications');

// Low priority: Digest/batch notifications
$notification->onQueue('notifications-low');
```

**Worker Configuration:**
```bash
# Process high priority first
php artisan queue:work redis --queue=notifications-high,notifications,notifications-low
```

---

### Strategy 4: Idempotency Keys (Prevent Duplicates)

```php
use Illuminate\Support\Facades\Cache;

private function fanoutNotifications($item, $recipients)
{
    $notifications = $recipients->map(function ($recipient) use ($item) {
        // Generate idempotency key
        $idempotencyKey = hash('sha256',
            $item->id . '-' . $recipient->id . '-item_created'
        );

        // Check if already sent
        if (Cache::has("notification:{$idempotencyKey}")) {
            return null; // Skip duplicate
        }

        // Mark as sent
        Cache::put("notification:{$idempotencyKey}", true, now()->addHours(24));

        return [
            'id' => Str::uuid(),
            'notifiable_id' => $recipient->id,
            'notifiable_type' => User::class,
            'type' => 'item_created',
            'data' => json_encode([...]),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    })
    ->filter() // Remove nulls
    ->toArray();

    Notification::insert($notifications);
}
```

---

### Strategy 5: Async Broadcasting

```php
// Don't wait for broadcast, queue it
dispatch(function () use ($item, $recipients) {
    foreach ($recipients as $recipient) {
        broadcast(new NotificationCreated($recipient, $item))->toOthers();
    }
})->onQueue('broadcasts');
```

---

## 5. PERFORMANCE COMPARISON

### Without FOW (Pull Model)
```
Event → Store in DB → User polls → Query & generate notifications
Latency: 30-60 seconds
DB Writes: 1
DB Reads: N (per user poll)
```

### With FOW (Push Model)
```
Event → Fan out to all → Store N notifications → Broadcast
Latency: < 100ms
DB Writes: N (batch insert = 1 query)
DB Reads: 0 (notifications already stored)
```

### Benchmark

| Metric | Pull | FOW |
|--------|------|-----|
| **Latency** | 30-60s | < 100ms |
| **DB Writes** | 1 | 1 (batch) |
| **DB Reads** | N | 0 |
| **User Experience** | Poor | Excellent |
| **Scalability** | Good | Good |

---

## 6. DATABASE INDEXES

Critical indexes for FOW:

```sql
-- For fetching unread notifications
CREATE INDEX idx_notifications_unread 
ON notifications(notifiable_id, notifiable_type, read_at);

-- For listing notifications
CREATE INDEX idx_notifications_list 
ON notifications(notifiable_id, notifiable_type, created_at DESC);

-- For filtering by type
CREATE INDEX idx_notifications_type 
ON notifications(notifiable_id, notifiable_type, type);
```

---

## 7. MONITORING FOW

### Metrics to Track

```php
// Log fanout metrics
Log::info('Fanout metrics', [
    'event' => 'item_created',
    'recipients' => 50,
    'duration_ms' => 245,
    'db_writes' => 1,
    'broadcast_sent' => 50,
]);
```

### Alerts

```
- Fanout duration > 5 seconds
- Recipients > 10000
- Failed notifications > 5%
- Duplicate notifications detected
```

---

## 8. HYBRID APPROACH

Combine FOW with Pull for flexibility:

```php
// FOW for critical notifications
if ($item->is_urgent) {
    // Fan out immediately
    $this->fanoutNotifications($item, $recipients);
} else {
    // Pull model for non-critical
    // Store event, let users query
    $this->storeEvent($item);
}
```

---

## 9. COMMON ISSUES & SOLUTIONS

### Issue 1: Too Many Database Writes
**Solution:** Use batch insert, chunk processing

### Issue 2: Memory Overflow
**Solution:** Process in chunks, use generators

### Issue 3: Duplicate Notifications
**Solution:** Idempotency keys, deduplication

### Issue 4: Slow Fanout
**Solution:** Async broadcasting, queue prioritization

### Issue 5: Recipient Explosion
**Solution:** Limit recipients, use segments

---

## 10. BEST PRACTICES

1. **Always batch insert** - Never loop and create
2. **Use idempotency keys** - Prevent duplicates
3. **Process in chunks** - Handle large recipient lists
4. **Async broadcast** - Don't block on WebSocket
5. **Monitor metrics** - Track fanout performance
6. **Set alerts** - Alert on anomalies
7. **Test at scale** - Load test with realistic data
8. **Document recipients** - Clear rules for who gets notified

---

## 11. EXAMPLE: Complete FOW Implementation

```php
<?php

namespace App\Listeners;

use App\Events\Sample\ItemCreated;use App\Models\Notification;use App\Models\User;use Illuminate\Support\Facades\Cache;use Illuminate\Support\Facades\Log;use Illuminate\Support\Str;

class SendNotificationListener
{
    public function handle(ItemCreated $event)
    {
        $startTime = microtime(true);
        $item = $event->item;

        // 1. Get recipients
        $recipients = User::query()
            ->where('id', '!=', $item->created_by)
            ->where('active', true)
            ->role('admin')
            ->get();

        // 2. Chunk process for memory efficiency
        $recipients->chunk(100)->each(function ($chunk) use ($item) {
            $this->fanoutChunk($item, $chunk);
        });

        // 3. Async broadcast
        dispatch(function () use ($item, $recipients) {
            $this->broadcastToUsers($item, $recipients);
        })->onQueue('broadcasts');

        // 4. Log metrics
        $duration = (microtime(true) - $startTime) * 1000;
        Log::info('Fanout completed', [
            'item_id' => $item->id,
            'recipients' => $recipients->count(),
            'duration_ms' => round($duration, 2),
        ]);
    }

    private function fanoutChunk($item, $recipients)
    {
        $notifications = $recipients->map(function ($recipient) use ($item) {
            $idempotencyKey = hash('sha256',
                $item->id . '-' . $recipient->id . '-item_created'
            );

            if (Cache::has("notification:{$idempotencyKey}")) {
                return null;
            }

            Cache::put("notification:{$idempotencyKey}", true, now()->addHours(24));

            return [
                'id' => Str::uuid(),
                'notifiable_id' => $recipient->id,
                'notifiable_type' => User::class,
                'type' => 'item_created',
                'data' => json_encode([
                    'title' => 'Item Baru Dibuat',
                    'body' => "Item '{$item->string}' telah dibuat",
                    'action_url' => route('sample.items.show', $item->id),
                    'icon' => 'package-plus',
                    'meta' => ['item_id' => $item->id],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->filter()->toArray();

        Notification::insert($notifications);
    }

    private function broadcastToUsers($item, $recipients)
    {
        foreach ($recipients as $recipient) {
            broadcast(new \App\Events\NotificationCreated($recipient, $item))
                ->toOthers();
        }
    }
}
```

---

## 12. RESOURCES

- [Laravel Events & Listeners](https://laravel.com/docs/11.x/events)
- [Laravel Broadcasting](https://laravel.com/docs/11.x/broadcasting)
- [Database Performance](https://laravel.com/docs/11.x/queries)
- [Batch Insert Best Practices](https://laravel.com/docs/11.x/eloquent#mass-assignment)
