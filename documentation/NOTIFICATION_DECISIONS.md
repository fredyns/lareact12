# Notification System - Decision Matrix & Trade-offs

## 1. BROADCASTING SOLUTION

### Option A: Soketi (Self-hosted WebSocket)
**Recommended for lareact12**

**Pros:**
- ✅ Self-hosted, no vendor lock-in
- ✅ Free & open-source
- ✅ Full control over infrastructure
- ✅ Works with Laravel Echo (same as Pusher)
- ✅ Suitable untuk development & small-medium production
- ✅ Easy to deploy dengan Docker

**Cons:**
- ❌ Need to manage server & scaling
- ❌ Need to monitor uptime
- ❌ Requires Redis for queue

**Cost:** Free (hanya biaya server)

**Setup Complexity:** Medium

```bash
# Docker setup
docker run -d \
  -p 6001:6001 \
  -e SOKETI_APP_ID=app-id \
  -e SOKETI_APP_KEY=app-key \
  -e SOKETI_APP_SECRET=app-secret \
  soketi/soketi:latest
```

---

### Option B: Pusher (Managed Service)
**Alternative if prefer managed solution**

**Pros:**
- ✅ Fully managed, no infrastructure concerns
- ✅ Excellent uptime & reliability
- ✅ Built-in monitoring & analytics
- ✅ Easy scaling
- ✅ Same Laravel Echo integration

**Cons:**
- ❌ Paid service ($49-499/month)
- ❌ Vendor lock-in
- ❌ Less control

**Cost:** $49-499/month depending on usage

**Setup Complexity:** Easy

---

### Option C: Laravel WebSockets Package
**Not recommended for production**

**Pros:**
- ✅ Pure PHP, no external service
- ✅ Easy to setup

**Cons:**
- ❌ Not production-ready
- ❌ Performance issues at scale
- ❌ Maintenance burden

---

### **RECOMMENDATION: Soketi**
- Self-hosted, cost-effective
- Same developer experience as Pusher
- Full control over infrastructure
- Suitable untuk lareact12 scale

---

## 2. QUEUE DRIVER

### Option A: Redis Queue
**Recommended**

**Pros:**
- ✅ Fast & reliable
- ✅ Supports job priorities
- ✅ Good for notifications
- ✅ Already using for caching

**Cons:**
- ❌ In-memory, data loss if crash
- ❌ Need persistence configuration

**Setup:** Already available in lareact12

---

### Option B: Database Queue
**Alternative if Redis not available**

**Pros:**
- ✅ Persistent
- ✅ No additional service needed

**Cons:**
- ❌ Slower than Redis
- ❌ Polling-based, not event-driven
- ❌ Database load increases

---

### **RECOMMENDATION: Redis**
- Already configured in lareact12
- Best performance for notifications
- Supports priority queuing

---

## 3. NOTIFICATION CHANNELS

### Channels to Implement (Priority Order)

#### Phase 1 (Week 1-2): Core
- **Database** ✅ Essential
- **Broadcast** ✅ Essential (real-time)

#### Phase 2 (Week 3): Extended
- **Email** ⚠️ Important for critical notifications
- **Web Push** ⚠️ Nice to have

#### Phase 3 (Future): Advanced
- **Mobile Push** (FCM/APNs) - Only if mobile app exists
- **WhatsApp** (Waha) - Future enhancement
- **SMS** (Twilio) - Future enhancement

---

## 4. NOTIFICATION PREFERENCES

### Granularity Level

#### Option A: Per Type + Per Channel (Recommended)
```
item_created:
  - inapp: enabled
  - email: disabled
  - push: disabled

item_updated:
  - inapp: enabled
  - email: disabled
```

**Pros:**
- ✅ Maximum user control
- ✅ Flexible

**Cons:**
- ❌ More complex UI
- ❌ More database queries

---

#### Option B: Per Channel Only
```
inapp: enabled
email: disabled
push: disabled
```

