# Performance Optimization Guide

## Overview

This guide covers performance optimization strategies for the notification system.

---

## Database Optimization

### 1. Indexes

Ensure these indexes exist on the `notifications` table:

```sql
-- Primary index
CREATE INDEX idx_notifications_notifiable ON notifications(notifiable_id, notifiable_type);

-- For read status queries
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- For type filtering
CREATE INDEX idx_notifications_type ON notifications(type);

-- Composite index for common queries
CREATE INDEX idx_notifications_user_read_created ON notifications(notifiable_id, read_at, created_at DESC);
```

On `notification_preferences` table:

```sql
-- Primary index
CREATE INDEX idx_preferences_user_type_channel ON notification_preferences(user_id, type, channel);

-- For preference lookups
CREATE INDEX idx_preferences_user_enabled ON notification_preferences(user_id, enabled);
```

### 2. Query Optimization

**Bad - N+1 queries:**
```php
$notifications = Notification::all();
foreach ($notifications as $notification) {
    $preference = $notification->user->preferences()->first(); // N queries
}
```

**Good - Eager loading:**
```php
$notifications = Notification::with('notifiable.preferences')
    ->latest()
    ->paginate(20);
```

### 3. Pagination

Always paginate large result sets:

```php
// Bad - loads all records
$notifications = Notification::where('user_id', $userId)->get();

// Good - paginated
$notifications = Notification::where('user_id', $userId)
    ->latest()
    ->paginate(20);
```

---

## API Optimization

### 1. Response Caching

Cache notification counts:

```php
class NotificationController extends Controller
{
    public function count()
    {
        $cacheKey = "notifications.count.{$this->user()->id}";
        
        return cache()->remember($cacheKey, 60, function () {
            return [
                'unread' => $this->user()->notifications()
                    ->whereNull('read_at')
                    ->count(),
                'total' => $this->user()->notifications()->count(),
            ];
        });
    }
}
```

Invalidate cache on notification changes:

```php
public function markAsRead($notificationId)
{
    $notification = $this->user()->notifications()->findOrFail($notificationId);
    $notification->update(['read_at' => now()]);
    
    // Invalidate cache
    cache()->forget("notifications.count.{$this->user()->id}");
    
    return response()->json(['success' => true]);
}
```

### 2. Rate Limiting

Implement rate limiting to prevent abuse:

```php
// In routes/api.php
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
});
```

### 3. Compression

Enable gzip compression in `config/app.php`:

```php
'compression' => env('APP_COMPRESSION', true),
```

---

## Frontend Optimization

### 1. Memoization

Memoize components to prevent unnecessary re-renders:

```tsx
import { memo } from 'react';

export const NotificationItem = memo(({ notification, onRead }) => {
  return (
    <div>
      <h3>{notification.data.title}</h3>
      <button onClick={() => onRead(notification.id)}>Mark as Read</button>
    </div>
  );
});
```

### 2. Lazy Loading

Lazy load notification center:

```tsx
import { lazy, Suspense } from 'react';

const NotificationCenter = lazy(() => 
  import('@/components/NotificationCenter')
);

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotificationCenter />
    </Suspense>
  );
}
```

### 3. Debouncing

Debounce preference updates:

```tsx
import { useCallback } from 'react';
import { debounce } from 'lodash-es';

export function NotificationPreferences() {
  const { updatePreference } = useNotificationPreferences();

  const debouncedUpdate = useCallback(
    debounce((type, channel, enabled) => {
      updatePreference(type, channel, enabled);
    }, 500),
    [updatePreference]
  );

  return (
    <button onClick={() => debouncedUpdate('item_created', 'email', false)}>
      Disable Email
    </button>
  );
}
```

### 4. Virtual Scrolling

For large notification lists, use virtual scrolling:

```tsx
import { FixedSizeList } from 'react-window';

export function NotificationList({ notifications }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={notifications.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <NotificationItem notification={notifications[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

---

## Broadcasting Optimization

### 1. Channel Optimization

Use private channels efficiently:

```php
// Good - specific user channel
broadcast(new NotificationCreated($notification, $userId))
    ->toOthers();

