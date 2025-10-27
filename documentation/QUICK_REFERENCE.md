# Quick Reference Guide

## Common Tasks

### 1. Create a New Notification Type

**Step 1: Create Notification Class**

```php
// app/Notifications/ItemDeleted.php
namespace App\Notifications;

use App\Models\Item;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ItemDeleted extends Notification
{
    public function __construct(public Item $item) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast', 'mail'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => 'Item Deleted',
            'body' => "Item '{$this->item->string}' was deleted",
            'action_url' => route('sample.items.index'),
            'icon' => 'trash-2',
        ];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Item Deleted')
            ->line("Item '{$this->item->string}' has been deleted.");
    }
}
```

**Step 2: Create Event**

```php
// app/Events/ItemDeleted.php
namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ItemDeleted
{
    use Dispatchable, SerializesModels;

    public function __construct(public $model) {}
}
```

**Step 3: Create Listener**

```php
// app/Listeners/SendItemDeletedNotification.php
namespace App\Listeners;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use App\Notifications\ItemDeleted;
use Illuminate\Support\Str;

class SendItemDeletedNotification
{
    public function handle($event): void
    {
        $item = $event->model;
        $recipients = User::where('id', '!=', $item->deleted_by)
            ->where('active', true)
            ->get();

        if ($recipients->isEmpty()) return;

        $notificationData = $recipients->map(function ($recipient) use ($item) {
            return [
                'id' => Str::uuid(),
                'notifiable_id' => $recipient->id,
                'notifiable_type' => User::class,
                'type' => 'item_deleted',
                'data' => json_encode([
                    'title' => 'Item Deleted',
                    'body' => "Item '{$item->string}' was deleted",
                    'action_url' => route('sample.items.index'),
                    'icon' => 'trash-2',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->toArray();

        Notification::insert($notificationData);

        $notifications = Notification::whereIn('id', 
            collect($notificationData)->pluck('id')
        )->get();

        foreach ($notifications as $notification) {
            broadcast(new NotificationCreated($notification, $notification->notifiable_id))->toOthers();
        }

        foreach ($recipients as $recipient) {
            $recipient->notify(new ItemDeleted($item));
        }
    }
}
```

**Step 4: Register in EventServiceProvider**

```php
// app/Providers/EventServiceProvider.php
protected $listen = [
    ItemCreated::class => [SendItemCreatedNotification::class],
    ItemDeleted::class => [SendItemDeletedNotification::class], // Add this
];
```

---

### 2. Add NotificationBell to Layout

```tsx
// resources/js/layouts/AppLayout.tsx
import { NotificationBell } from '@/components/NotificationBell';

export default function AppLayout({ children }) {
  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1>My App</h1>
          <NotificationBell />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

### 3. Create Notifications Page

```tsx
// resources/js/pages/Notifications.tsx
import { NotificationCenter } from '@/components/NotificationCenter';

export default function NotificationsPage() {
  return (
    <div>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <NotificationCenter />
      </div>
    </div>
  );
}
```

---

### 4. Create Settings Page

```tsx
// resources/js/pages/Settings.tsx
import { NotificationPreferences } from '@/components/NotificationPreferences';

export default function SettingsPage() {
  return (
    <div>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <NotificationPreferences />
      </div>
    </div>
  );
}
```

---

### 5. Use Notifications in Component

```tsx
// resources/js/components/MyComponent.tsx
import { useNotifications } from '@/hooks/useNotifications';