**Pros:**
- ✅ Simpler UI
- ✅ Fewer database queries

**Cons:**
- ❌ Less user control
- ❌ All notifications same channel

---

### **RECOMMENDATION: Per Type + Per Channel**
- Better UX for users
- Minimal performance impact
- More flexible for future

---

## 5. REAL-TIME UPDATE STRATEGY

### Option A: WebSocket (Recommended)
**Soketi + Laravel Echo**

**Pros:**
- ✅ True real-time (< 100ms latency)
- ✅ Bi-directional communication
- ✅ Scalable with proper setup

**Cons:**
- ❌ More complex infrastructure
- ❌ Requires persistent connections

**Latency:** < 100ms

---

### Option B: Polling
**Fallback or alternative**

**Pros:**
- ✅ Simple to implement
- ✅ No persistent connections

**Cons:**
- ❌ Latency 30-60 seconds
- ❌ Higher server load
- ❌ Bad UX

**Latency:** 30-60 seconds

---

### Option C: Server-Sent Events (SSE)
**Middle ground**

**Pros:**
- ✅ Simpler than WebSocket
- ✅ Good latency (< 1 second)
- ✅ One-way communication OK for notifications

**Cons:**
- ❌ Limited browser support (IE)
- ❌ Connection limits per domain

**Latency:** < 1 second

---

### **RECOMMENDATION: WebSocket (Soketi)**
- Best real-time experience
- Soketi is lightweight & easy to manage
- Worth the complexity for production app

**Fallback:** Polling every 30 seconds if WebSocket fails

---

## 6. NOTIFICATION PERSISTENCE

### Option A: Database Only (Recommended)
**Store in notifications table**

**Pros:**
- ✅ Persistent
- ✅ Queryable
- ✅ Can filter, search, archive
- ✅ Audit trail

**Cons:**
- ❌ Database size grows
- ❌ Need cleanup strategy

---

### Option B: Cache Only
**Store in Redis**

**Pros:**
- ✅ Fast
- ✅ Low storage

**Cons:**
- ❌ Data loss on crash
- ❌ Not queryable
- ❌ No audit trail

---

### **RECOMMENDATION: Database**
- Notifications are important data
- Need to persist & query
- Cleanup old records periodically

---

## 7. NOTIFICATION DELIVERY GUARANTEE

### Option A: At-Least-Once (Recommended)
**Current approach with ShouldQueue**

**Pros:**
- ✅ Guaranteed delivery
- ✅ Retries on failure
- ✅ Simple to implement

**Cons:**
- ❌ Possible duplicates (rare)
- ❌ Need idempotency key

**Implementation:**
```php
public function backoff(): array
{
    return [1, 5, 15, 60]; // Retry strategy
}

public function retryUntil(): DateTime
{
    return now()->addHours(24);
}
```

---

### Option B: Best-Effort
**Fire and forget**

**Pros:**
- ✅ Simple
- ✅ Fast

**Cons:**
- ❌ No retry
- ❌ Silent failures
- ❌ Bad for important notifications

---

### **RECOMMENDATION: At-Least-Once**
- Notifications are important
- Retry strategy ensures delivery
- Idempotency prevents duplicates

---

## 8. QUIET HOURS IMPLEMENTATION

### Option A: Per User + Per Type (Recommended)
```
user_id: 1
type: 'item_created'
quiet_hours_start: 22:00
quiet_hours_end: 08:00
```

**Pros:**
- ✅ Maximum control
- ✅ Flexible

**Cons:**
- ❌ More complex

---

### Option B: Global Quiet Hours
```
quiet_hours_start: 22:00
quiet_hours_end: 08:00
(applies to all users)
```

**Pros:**
- ✅ Simple

**Cons:**
- ❌ No user control
- ❌ Not suitable for global app

---

### **RECOMMENDATION: Per User**
- Better UX
- Respects user timezone
- Minimal performance impact

