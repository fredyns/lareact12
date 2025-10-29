# Docker Scheduler Setup

## Overview

A dedicated **scheduler service** has been added to the Docker Compose configuration to automatically run Laravel's scheduled tasks (cron jobs) in the background.

## What Was Added

### New Service: `scheduler`

```yaml
scheduler:
    build:
        context: ./docker/php
        dockerfile: Dockerfile
    container_name: lareact12_scheduler
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
    command: sh -c "while true; do php artisan schedule:run --verbose --no-interaction & sleep 60; done"
    restart: unless-stopped
    healthcheck:
        test: ["CMD-SHELL", "ps aux | grep -q '[p]hp' || exit 1"]
        retries: 3
        timeout: 5s
        interval: 60s
```

## How It Works

### Laravel Scheduler

Laravel's scheduler allows you to define scheduled tasks in code instead of creating multiple cron entries.

**File: `bootstrap/app.php`**
```php
->withSchedule(function (Schedule $schedule) {
    // Clean up orphaned temporary files older than 1 day
    // Runs daily at 2:00 AM
    $schedule->command('files:cleanup-orphaned --days=1')
        ->dailyAt('02:00')
        ->onSuccess(function () {
            \Log::info('Orphaned files cleanup completed successfully');
        })
        ->onFailure(function () {
            \Log::error('Orphaned files cleanup failed');
        });
})
```

### Docker Scheduler Service

The scheduler service runs `php artisan schedule:run` every minute, which checks if any scheduled tasks are due to run.

**Command breakdown:**
```bash
while true; do 
    php artisan schedule:run --verbose --no-interaction & 
    sleep 60; 
done
```

- `while true` - Infinite loop
- `php artisan schedule:run` - Check and run due tasks
- `--verbose` - Show output for debugging
- `--no-interaction` - Don't ask for user input
- `&` - Run in background
- `sleep 60` - Wait 60 seconds before next check

## Current Scheduled Jobs

### 1. Orphaned Files Cleanup

**Schedule:** Daily at 2:00 AM
**Command:** `files:cleanup-orphaned --days=1`
**Purpose:** Delete temporary uploaded files older than 1 day

**Details:**
- Scans `tmp/` directory in MinIO
- Deletes files older than specified days
- Removes empty directories
- Logs success/failure

## Features

✅ **Auto-start**: Starts automatically with `docker-compose up`
✅ **Auto-restart**: Restarts if it crashes
✅ **Health checks**: Monitors if scheduler is running
✅ **Verbose logging**: Shows when tasks run
✅ **Same environment**: Uses same database and Redis connections
✅ **No cron needed**: No need to configure system cron

## Usage

### Start All Services (Including Scheduler)

```bash
docker-compose up -d
```

### Check Scheduler Status

```bash
# View scheduler logs
docker-compose logs -f scheduler

# Check if running
docker-compose ps scheduler

# View last 50 lines
docker-compose logs --tail=50 scheduler
```

### Test Scheduled Tasks

```bash
# Run scheduler manually (test)
docker-compose exec scheduler php artisan schedule:run

# List all scheduled tasks
docker-compose exec scheduler php artisan schedule:list

# Run specific task manually
docker-compose exec app php artisan files:cleanup-orphaned --days=1
```

### Restart Scheduler

After modifying scheduled tasks in `bootstrap/app.php`:

```bash
# Restart scheduler service
docker-compose restart scheduler
```

## Adding New Scheduled Tasks

### 1. Define Schedule in `bootstrap/app.php`

```php
->withSchedule(function (Schedule $schedule) {
    // Existing: Clean up orphaned files
    $schedule->command('files:cleanup-orphaned --days=1')
        ->dailyAt('02:00');
    
    // NEW: Send daily reports
    $schedule->command('reports:send-daily')
        ->dailyAt('08:00');
    
    // NEW: Clean old notifications
    $schedule->command('notifications:cleanup')
        ->weekly()
        ->sundays()
        ->at('03:00');
    
    // NEW: Backup database
    $schedule->command('backup:run')
        ->daily()
        ->at('01:00');
    
    // NEW: Process pending tasks
    $schedule->command('tasks:process')
        ->everyFiveMinutes();
    
    // NEW: Update cache
    $schedule->call(function () {
        Cache::put('stats', User::count(), now()->addHour());
    })->hourly();
})
```