// Avoid - broadcasting to many users
broadcast(new NotificationCreated($notification))
    ->toOthers();
```

### 2. Payload Size

Keep broadcast payloads small:

```php
// Bad - large payload
public function broadcastWith(): array
{
    return [
        'notification' => $this->notification->toArray(), // All data
    ];
}

// Good - minimal payload
public function broadcastWith(): array
{
    return [
        'id' => $this->notification->id,
        'type' => $this->notification->type,
        'data' => $this->notification->data,
    ];
}
```

---

## Queue Optimization

### 1. Batch Processing

Process notifications in batches:

```php
// In SendItemCreatedNotification listener
private function fanoutNotifications($item, $recipients)
{
    $notificationData = $recipients->map(function ($recipient) use ($item) {
        return [...];
    })->toArray();

    // Batch insert (1 query instead of N)
    Notification::insert($notificationData);

    // Batch dispatch
    $notifications = Notification::whereIn('id', 
        collect($notificationData)->pluck('id')
    )->get();

    foreach ($notifications->chunk(100) as $chunk) {
        dispatch(new SendNotificationBatch($chunk));
    }
}
```

### 2. Queue Configuration

Optimize queue settings in `config/queue.php`:

```php
'redis' => [
    'driver' => 'redis',
    'connection' => 'default',
    'queue' => env('QUEUE_NAME', 'default'),
    'retry_after' => 90,
    'block_for' => 5, // Block for 5 seconds
],
```

### 3. Failed Job Handling

Monitor and retry failed jobs:

```bash
# Check failed jobs
php artisan queue:failed

# Retry specific job
php artisan queue:retry {id}

# Retry all failed jobs
php artisan queue:retry all

# Forget failed job
php artisan queue:forget {id}
```

---

## Monitoring

### 1. Performance Metrics

Monitor key metrics:

```php
// In NotificationController
public function index(Request $request)
{
    $startTime = microtime(true);

    $notifications = $this->user()->notifications()
        ->latest()
        ->paginate(20);

    $duration = microtime(true) - $startTime;

    // Log slow queries
    if ($duration > 0.1) {
        Log::warning('Slow notification query', [
            'duration' => $duration,
            'user_id' => $this->user()->id,
        ]);
    }

    return response()->json($notifications);
}
```

### 2. Database Profiling

Enable query logging in development:

```php
// In AppServiceProvider
if ($this->app->environment('local')) {
    DB::listen(function ($query) {
        if ($query->time > 100) { // > 100ms
            Log::warning('Slow query', [
                'sql' => $query->sql,
                'time' => $query->time,
            ]);
        }
    });
}
```

### 3. Horizon Monitoring

Monitor queue jobs with Horizon:

```bash
# Start Horizon
php artisan horizon

# Access at /horizon
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API response time | < 200ms | - |
| Database query | < 100ms | - |
| WebSocket latency | < 100ms | - |
| Email delivery | < 5 min | - |
| Queue processing | < 1s | - |

---

## Benchmarking

### Load Test

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/notifications

# Using wrk
wrk -t4 -c100 -d30s http://localhost:8000/api/notifications
```

### Results

Document baseline performance:

```
Requests per second: 500
Average response time: 150ms
95th percentile: 250ms
99th percentile: 500ms
```

---

## Checklist

- [ ] Database indexes created
- [ ] Query eager loading implemented
- [ ] Pagination enabled
- [ ] Response caching configured
- [ ] Rate limiting enabled
- [ ] Components memoized
- [ ] Lazy loading implemented
- [ ] Debouncing applied
- [ ] Virtual scrolling for large lists
- [ ] Broadcast payloads optimized
- [ ] Queue batch processing
- [ ] Monitoring configured
- [ ] Load testing completed
- [ ] Performance targets met

---

## References

- [Laravel Performance](https://laravel.com/docs/performance)
- [React Performance](https://react.dev/reference/react/memo)
- [Database Indexing](https://en.wikipedia.org/wiki/Database_index)
- [WebSocket Optimization](https://socket.io/docs/v4/performance-tuning/)
