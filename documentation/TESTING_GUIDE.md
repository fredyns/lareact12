# Testing Guide - Notification System

## Quick Start

### 1. Start Development Environment

```bash
# Terminal 1: Start Docker services
docker-compose -f docker-compose.soketi.yml up -d

# Terminal 2: Start Laravel development server
php artisan serve

# Terminal 3: Start queue worker
php artisan queue:work --queue=notifications

# Terminal 4: Start frontend dev server
npm run dev
```

### 2. Access Application

- **Application:** http://localhost:8000
- **Frontend Dev:** http://localhost:5173 (if using Vite)

---

## Manual Testing

### Test 1: View Notification Bell in Dashboard

1. Log in to the application
2. Navigate to Dashboard
3. Look for the **bell icon** in the top-right header
4. Verify the bell icon is visible next to the search icon

**Expected:** Bell icon with no badge (0 unread notifications)

---

### Test 2: Create a Notification

#### Via Database (Quick Test)

```bash
php artisan tinker

# Create a test notification
>>> $user = \App\Models\User::first();
>>> \App\Models\Notification::create([
    'notifiable_id' => $user->id,
    'notifiable_type' => 'App\Models\User',
    'type' => 'item_created',
    'data' => json_encode([
        'title' => 'Test Notification',
        'body' => 'This is a test notification',
        'action_url' => '/dashboard',
        'icon' => 'bell',
    ]),
]);
```

#### Via Event (Proper Way)

```bash
php artisan tinker

# Trigger the event
>>> $item = \App\Models\Item::first();
>>> event(new \App\Events\ItemCreated($item));
```

---

### Test 3: Check Notification Badge

1. After creating a notification, refresh the page
2. Look at the bell icon
3. **Expected:** Red badge showing "1" unread notification

---

### Test 4: Open Notification Dropdown

1. Click the bell icon
2. **Expected:** Dropdown shows:
   - "Notifications" header with "1 new" badge
   - Recent notification with title and body
   - "View all notifications" link at bottom

---

### Test 5: Mark as Read from Dropdown

1. In the dropdown, click the "Mark" button on a notification
2. **Expected:**
   - Notification is marked as read
   - Badge count decreases
   - Notification styling changes (no longer highlighted)

---

### Test 6: View All Notifications Page

1. Click "View all notifications" link in dropdown
2. Navigate to `/notifications`
3. **Expected:**
   - Full notification center page loads
   - Shows all notifications with filtering options
   - Displays stats (Total, Unread, Read)

---

### Test 7: Filter Notifications

1. On notifications page, select "Unread" from filter dropdown
2. **Expected:** Only unread notifications are shown

3. Select "All" to show all notifications
4. **Expected:** All notifications are shown

---

### Test 8: Mark All as Read

1. On notifications page, click "Mark all as read" button
2. **Expected:**
   - All notifications marked as read
   - Badge count becomes 0
   - All notifications styling changes

---

### Test 9: Delete Notification

1. On notifications page, click "Delete" button on a notification
2. **Expected:** Notification is removed from the list

---

### Test 10: Notification Settings

1. Navigate to `/settings/notifications`
2. **Expected:**
   - Settings page loads
   - Shows notification type cards (item_created, item_updated)
   - Each type has toggles for channels (in-app, email)

---

### Test 11: Toggle Notification Preferences

1. On settings page, toggle "in-app notifications" for item_created
2. **Expected:**
   - Toggle switches
   - Success message appears
   - Preference is saved

---

### Test 12: Reset Preferences

1. On settings page, click "Reset to Defaults" button
2. Confirm the dialog
3. **Expected:**
   - All preferences reset to enabled
   - Success message appears

---

## Real-time Testing

### Test 13: Real-time Notification (WebSocket)

1. Open two browser windows/tabs
2. Log in as different users in each
3. In one window, create a notification for the other user
4. **Expected:** Notification appears in real-time in the other window (< 100ms)

---

### Test 14: WebSocket Connection

1. Open browser DevTools
2. Go to Network tab → WS (WebSocket)
3. You should see WebSocket connections to `ws://localhost:6001`
4. **Expected:** Multiple WebSocket connections for different channels

---

## Automated Testing

### Run Unit Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test useNotifications.test.ts

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

### Run Integration Tests

```bash
# Run all PHP tests
php artisan test

# Run specific test file
php artisan test tests/Feature/Notifications/NotificationApiTest.php

# Run specific test method
php artisan test tests/Feature/Notifications/NotificationApiTest.php::test_can_get_notifications
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html
```