### 2. Restart Scheduler

```bash
docker-compose restart scheduler
```

### 3. Verify

```bash
# List all scheduled tasks
docker-compose exec scheduler php artisan schedule:list

# Watch logs
docker-compose logs -f scheduler
```

## Schedule Frequency Options

Laravel provides many scheduling frequencies:

```php
// Time-based
->everyMinute()
->everyTwoMinutes()
->everyFiveMinutes()
->everyTenMinutes()
->everyFifteenMinutes()
->everyThirtyMinutes()
->hourly()
->hourlyAt(17)                    // Run at 17 minutes past every hour
->everyTwoHours()
->everyThreeHours()
->everyFourHours()
->everySixHours()
->daily()
->dailyAt('13:00')
->twiceDaily(1, 13)               // Run at 1:00 and 13:00
->weekly()
->weeklyOn(1, '8:00')             // Monday at 8:00
->monthly()
->monthlyOn(4, '15:00')           // 4th of month at 15:00
->quarterly()
->yearly()
->yearlyOn(6, 1, '17:00')         // June 1st at 17:00

// Day-based
->weekdays()
->weekends()
->mondays()
->tuesdays()
->wednesdays()
->thursdays()
->fridays()
->saturdays()
->sundays()

// Time ranges
->between('7:00', '22:00')
->unlessBetween('23:00', '4:00')

// Conditional
->when(fn () => true)
->skip(fn () => false)
```

## Monitoring

### View Scheduler Logs

```bash
# Real-time logs
docker-compose logs -f scheduler

# Last 100 lines
docker-compose logs --tail=100 scheduler

# Logs with timestamps
docker-compose logs -t scheduler

# Logs from last hour
docker-compose logs --since 1h scheduler
```

### Check Task Execution

```bash
# List all scheduled tasks with next run time
docker-compose exec scheduler php artisan schedule:list

# Test run (doesn't wait for schedule)
docker-compose exec scheduler php artisan schedule:run

# Check Laravel logs
docker-compose exec app tail -f storage/logs/laravel.log
```

### Health Check

The scheduler includes a health check that runs every 60 seconds:

```yaml
healthcheck:
    test: ["CMD-SHELL", "ps aux | grep -q '[p]hp' || exit 1"]
    retries: 3
    timeout: 5s
    interval: 60s
```

**Check health:**
```bash
docker-compose ps scheduler
```

## Troubleshooting

### Scheduler Not Running Tasks

**1. Check if scheduler service is running:**
```bash
docker-compose ps scheduler
```

**2. View logs for errors:**
```bash
docker-compose logs scheduler
```

**3. List scheduled tasks:**
```bash
docker-compose exec scheduler php artisan schedule:list
```

**4. Test run manually:**
```bash
docker-compose exec scheduler php artisan schedule:run
```

**5. Restart scheduler:**
```bash
docker-compose restart scheduler
```

### Task Not Executing at Expected Time

**Check task definition:**
```bash
docker-compose exec scheduler php artisan schedule:list
```

**Verify timezone:**
```bash
# Check app timezone
docker-compose exec app php artisan tinker --execute="echo config('app.timezone');"

# Check container time
docker-compose exec scheduler date
```

**Fix timezone in `.env`:**
```env
APP_TIMEZONE=Asia/Jakarta
```

### Task Failing Silently

**Add logging to task:**
```php
$schedule->command('your:command')
    ->dailyAt('02:00')
    ->onSuccess(function () {
        \Log::info('Task completed successfully');
    })
    ->onFailure(function () {
        \Log::error('Task failed');
    })
    ->sendOutputTo(storage_path('logs/scheduler.log'));
```