---

## 9. NOTIFICATION BATCHING

### Option A: Real-time (Recommended for MVP)
**Send immediately**

**Pros:**
- ✅ Best UX
- ✅ Simple to implement

**Cons:**
- ❌ Possible notification spam
- ❌ Higher email volume

---

### Option B: Digest (Future Enhancement)
**Batch notifications hourly/daily**

**Pros:**
- ✅ Reduces notification spam
- ✅ Lower email volume
- ✅ Better for email channel

**Cons:**
- ❌ More complex
- ❌ Less real-time

---

### **RECOMMENDATION: Real-time for MVP**
- Implement batching in Phase 3
- Start with immediate delivery
- Add digest option later

---

## 10. MONITORING & OBSERVABILITY

### Essential Metrics

```
1. Delivery Metrics
   - Notifications sent per hour
   - Delivery latency (p50, p95, p99)
   - Failed deliveries count
   - Success rate %

2. Queue Metrics
   - Queue size
   - Jobs processed per minute
   - Job processing time
   - Retry rate

3. User Metrics
   - Unread count per user
   - Notification read rate
   - Preference changes
   - Opt-out rate

4. System Metrics
   - WebSocket connections
   - Broadcast latency
   - Email delivery time
   - Database query performance
```

### Monitoring Tools

**Option A: Built-in Laravel Logging**
```php
Log::channel('notifications')->info('Notification sent', [...]);
```

**Option B: Horizon (for queue monitoring)**
```bash
composer require laravel/horizon
php artisan horizon:install
# Access at /horizon
```

**Option C: External Services**
- Sentry for error tracking
- DataDog for metrics
- New Relic for APM

### **RECOMMENDATION: Start with Logging + Horizon**
- Built-in, no additional cost
- Sufficient for MVP
- Add external services if needed

---

## 11. IMPLEMENTATION ROADMAP

### Phase 1: MVP (Week 1-2)
**Minimum Viable Product**

```
✅ Database notifications table
✅ Notification model & scopes
✅ ItemCreated notification class
✅ API endpoints (list, mark as read, count)
✅ NotificationBell component
✅ Basic preferences
✅ Logging
```

**Deliverable:** In-app notifications working

---

### Phase 2: Real-time (Week 3)
**Add WebSocket & real-time updates**

```
✅ Soketi setup
✅ Broadcasting configuration
✅ Laravel Echo integration
✅ WebSocket subscription in React
✅ Toast notifications
✅ Real-time badge updates
✅ Optimistic updates
```

**Deliverable:** Real-time notifications working

---

### Phase 3: Extended (Week 4)
**Add email & preferences UI**

```
✅ Email notifications
✅ Notification preferences UI
✅ Quiet hours configuration
✅ Per-type preferences
✅ Notification center page
✅ Bulk actions
✅ Search & filter
```

**Deliverable:** Full notification system

---

### Phase 4: Polish (Week 5)
**Optimization & monitoring**

```
✅ Performance tuning
✅ Database indexes
✅ Caching strategy
✅ Monitoring setup
✅ Error handling
✅ Testing (unit, feature, E2E)
✅ Documentation
```

**Deliverable:** Production-ready

---

## 12. RISK ASSESSMENT & MITIGATION

### Risk 1: WebSocket Connection Failures
**Impact:** High | **Probability:** Medium

**Mitigation:**
- Implement polling fallback (30s)
- Reconnection logic with exponential backoff
- Monitor connection health
- Alert on widespread failures

---

### Risk 2: Queue Backlog
**Impact:** Medium | **Probability:** Medium

**Mitigation:**
- Monitor queue size
- Scale workers horizontally
- Implement priority queuing
- Alert if backlog > 1000

---

### Risk 3: Email Delivery Failures
**Impact:** Medium | **Probability:** Low