---

## API Testing

### Using cURL

```bash
# Get auth token
TOKEN=$(curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# Get notifications
curl -X GET http://localhost:8000/api/notifications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# Get notification count
curl -X GET http://localhost:8000/api/notifications/count \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# Mark as read
curl -X PATCH http://localhost:8000/api/notifications/{id}/read \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# Mark all as read
curl -X PATCH http://localhost:8000/api/notifications/read-all \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# Delete notification
curl -X DELETE http://localhost:8000/api/notifications/{id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

### Using Postman

1. Create a new Postman collection
2. Add requests for each endpoint
3. Use environment variables for token and base URL
4. Test each endpoint with different scenarios

---

## Email Testing

### Using Mailtrap

1. Sign up at [mailtrap.io](https://mailtrap.io)
2. Get SMTP credentials
3. Update `.env`:
   ```
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USERNAME=your_username
   MAIL_PASSWORD=your_password
   ```
4. Create a notification that sends email
5. Check Mailtrap inbox

### Using MailHog (Local)

```bash
# Run MailHog in Docker
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Update .env
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM_ADDRESS=test@example.com

# Access MailHog UI at http://localhost:8025
```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test notifications endpoint
ab -n 1000 -c 10 http://localhost:8000/api/notifications

# Test with authentication
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/notifications
```

### Load Testing with wrk

```bash
# Install wrk
brew install wrk  # macOS
apt-get install wrk  # Ubuntu

# Run load test
wrk -t4 -c100 -d30s http://localhost:8000/api/notifications
```

### Monitor Performance

```bash
# Check database query time
php artisan tinker
>>> DB::enableQueryLog();
>>> \App\Models\Notification::where('notifiable_id', 1)->paginate(20);
>>> dd(DB::getQueryLog());

# Check queue processing time
php artisan queue:work --verbose

# Monitor with Horizon
php artisan horizon
# Access at http://localhost:8000/horizon
```

---

## Debugging

### Enable Query Logging

```php
// In AppServiceProvider
if ($this->app->environment('local')) {
    DB::listen(function ($query) {
        Log::info('Query', [
            'sql' => $query->sql,
            'time' => $query->time,
        ]);
    });
}
```

### Check Logs

```bash
# View logs in real-time
tail -f storage/logs/laravel.log

# Search for errors
grep -i "error\|exception" storage/logs/laravel.log

# Check specific date
tail -f storage/logs/laravel-2025-10-27.log
```

### Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Check for JavaScript errors
4. Monitor WebSocket messages

### Network Tab

1. Open DevTools
2. Go to Network tab
3. Filter by XHR (API calls)
4. Check request/response headers and body

---

## Troubleshooting

### Notification Not Appearing

1. Check if notification was created in database:
   ```bash
   php artisan tinker
   >>> \App\Models\Notification::latest()->first();
   ```

2. Check queue worker is running:
   ```bash
   php artisan queue:work --queue=notifications
   ```

3. Check failed jobs:
   ```bash
   php artisan queue:failed
   ```

4. Check browser console for errors

### WebSocket Not Connecting

1. Verify Soketi is running:
   ```bash
   docker ps | grep soketi
   ```

2. Check Soketi logs:
   ```bash
   docker logs notification-soketi
   ```

3. Verify SOKETI_* environment variables in `.env`

4. Check browser console for WebSocket errors

### Email Not Sending

1. Check mail configuration in `.env`
2. Check failed jobs: `php artisan queue:failed`
3. Check logs: `tail -f storage/logs/laravel.log`
4. Test mail sending:
   ```bash
   php artisan tinker
   >>> Mail::raw('Test', fn($m) => $m->to('test@example.com'));
   ```

---

## Test Checklist

- [ ] Bell icon visible in header
- [ ] Badge shows correct unread count
- [ ] Dropdown shows recent notifications
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Notifications page loads
- [ ] Filter by unread works
- [ ] Settings page loads
- [ ] Toggle preferences works
- [ ] Reset preferences works
- [ ] Real-time notifications work
- [ ] WebSocket connects
- [ ] API endpoints work
- [ ] Emails send (if configured)
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Performance targets met

---

## Next Steps

1. Test all manual scenarios
2. Run automated tests
3. Perform load testing
4. Check performance metrics
5. Deploy to staging
6. Gather user feedback
7. Deploy to production

---

**Last Updated:** 2025-10-27
**Version:** 1.0.0
