# Docker Queue Worker Setup

## Overview

A dedicated **queue worker service** has been added to the Docker Compose configuration to automatically process queued jobs (notifications, emails, etc.) in the background.

## What Was Added

### New Service: `queue`

```yaml
queue:
    build:
        context: ./docker/php
        dockerfile: Dockerfile
    container_name: lareact12_queue
    working_dir: /var/www/html
    volumes:
        - '.:/var/www/html'
    environment:
        - DB_HOST=postgres
        - DB_PORT=5432
        - DB_DATABASE=${DB_DATABASE}
        - DB_USERNAME=${DB_USERNAME}
        - DB_PASSWORD=${DB_PASSWORD}
        - REDIS_HOST=redis
        - REDIS_PORT=6379
    networks:
        - sail
    depends_on:
        postgres:
            condition: service_healthy
        redis:
            condition: service_healthy
    command: php artisan queue:work redis --queue=notifications --sleep=3 --tries=3 --max-time=3600
    restart: unless-stopped
    healthcheck:
        test: ["CMD-SHELL", "ps aux | grep -q '[q]ueue:work' || exit 1"]
        retries: 3
        timeout: 5s
        interval: 30s
```

## Features

✅ **Auto-start**: Starts automatically with `docker-compose up`
✅ **Auto-restart**: Restarts if it crashes (`restart: unless-stopped`)
✅ **Health checks**: Monitors if queue worker is running
✅ **Shared volumes**: Same codebase as main app
✅ **Same environment**: Uses same database and Redis connections
✅ **Optimized settings**: 
   - `--sleep=3`: Wait 3 seconds between jobs
   - `--tries=3`: Retry failed jobs up to 3 times
   - `--max-time=3600`: Restart after 1 hour to prevent memory leaks

## Usage

### Start All Services (Including Queue Worker)

```bash
docker-compose up -d
```

This will start:
- ✅ PostgreSQL database
- ✅ Redis cache/queue
- ✅ MinIO object storage
- ✅ Soketi WebSocket server
- ✅ Mailpit email testing
- ✅ PHP application
- ✅ Nginx web server
- ✅ **Queue worker** (new!)

### Check Queue Worker Status

```bash
# View queue worker logs
docker-compose logs -f queue

# Check if queue worker is running
docker-compose ps queue

# View real-time logs
docker-compose logs --tail=50 -f queue
```

### Restart Queue Worker

After making code changes to notification classes:

```bash
# Restart just the queue worker
docker-compose restart queue

# Or send restart signal (graceful)
docker-compose exec app php artisan queue:restart
```

### Stop Queue Worker

```bash
# Stop queue worker only
docker-compose stop queue

# Stop all services
docker-compose down
```

## Monitoring

### Check Queue Status

```bash
# Check how many jobs are in the queue
docker-compose exec app php artisan tinker --execute="echo 'Jobs in queue: ' . Redis::llen('queues:notifications');"

# Check notifications in database
docker-compose exec app php artisan tinker --execute="echo 'Notifications: ' . DB::table('notifications')->count();"

# View failed jobs
docker-compose exec app php artisan queue:failed
```

### View Queue Worker Logs

```bash
# Last 100 lines
docker-compose logs --tail=100 queue

# Follow logs in real-time
docker-compose logs -f queue

# Logs with timestamps
docker-compose logs -t queue
```

## Scaling Queue Workers

If you need multiple queue workers for high traffic:

```bash
# Scale to 3 queue workers
docker-compose up -d --scale queue=3
```

Or add multiple queue services in `compose.yaml`:

```yaml
queue_notifications:
    # ... same config as queue
    command: php artisan queue:work redis --queue=notifications --sleep=3 --tries=3

queue_emails:
    # ... same config as queue
    command: php artisan queue:work redis --queue=emails --sleep=3 --tries=3

queue_default:
    # ... same config as queue
    command: php artisan queue:work redis --queue=default --sleep=3 --tries=3
```

## Troubleshooting

### Queue Worker Not Processing Jobs

**Check if it's running:**
```bash
docker-compose ps queue
```

**View logs for errors:**
```bash
docker-compose logs queue
```

**Restart the worker:**
```bash
docker-compose restart queue
```

### Jobs Stuck in Queue

**Process them manually:**
```bash
docker-compose exec app php artisan queue:work redis --queue=notifications --stop-when-empty
```

**Clear the queue:**
```bash
docker-compose exec app php artisan queue:clear redis --queue=notifications
```

### Memory Issues