export default function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.slice(0, 5).map((n) => (
        <div key={n.id} className="p-4 border rounded">
          <h3>{n.data.title}</h3>
          <p>{n.data.body}</p>
          {!n.read_at && (
            <button onClick={() => markAsRead(n.id)}>Mark as Read</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### 6. Show Toast Notifications

```tsx
// resources/js/components/MyComponent.tsx
import { ToastContainer } from '@/components/NotificationToast';
import { useState } from 'react';

export default function MyComponent() {
  const [toasts, setToasts] = useState([]);

  const showToast = (type, title, message) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  return (
    <>
      <button onClick={() => showToast('success', 'Success', 'Operation completed!')}>
        Show Toast
      </button>
      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </>
  );
}
```

---

### 7. Test Notifications

```bash
# Run all tests
npm run test

# Run specific test file
npm run test useNotifications.test.ts

# Run with coverage
npm run test -- --coverage

# Run PHP tests
php artisan test tests/Feature/Notifications/

# Run specific test
php artisan test tests/Feature/Notifications/NotificationApiTest.php::test_can_get_notifications
```

---

### 8. Monitor Queue

```bash
# Check failed jobs
php artisan queue:failed

# Retry failed job
php artisan queue:retry {id}

# Retry all failed jobs
php artisan queue:retry all

# Start queue worker
php artisan queue:work --queue=notifications

# Monitor with Horizon
php artisan horizon
```

---

### 9. Debug Issues

```bash
# Check logs
tail -f storage/logs/laravel.log

# Check database
php artisan tinker
>>> Notification::count()
>>> NotificationPreference::where('user_id', 1)->get()

# Test email
php artisan tinker
>>> Mail::raw('Test', fn($m) => $m->to('test@example.com'));

# Test broadcasting
>>> broadcast(new \App\Events\NotificationCreated($notification, 1))->toOthers();
```

---

### 10. Deploy to Production

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
composer install --optimize-autoloader --no-dev
npm install

# 3. Build frontend
npm run build

# 4. Run migrations
php artisan migrate --force

# 5. Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Restart queue workers
supervisorctl restart notification-queue:*

# 7. Verify health
curl https://example.com/health
```

---

## API Quick Reference

### Get Notifications
```bash
curl -X GET 'http://localhost:8000/api/notifications?filter=unread' \
  -H 'Authorization: Bearer {token}'
```

### Get Unread Count
```bash
curl -X GET 'http://localhost:8000/api/notifications/count' \
  -H 'Authorization: Bearer {token}'
```

### Mark as Read
```bash
curl -X PATCH 'http://localhost:8000/api/notifications/{id}/read' \
  -H 'Authorization: Bearer {token}'
```

### Mark All as Read
```bash
curl -X PATCH 'http://localhost:8000/api/notifications/read-all' \
  -H 'Authorization: Bearer {token}'
```

### Delete Notification
```bash
curl -X DELETE 'http://localhost:8000/api/notifications/{id}' \
  -H 'Authorization: Bearer {token}'
```

### Get Preferences
```bash
curl -X GET 'http://localhost:8000/api/notification-preferences' \
  -H 'Authorization: Bearer {token}'
```

### Update Preference
```bash
curl -X PUT 'http://localhost:8000/api/notification-preferences' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "item_created",
    "channel": "email",
    "enabled": true,
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "08:00"
  }'
```

---

## Environment Variables

```env
# Broadcasting
BROADCAST_DRIVER=soketi
SOKETI_HOST=localhost
SOKETI_PORT=6001
SOKETI_APP_KEY=app-key
SOKETI_APP_SECRET=app-secret

# Queue
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Email
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=mg.example.com
MAILGUN_SECRET=your-api-key

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=notifications
```

---

## File Locations

| Component | Location |
|-----------|----------|
| Models | `app/Models/` |
| Events | `app/Events/` |
| Listeners | `app/Listeners/` |
| Notifications | `app/Notifications/` |
| Controllers | `app/Http/Controllers/Api/` |
| Components | `resources/js/components/` |
| Hooks | `resources/js/hooks/` |
| Tests | `tests/Feature/Notifications/` |
| Config | `config/broadcasting.php` |
| Migrations | `database/migrations/` |
| Documentation | `documentation/` |

---

## Useful Commands

```bash
# Create new notification
php artisan make:notification ItemDeleted

# Create new event
php artisan make:event ItemDeleted

# Create new listener
php artisan make:listener SendItemDeletedNotification

# Create migration
php artisan make:migration create_notifications_table

# Run tests
php artisan test

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Start development server
php artisan serve

# Start queue worker
php artisan queue:work

# Start Soketi
docker-compose -f docker-compose.soketi.yml up -d
```

---

## Performance Tips

1. **Use pagination** for large notification lists
2. **Memoize components** to prevent re-renders
3. **Debounce API calls** when updating preferences
4. **Enable database indexes** on frequently queried columns
5. **Cache notification counts** for 1 minute
6. **Use batch inserts** for multiple notifications
7. **Lazy load** notification center on demand
8. **Monitor queue** for failed jobs

---

## Security Tips

1. **Always validate input** on API endpoints
2. **Check authorization** before accessing notifications
3. **Use private channels** for WebSocket
4. **Encrypt sensitive data** in database
5. **Log all preference changes** for audit trail
6. **Rate limit API** endpoints
7. **Use HTTPS** in production
8. **Keep dependencies updated** regularly

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Notifications not appearing | Check WebSocket connection, verify Soketi is running |
| Emails not sending | Check queue worker, verify email config, check failed jobs |
| API 401 error | Verify authentication token, check Sanctum config |
| API 403 error | Check authorization policy, verify user ownership |
| Slow queries | Add database indexes, use eager loading |
| High memory usage | Check queue processing, implement pagination |
| Broadcasting errors | Verify Soketi connection, check channel authorization |

---

## Documentation Index

- **EMAIL_SETUP.md** - Email configuration guide
- **REACT_COMPONENTS.md** - Component & hook documentation
- **API_ENDPOINTS.md** - Complete API reference
- **PERFORMANCE_OPTIMIZATION.md** - Performance tuning guide
- **SECURITY_AUDIT.md** - Security best practices
- **DEPLOYMENT_GUIDE.md** - Production deployment
- **IMPLEMENTATION_SUMMARY.md** - Project overview
- **QUICK_REFERENCE.md** - This file

---

## Support Resources

- [Laravel Docs](https://laravel.com/docs)
- [React Docs](https://react.dev)
- [Socket.IO Docs](https://socket.io/docs/)
- [Soketi Docs](https://docs.soketi.app/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Last Updated:** 2025-10-27
**Version:** 1.0.0
