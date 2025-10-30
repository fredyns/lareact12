# Laravel Reverb Setup Guide

## Overview

This application uses **Laravel Reverb** for real-time WebSocket broadcasting. Reverb is Laravel's official first-party WebSocket server that provides a blazing-fast and scalable real-time communication layer.

## Why Reverb?

✅ **Official Laravel Solution** - First-party package with excellent Laravel integration  
✅ **Better Performance** - Built specifically for Laravel, optimized for speed  
✅ **Simpler Configuration** - Less complex than Soketi or Pusher  
✅ **Active Development** - Maintained by the Laravel team  
✅ **Docker Ready** - Easy to deploy in containerized environments  
✅ **Native Protocol** - No need for Pusher protocol compatibility layer  

---

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │    Reverb    │ ◄─────► │   Laravel   │
│  (Pusher.js)│   WS    │   Server     │  Redis  │     App     │
└─────────────┘         └──────────────┘         └─────────────┘
```

**Flow:**
1. Laravel app fires broadcast event (e.g., `NotificationCreated`)
2. Event is sent to Reverb server via Redis (optional scaling)
3. Reverb broadcasts to connected WebSocket clients
4. Browser receives real-time update via Pusher.js client

---

## Configuration

### Backend Configuration

**1. Environment Variables (.env)**

```env
# Broadcasting
BROADCAST_DRIVER=reverb
BROADCAST_CONNECTION=reverb

# Reverb Configuration
REVERB_APP_ID=lareact12
REVERB_APP_KEY=lareact12-key
REVERB_APP_SECRET=lareact12-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Reverb Server Configuration (for Docker)
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080
```

**2. Broadcasting Config (config/broadcasting.php)**

```php
'reverb' => [
    'driver' => 'reverb',
    'key' => env('REVERB_APP_KEY'),
    'secret' => env('REVERB_APP_SECRET'),
    'app_id' => env('REVERB_APP_ID'),
    'options' => [
        'host' => env('REVERB_HOST', 'localhost'),
        'port' => env('REVERB_PORT', 8080),
        'scheme' => env('REVERB_SCHEME', 'http'),
        'useTLS' => env('REVERB_SCHEME', 'http') === 'https',
    ],
],
```

### Frontend Configuration

**1. Environment Variables (.env)**

```env
# Frontend Reverb Configuration (Browser accessible)
VITE_REVERB_APP_KEY=lareact12-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

**2. WebSocket Context (resources/js/contexts/WebSocketContext.tsx)**

```typescript
const pusherInstance = new Pusher(import.meta.env.VITE_REVERB_APP_KEY || '', {
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080', 10),
  forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: '/broadcasting/auth',
  // ... auth headers
});
```

---

## Requirements

### PHP Extensions

Laravel Reverb requires the following PHP extensions:
- ✅ **pcntl** - Process control (for signal handling)
- ✅ **sockets** - Socket support (for WebSocket connections)
- ✅ **redis** - Redis support (optional, for scaling)

These are included in the Docker setup automatically.

**Note for Alpine Linux:** The `sockets` extension requires `linux-headers` package to compile successfully.

---

## Docker Setup

### Docker Compose Service

```yaml
reverb:
  build:
    context: ./docker/php
    dockerfile: Dockerfile
  container_name: lareact12_reverb
  working_dir: /var/www/html
  volumes:
    - '.:/var/www/html'
  environment:
    - REVERB_APP_ID=${REVERB_APP_ID}
    - REVERB_APP_KEY=${REVERB_APP_KEY}
    - REVERB_APP_SECRET=${REVERB_APP_SECRET}
    - REVERB_HOST=${REVERB_HOST:-localhost}
    - REVERB_PORT=${REVERB_PORT:-8080}
    - REVERB_SCHEME=${REVERB_SCHEME:-http}
    - REDIS_HOST=redis
    - REDIS_PORT=6379
  ports:
    - '${REVERB_PORT:-8080}:8080'
  networks:
    - sail
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  command: php artisan reverb:start --host=0.0.0.0 --port=8080 --debug
  restart: unless-stopped
```

### Starting Services

```bash
# Start all services including Reverb
docker-compose up -d

# View Reverb logs
docker-compose logs -f reverb

# Restart Reverb
docker-compose restart reverb
```

---

## Usage

### Broadcasting Events

**1. Create Broadcast Event**

```php
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class NotificationCreated implements ShouldBroadcastNow
{
    public function __construct(
        public Notification $notification,
        public string $userId
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("App.Models.User.{$this->userId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'data' => $this->notification->data,
        ];
    }
}
```

**2. Fire Event**

```php
// From anywhere in your application
event(new NotificationCreated($notification, $userId));

// Or use broadcast helper
broadcast(new NotificationCreated($notification, $userId));
```

### Listening on Frontend

**1. Subscribe to Private Channel**

```typescript
import { useWebSocket } from '@/contexts/WebSocketContext';

const { pusher } = useWebSocket();

useEffect(() => {
  if (!pusher || !user) return;

  const channel = pusher.subscribe(`private-App.Models.User.${user.id}`);
  
  channel.bind('notification.created', (data: any) => {
    console.log('New notification:', data);
    // Handle notification
  });

  return () => {
    channel.unbind('notification.created');
    pusher.unsubscribe(`private-App.Models.User.${user.id}`);
  };
}, [pusher, user]);
```