The queue worker restarts every hour (`--max-time=3600`) to prevent memory leaks.

To restart more frequently:
```yaml
command: php artisan queue:work redis --queue=notifications --sleep=3 --tries=3 --max-time=1800
```

Or limit jobs processed:
```yaml
command: php artisan queue:work redis --queue=notifications --sleep=3 --tries=3 --max-jobs=1000
```

### Failed Jobs

**View failed jobs:**
```bash
docker-compose exec app php artisan queue:failed
```

**Retry all failed jobs:**
```bash
docker-compose exec app php artisan queue:retry all
```

**Retry specific job:**
```bash
docker-compose exec app php artisan queue:retry <job-id>
```

**Delete failed jobs:**
```bash
docker-compose exec app php artisan queue:flush
```

## Configuration

### Queue Worker Options

Edit the `command` in `compose.yaml`:

```yaml
command: php artisan queue:work redis --queue=notifications [OPTIONS]
```

**Available options:**

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--sleep` | Seconds to wait between jobs | 3 | `--sleep=5` |
| `--tries` | Max retry attempts | 3 | `--tries=5` |
| `--max-time` | Max seconds before restart | 3600 | `--max-time=1800` |
| `--max-jobs` | Max jobs before restart | ∞ | `--max-jobs=1000` |
| `--timeout` | Max seconds per job | 60 | `--timeout=120` |
| `--memory` | Max memory (MB) | 128 | `--memory=256` |
| `--queue` | Queue name(s) | default | `--queue=notifications,emails` |

### Multiple Queues

Process multiple queues in priority order:

```yaml
command: php artisan queue:work redis --queue=high,notifications,default,low
```

Jobs in `high` queue will be processed before `notifications`, etc.

## Health Checks

The queue worker includes a health check that verifies the process is running:

```yaml
healthcheck:
    test: ["CMD-SHELL", "ps aux | grep -q '[q]ueue:work' || exit 1"]
    retries: 3
    timeout: 5s
    interval: 30s
```

**Check health status:**
```bash
docker-compose ps queue
```

If unhealthy, Docker will automatically restart the container.

## Environment Variables

The queue worker uses the same environment variables as the main app:

```env
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
REDIS_HOST=redis
REDIS_PORT=6379
QUEUE_CONNECTION=redis
```

## Best Practices

✅ **Monitor logs regularly** - Check for errors and failed jobs
✅ **Set appropriate timeouts** - Prevent jobs from running too long
✅ **Use max-time or max-jobs** - Prevent memory leaks
✅ **Retry failed jobs** - Use `--tries=3` for transient errors
✅ **Scale when needed** - Add more workers for high traffic
✅ **Separate queues** - Use different queues for different job types
✅ **Health checks** - Monitor worker health automatically

## Quick Commands Reference

```bash
# Start all services including queue worker
docker-compose up -d

# View queue worker logs
docker-compose logs -f queue

# Restart queue worker
docker-compose restart queue

# Check queue status
docker-compose exec app php artisan tinker --execute="echo Redis::llen('queues:notifications');"

# View failed jobs
docker-compose exec app php artisan queue:failed

# Retry failed jobs
docker-compose exec app php artisan queue:retry all

# Stop queue worker
docker-compose stop queue

# Scale to 3 workers
docker-compose up -d --scale queue=3
```

## Testing

### Test Notification Flow

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Create an item** (via web UI or API)

3. **Check queue worker logs:**
   ```bash
   docker-compose logs -f queue
   ```
   
   You should see:
   ```
   App\Notifications\ItemCreated .......................................................... RUNNING
   App\Notifications\ItemCreated ....................................................... 15.23ms DONE
   ```

4. **Verify notification in database:**
   ```bash
   docker-compose exec app php artisan tinker --execute="echo DB::table('notifications')->count();"
   ```

5. **Check in UI** - Notification bell should show the notification

## Comparison: Docker vs Manual

### With Docker (Current Setup)
✅ Queue worker starts automatically
✅ Auto-restarts on failure
✅ No need to run separate terminal
✅ Production-ready setup
✅ Easy to scale

### Manual (Development)
```bash
# Need to run in separate terminal
php artisan queue:work redis --queue=notifications
```

## Summary

The queue worker is now fully integrated into your Docker setup:

- **Automatic**: Starts with `docker-compose up`
- **Reliable**: Auto-restarts on failure
- **Monitored**: Health checks ensure it's running
- **Optimized**: Configured with best practices
- **Scalable**: Easy to add more workers

No manual intervention needed - notifications will be processed automatically! 🎉