**Mitigation:**
- Use reliable email provider (SendGrid, AWS SES)
- Implement retry logic
- Track delivery status
- Alert on high failure rate

---

### Risk 4: Database Performance
**Impact:** Medium | **Probability:** Low

**Mitigation:**
- Add proper indexes
- Implement pagination
- Archive old notifications
- Monitor query performance

---

### Risk 5: Duplicate Notifications
**Impact:** Low | **Probability:** Low

**Mitigation:**
- Implement idempotency keys
- Check for duplicates before sending
- Deduplicate in frontend

---

## 13. COST ANALYSIS

### Option A: Self-hosted (Recommended)
```
Infrastructure:
- Server: $5-50/month (shared hosting or VPS)
- Redis: Included in hosting
- Database: Included in hosting
- Email: Mailgun free tier (100 emails/day) or SendGrid free tier
- Broadcasting: Soketi (free, open-source)

Total: $5-50/month
```

### Option B: Managed (Pusher + SendGrid)
```
Broadcasting:
- Pusher: $49-499/month

Email:
- SendGrid: $10-100/month

Total: $59-599/month
```

### **RECOMMENDATION: Self-hosted with Soketi**
- Cost-effective ($5-50/month)
- Full control over infrastructure
- Open-source solutions (Soketi)
- Free email tiers sufficient for MVP
- Same developer experience as Pusher

---

## 14. FANOUT ON WRITE (FOW) STRATEGY

### What is FOW?
**Fanout on Write** adalah strategi di mana ketika event terjadi, kita langsung "fan out" (menyebarkan) notifikasi ke semua recipient users secara immediate, bukan menunggu mereka pull/query.

### Option A: Fanout on Write (Recommended for Notifications)
**Immediate distribution ke semua recipients**

**Pros:**
- ✅ Real-time delivery (< 100ms)
- ✅ Notifications instantly available
- ✅ Better UX
- ✅ Ideal untuk notifications yang time-sensitive

**Cons:**
- ❌ More database writes
- ❌ Higher queue load
- ❌ Duplicate prevention needed

**Implementation:**
```php
// When item is created
$item = Item::create($data);

// FOW: Immediately fan out to all recipients
$recipients = User::role('admin')->get();
foreach ($recipients as $recipient) {
    $recipient->notify(new ItemCreated($item));
}

// Each notification queued separately
// Redis queue handles async delivery
```

**Database Impact:**
- 1 item created → N notifications created (where N = number of recipients)
- Example: 1 item → 50 admin users → 50 notification records

---

### Option B: Fanout on Read (Pull Model)
**Lazy distribution when user requests**

**Pros:**
- ✅ Fewer database writes
- ✅ Lower queue load
- ✅ Only store what's needed

**Cons:**
- ❌ Latency when user opens app
- ❌ Need to query & generate on-the-fly
- ❌ Bad UX

**Implementation:**
```php
// When user requests notifications
// Query events & generate notifications dynamically
$events = Event::where('created_at', '>', $user->last_check)
    ->where('recipient_id', $user->id)
    ->get();

$notifications = $events->map(fn($event) => 
    $event->toNotification($user)
);
```

---

### Option C: Hybrid Approach
**FOW for critical, Pull for non-critical**

**Pros:**
- ✅ Balance between UX & performance
- ✅ Flexible per notification type

**Cons:**
- ❌ More complex logic
- ❌ Need to categorize notifications

---

### **RECOMMENDATION: Fanout on Write (FOW)**
- Best untuk notification system
- Real-time delivery critical untuk UX
- Redis queue handles the load
- Idempotency keys prevent duplicates