---

## Channel Authorization

**Route (routes/web.php)**

```php
Route::post('broadcasting/auth', function (Illuminate\Http\Request $request) {
    return Illuminate\Support\Facades\Broadcast::auth($request);
})->middleware(['auth']);
```

**Channel Definition (routes/channels.php)**

```php
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});
```

---

## Debugging

### Check Reverb Connection

**1. Browser Console**

```javascript
// You should see:
🔧 Reverb Config: { key: "...", host: "localhost", port: 8080, ... }
✅ Reverb connected
```

**2. Reverb Server Logs**

```bash
docker-compose logs -f reverb
```

Look for:
- `Reverb server started`
- Connection messages when browser connects
- Broadcast messages when events fire

### Common Issues

**❌ Connection Refused**

```
WebSocket connection to 'ws://localhost:8080' failed
```

**Solution:**
- Ensure Reverb service is running: `docker-compose ps`
- Check port is exposed: `docker-compose port reverb 8080`
- Verify VITE_REVERB_* variables match backend

**❌ 403 Forbidden on Private Channels**

```
Pusher: Received 403 from /broadcasting/auth
```

**Solution:**
- Ensure user is authenticated
- Check channel authorization in `routes/channels.php`
- Verify CSRF token is being sent

**❌ Events Not Broadcasting**

**Solution:**
- Check event implements `ShouldBroadcastNow`
- Verify `BROADCAST_DRIVER=reverb` in .env
- Check Reverb logs for errors
- Ensure Redis is running if using scaling

**❌ Undefined constant SIGINT/SIGTERM**

```
Undefined constant "Laravel\Reverb\Servers\Reverb\Console\Commands\SIGINT"
```

**Solution:**
- PCNTL extension is missing
- Update Dockerfile to include `linux-headers` and extensions:
```dockerfile
# Add linux-headers for sockets extension
RUN apk add --no-cache linux-headers

# Install extensions
RUN docker-php-ext-install pcntl sockets
```
- Rebuild Docker images: `docker-compose build --no-cache app queue scheduler reverb`
- Restart services: `docker-compose up -d`

**❌ Sockets extension compilation error**

```
make: *** [Makefile:213: sockets.lo] Error 1
```

**Solution:**
- Missing `linux-headers` package on Alpine Linux
- Add to Dockerfile:
```dockerfile
RUN apk add --no-cache linux-headers
```
- Rebuild: `docker-compose build --no-cache app queue scheduler reverb`

---

## Performance Optimization

### Enable Redis Scaling

For production with multiple Reverb instances:

```env
REVERB_SCALING_ENABLED=true
REVERB_SCALING_CHANNEL=reverb
```

This allows multiple Reverb servers to share state via Redis.

### Connection Limits

```env
REVERB_APP_MAX_CONNECTIONS=10000
REVERB_APP_MAX_MESSAGE_SIZE=10000
```

### Ping Interval

```env
REVERB_APP_PING_INTERVAL=60
REVERB_APP_ACTIVITY_TIMEOUT=30
```

---

## Production Deployment

### HTTPS/TLS Configuration

```env
REVERB_SCHEME=https
REVERB_PORT=443
```

Update Reverb config to include TLS certificates:

```php
'options' => [
    'tls' => [
        'local_cert' => '/path/to/cert.pem',
        'local_pk' => '/path/to/key.pem',
    ],
],
```

### Supervisor Configuration

```ini
[program:reverb]
command=php /var/www/html/artisan reverb:start
directory=/var/www/html
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/html/storage/logs/reverb.log
```

### Monitoring

Monitor Reverb health:

```bash
# Check if process is running
ps aux | grep reverb

# Monitor connections
docker-compose exec reverb php artisan reverb:stats
```

---

## Migration from Soketi

If migrating from Soketi:

1. ✅ Update environment variables (SOKETI_* → REVERB_*)
2. ✅ Update broadcasting config
3. ✅ Update docker-compose.yaml
4. ✅ Update frontend WebSocket context
5. ✅ Rebuild frontend: `npm run build`
6. ✅ Restart services: `docker-compose up -d`

**No code changes required** - Reverb uses the same Pusher protocol!

---

## Testing

### Manual Test

1. Open browser console
2. Navigate to application
3. Trigger a notification (e.g., create a Sample Item)
4. Check console for:
   ```
   ✅ Reverb connected
   New notification: { id: "...", type: "...", ... }
   ```

### Automated Test

```php
use Illuminate\Support\Facades\Event;

public function test_notification_broadcasts()
{
    Event::fake();
    
    $notification = Notification::create([...]);
    
    Event::assertDispatched(NotificationCreated::class, function ($event) use ($notification) {
        return $event->notification->id === $notification->id;
    });
}
```

---

## Resources

- [Laravel Reverb Documentation](https://laravel.com/docs/reverb)
- [Pusher.js Documentation](https://pusher.com/docs/channels/using_channels/client-api-overview/)
- [Broadcasting Documentation](https://laravel.com/docs/broadcasting)

---

## Support

For issues or questions:
1. Check Reverb logs: `docker-compose logs -f reverb`
2. Check browser console for connection errors
3. Verify environment variables are set correctly
4. Ensure Redis is running for scaling features