**Check logs:**
```bash
docker-compose exec app cat storage/logs/scheduler.log
docker-compose exec app tail -f storage/logs/laravel.log
```

### Memory Issues

**Increase PHP memory limit:**

**File: `docker/php/local.ini`**
```ini
memory_limit = 512M
```

**Rebuild container:**
```bash
docker-compose build scheduler
docker-compose up -d scheduler
```

## Comparison: Docker vs Cron

### Traditional Cron (Server)
```bash
# Add to crontab
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

❌ Requires server access
❌ Manual configuration
❌ Different per environment
❌ Hard to version control

### Docker Scheduler (Current)
```yaml
scheduler:
    command: sh -c "while true; do php artisan schedule:run & sleep 60; done"
```

✅ Automatic with docker-compose up
✅ No server configuration
✅ Same across all environments
✅ Version controlled
✅ Easy to monitor

## Performance

### Resource Usage

The scheduler service is very lightweight:
- **CPU**: Minimal (only runs every minute)
- **Memory**: ~50-100MB (same as app service)
- **Disk**: None (shares volumes)

### Optimization

**1. Prevent overlapping:**
```php
$schedule->command('long:task')
    ->hourly()
    ->withoutOverlapping();
```

**2. Run in background:**
```php
$schedule->command('heavy:task')
    ->daily()
    ->runInBackground();
```

**3. Limit execution time:**
```php
$schedule->command('risky:task')
    ->daily()
    ->withoutOverlapping()
    ->maxTime(300); // 5 minutes max
```

## Example Scheduled Tasks

### Database Backup
```php
$schedule->command('backup:database')
    ->daily()
    ->at('01:00')
    ->onSuccess(function () {
        \Log::info('Database backup completed');
    });
```

### Send Email Reports
```php
$schedule->command('reports:send-weekly')
    ->weekly()
    ->mondays()
    ->at('09:00')
    ->emailOutputOnFailure('admin@example.com');
```

### Clean Old Records
```php
$schedule->call(function () {
    DB::table('notifications')
        ->where('read_at', '<', now()->subDays(30))
        ->delete();
})->daily();
```

### Update Statistics
```php
$schedule->call(function () {
    Cache::put('user_count', User::count(), now()->addHour());
    Cache::put('item_count', Item::count(), now()->addHour());
})->everyFifteenMinutes();
```

### Process Queue (Alternative to queue worker)
```php
$schedule->command('queue:work --stop-when-empty')
    ->everyMinute()
    ->withoutOverlapping();
```

## Best Practices

✅ **Use descriptive names** - Easy to identify in logs
✅ **Add logging** - Track success/failure
✅ **Prevent overlapping** - Use `withoutOverlapping()`
✅ **Set timeouts** - Prevent hanging tasks
✅ **Test locally** - Use `schedule:run` to test
✅ **Monitor logs** - Check for failures regularly
✅ **Use queues for heavy tasks** - Don't block scheduler
✅ **Set appropriate frequencies** - Don't run too often

## Quick Commands Reference

```bash
# Start scheduler
docker-compose up -d scheduler

# View logs
docker-compose logs -f scheduler

# List scheduled tasks
docker-compose exec scheduler php artisan schedule:list

# Test run
docker-compose exec scheduler php artisan schedule:run

# Restart scheduler
docker-compose restart scheduler

# Check health
docker-compose ps scheduler

# View Laravel logs
docker-compose exec app tail -f storage/logs/laravel.log
```

## Summary

Your Docker setup now includes **automatic task scheduling**:

- **Automatic**: Starts with `docker-compose up`
- **Reliable**: Auto-restarts on failure
- **Monitored**: Health checks ensure it's running
- **Flexible**: Easy to add new scheduled tasks
- **Production-ready**: No cron configuration needed

**Current scheduled task:**
- 🧹 **Orphaned Files Cleanup** - Daily at 2:00 AM

Just run `docker-compose up -d` and your scheduled tasks will run automatically! ⏰
