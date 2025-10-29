# Queue Worker Setup Guide

## Problem

Notifications are queued but not appearing because the **queue worker is not running**.

When you create an item, the notification is sent to the queue but won't be delivered until a queue worker processes it.

## Solution

You need to run a queue worker to process queued jobs (notifications, emails, etc.).

## Quick Start

### Development - Run Queue Worker

Open a **separate terminal** and run:

```bash
php artisan queue:work redis --queue=notifications
```

This will:
- ✅ Process notifications in real-time
- ✅ Keep running until you stop it (Ctrl+C)
- ✅ Show progress for each job

### Alternative: Process Queue Once

If you just want to process existing queued jobs without keeping the worker running:

```bash
php artisan queue:work redis --queue=notifications --stop-when-empty
```

## Production Setup

### Option 1: Supervisor (Recommended)

Create a supervisor configuration file:

**File: `/etc/supervisor/conf.d/laravel-worker.conf`**

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/project/artisan queue:work redis --queue=notifications --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/your/project/storage/logs/worker.log
stopwaitsecs=3600
```

Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

### Option 2: Systemd Service

Create a systemd service file:

**File: `/etc/systemd/system/laravel-queue.service`**

```ini
[Unit]
Description=Laravel Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project
ExecStart=/usr/bin/php artisan queue:work redis --queue=notifications --sleep=3 --tries=3
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable laravel-queue
sudo systemctl start laravel-queue
```

### Option 3: Docker Compose

Add a queue worker service to your `docker-compose.yml`:

```yaml
services:
  queue:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    command: php artisan queue:work redis --queue=notifications --sleep=3 --tries=3
    volumes:
      - .:/var/www/html
    depends_on:
      - redis
    networks:
      - lareact12
    restart: unless-stopped
```

## Queue Worker Commands

### Start Queue Worker
```bash
# Process all queues
php artisan queue:work

# Process specific queue
php artisan queue:work redis --queue=notifications

# Process with options
php artisan queue:work redis --queue=notifications --sleep=3 --tries=3 --timeout=60
```

### Monitor Queue
```bash
# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Check queue size (Redis)
php artisan tinker --execute="echo Redis::llen('queues:notifications');"
```

### Clear Queue
```bash
# Clear all jobs from a queue
php artisan queue:clear redis --queue=notifications

# Flush all failed jobs
php artisan queue:flush
```

## Queue Configuration

### Current Setup

**File: `.env`**
```env
QUEUE_CONNECTION=redis
BROADCAST_DRIVER=pusher
```

### Available Queue Drivers

- **redis** (current) - Fast, reliable, requires Redis server
- **database** - Stores jobs in database
- **sync** - Processes immediately (no queue, for testing)
- **sqs** - Amazon SQS
- **beanstalkd** - Beanstalk queue

### Switch to Sync (No Queue Worker Needed)

For development/testing, you can disable queuing:

**File: `.env`**
```env
QUEUE_CONNECTION=sync
```

This will process notifications immediately without needing a queue worker.

⚠️ **Not recommended for production** - can slow down requests.

## Troubleshooting

### Notifications Not Appearing

1. **Check if queue worker is running:**
   ```bash
   # Linux/Mac
   ps aux | grep "queue:work"
   
   # Windows
   tasklist | findstr "php"
   ```

2. **Check queue size:**
   ```bash
   php artisan tinker --execute="echo 'Jobs in queue: ' . Redis::llen('queues:notifications');"
   ```

3. **Check notifications in database:**
   ```bash
   php artisan tinker --execute="echo 'Notifications: ' . DB::table('notifications')->count();"
   ```

4. **Check failed jobs:**
   ```bash
   php artisan queue:failed
   ```

### Common Issues

**Issue: Jobs stuck in queue**
```bash
# Process them manually
php artisan queue:work redis --queue=notifications --stop-when-empty
```

**Issue: Queue worker stops unexpectedly**
```bash
# Use supervisor or systemd for auto-restart
# Or add --tries=3 to retry failed jobs
php artisan queue:work redis --queue=notifications --tries=3
```

**Issue: Memory leaks**
```bash
# Restart worker after processing 1000 jobs
php artisan queue:work redis --queue=notifications --max-jobs=1000

# Or restart after 1 hour
php artisan queue:work redis --queue=notifications --max-time=3600
```

## Development Workflow

### Recommended Setup

Run these in **separate terminals**:

**Terminal 1: Laravel Server**
```bash
php artisan serve
```

**Terminal 2: Queue Worker**
```bash
php artisan queue:work redis --queue=notifications
```

**Terminal 3: Vite Dev Server**
```bash
npm run dev
```

**Terminal 4: Soketi WebSocket Server** (if using real-time notifications)
```bash
# If using Docker
docker-compose up soketi

# Or standalone
soketi start
```

## Monitoring

### Check Queue Status
```bash
# View queue statistics
php artisan queue:monitor redis:notifications

# Watch queue in real-time
watch -n 1 'php artisan tinker --execute="echo Redis::llen(\"queues:notifications\");"'
```

### Laravel Horizon (Optional)

For advanced queue monitoring, install Laravel Horizon:

```bash
composer require laravel/horizon
php artisan horizon:install
php artisan horizon
```

Then visit: `http://localhost:8000/horizon`

## Best Practices

✅ **Always run queue worker in production**
✅ **Use supervisor/systemd for auto-restart**
✅ **Monitor failed jobs regularly**
✅ **Set appropriate timeout values**
✅ **Use separate queues for different job types**
✅ **Log queue worker output**
✅ **Set max-jobs or max-time to prevent memory leaks**

## Quick Reference

```bash
# Start worker (development)
php artisan queue:work redis --queue=notifications

# Start worker (production)
php artisan queue:work redis --queue=notifications --sleep=3 --tries=3 --max-time=3600

# Process once and stop
php artisan queue:work redis --queue=notifications --stop-when-empty

# Check queue
php artisan tinker --execute="echo Redis::llen('queues:notifications');"

# Check notifications
php artisan tinker --execute="echo DB::table('notifications')->count();"

# Restart worker (after code changes)
php artisan queue:restart
```

## Summary

**The issue:** Notifications are queued but queue worker is not running.

**The fix:** Run `php artisan queue:work redis --queue=notifications` in a separate terminal.

**For production:** Use supervisor or systemd to keep the queue worker running automatically.