**FOW Implementation Pattern:**
```php
// 1. Event triggered
event(new ItemCreated($item));

// 2. Listener determines recipients
$recipients = $item->getNotificationRecipients();

// 3. Fan out: Create notification for each recipient
foreach ($recipients as $recipient) {
    Notification::create([
        'notifiable_id' => $recipient->id,
        'notifiable_type' => User::class,
        'type' => 'item_created',
        'data' => [...],
    ]);
    
    // Queue broadcast job
    broadcast(new NotificationCreated($recipient, $notification))->toOthers();
}

// 4. Async delivery via queue
// - Database: Already written
// - Broadcast: Sent via WebSocket
// - Email: Queued for sending
```

---

### FOW Optimization Strategies

**1. Batch Insert (Reduce N queries to 1)**
```php
$notifications = $recipients->map(fn($recipient) => [
    'id' => Str::uuid(),
    'notifiable_id' => $recipient->id,
    'notifiable_type' => User::class,
    'type' => 'item_created',
    'data' => json_encode($data),
    'created_at' => now(),
    'updated_at' => now(),
]);

Notification::insert($notifications->toArray());
```

**2. Broadcast Bulk (Send to multiple users at once)**
```php
// Instead of looping, broadcast to channel
broadcast(new NotificationCreated($notification))
    ->toOthers();
```

**3. Queue Prioritization**
```php
// High priority: Urgent notifications
$notification->onQueue('notifications-high');

// Normal priority: Regular notifications
$notification->onQueue('notifications');

// Low priority: Digest/batch notifications
$notification->onQueue('notifications-low');
```

**4. Idempotency Keys (Prevent duplicates)**
```php
$idempotencyKey = hash('sha256', 
    $item->id . '-' . $recipient->id . '-item_created'
);

// Check if already sent
if (Cache::has("notification:{$idempotencyKey}")) {
    return; // Skip duplicate
}

// Mark as sent
Cache::put("notification:{$idempotencyKey}", true, now()->addHours(24));

// Send notification
$recipient->notify(new ItemCreated($item));
```

---

### FOW vs Pull Comparison

| Aspect | FOW | Pull |
|--------|-----|------|
| **Latency** | < 100ms | 30-60s |
| **DB Writes** | High (N per event) | Low (0 per event) |
| **Queue Load** | High | Low |
| **UX** | Excellent | Poor |
| **Complexity** | Medium | Low |
| **Scalability** | Good with optimization | Better |
| **Best For** | Notifications | Analytics, Reports |

---

## 15. DECISION SUMMARY

| Component | Decision | Reason |
|-----------|----------|--------|
| **Broadcasting** | Soketi | Self-hosted, free, open-source |
| **Queue** | Redis | Already configured, fast, reliable |
| **Channels** | Database + Broadcast + Email | MVP channels |
| **Email** | Mailgun/SendGrid free tier | Free tier sufficient |
| **Preferences** | Per Type + Channel | Better UX, flexible |
| **Real-time** | WebSocket (Soketi) | < 100ms latency |
| **Distribution** | Fanout on Write | Immediate, real-time delivery |
| **Persistence** | Database | Important data, queryable |
| **Delivery** | At-Least-Once | Guaranteed delivery with retry |
| **Quiet Hours** | Per User | Better UX |
| **Batching** | Real-time (MVP) | Simple, add digest later |
| **Monitoring** | Logging + Horizon | Built-in |
| **Cost** | $5-50/month | Self-hosted with Soketi |
| **Timeline** | 4 weeks | Phased approach |

---

## 15. NEXT STEPS

1. **Approve this plan** ✅
2. **Review database schema** with team
3. **Setup Soketi** in development
4. **Start Phase 1 implementation**
5. **Weekly reviews** to adjust timeline

---

## Questions to Consider

- [ ] Do we need SMS notifications? (Affects scope)
- [ ] Do we need mobile push? (Affects scope)
- [ ] What's the expected notification volume? (Affects scaling)
- [ ] Do we need notification templates? (Affects Phase 3)
- [ ] Do we need notification analytics? (Affects monitoring)
- [ ] What's the budget for infrastructure? (Affects hosting choice)
- [ ] Do we need GDPR compliance? (Affects data retention)
