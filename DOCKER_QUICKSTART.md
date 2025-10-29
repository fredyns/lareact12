# Docker Quick Start Guide

## Services Overview

Your Docker setup now includes **9 services**:

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| **app** | lareact12_app | - | PHP Laravel application |
| **queue** | lareact12_queue | - | Queue worker (notifications) |
| **scheduler** | lareact12_scheduler | - | Task scheduler (cron jobs) |
| **web** | lareact12_web | 80 | Nginx web server |
| **postgres** | lareact12_postgres | 5432 | PostgreSQL database |
| **redis** | lareact12_redis | 6379 | Redis cache/queue |
| **minio** | lareact12_minio | 9000, 8900 | MinIO object storage |
| **mailpit** | lareact12_mailpit | 1025, 8025 | Email testing |
| **soketi** | lareact12_soketi | 6001, 9601 | WebSocket server |

## Quick Start

### 1. Start All Services

```bash
docker-compose up -d
```

### 2. Install Dependencies

```bash
# PHP dependencies
docker-compose exec app composer install

# Node dependencies
docker-compose exec app npm install

# Build frontend assets
docker-compose exec app npm run build
```

### 3. Setup Database

```bash
# Run migrations
docker-compose exec app php artisan migrate

# Seed database
docker-compose exec app php artisan db:seed
```

### 4. Access Application

- **Application**: http://localhost
- **MinIO Console**: http://localhost:8900 (minioadmin / minioadmin123)
- **Mailpit Dashboard**: http://localhost:8025
- **Soketi Metrics**: http://localhost:9601

## Queue Worker (NEW!)

The **queue worker** now runs automatically in Docker! 🎉

### Check Queue Worker Status

```bash
# View logs
docker-compose logs -f queue

# Check if running
docker-compose ps queue
```

### Test Notifications

1. Create a new item in the application
2. Check queue worker logs:
   ```bash
   docker-compose logs -f queue
   ```
3. You should see notifications being processed!

## Common Commands

### Service Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart queue

# View logs
docker-compose logs -f queue
docker-compose logs -f app

# Check service status
docker-compose ps
```

### Application Commands

```bash
# Run artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed
docker-compose exec app php artisan cache:clear

# Run composer
docker-compose exec app composer install
docker-compose exec app composer update

# Run npm
docker-compose exec app npm install
docker-compose exec app npm run build
docker-compose exec app npm run dev
```

### Queue Management

```bash
# View queue worker logs
docker-compose logs -f queue

# Restart queue worker (after code changes)
docker-compose restart queue

# Check queue size
docker-compose exec app php artisan tinker --execute="echo Redis::llen('queues:notifications');"

# View failed jobs
docker-compose exec app php artisan queue:failed

# Retry failed jobs
docker-compose exec app php artisan queue:retry all
```

### Scheduler Management

```bash
# View scheduler logs
docker-compose logs -f scheduler

# List scheduled tasks
docker-compose exec scheduler php artisan schedule:list

# Test run scheduler
docker-compose exec scheduler php artisan schedule:run

# Restart scheduler (after code changes)
docker-compose restart scheduler
```

### Database Management

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U ${DB_USERNAME} -d ${DB_DATABASE}

# Run migrations
docker-compose exec app php artisan migrate

# Rollback migrations
docker-compose exec app php artisan migrate:rollback

# Fresh migration with seed
docker-compose exec app php artisan migrate:fresh --seed
```

### Redis Management

```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Check Redis keys
docker-compose exec redis redis-cli KEYS '*'

# Clear Redis cache
docker-compose exec app php artisan cache:clear
```

## Development Workflow

### Option 1: Docker Only (Recommended)

```bash
# Terminal 1: Start all services
docker-compose up -d

# Terminal 2: Watch frontend changes
docker-compose exec app npm run dev

# View logs
docker-compose logs -f app
docker-compose logs -f queue
```

### Option 2: Hybrid (Docker + Local)

```bash
# Start Docker services
docker-compose up -d

# Run Vite locally (faster hot reload)
npm run dev
```

## Troubleshooting

### Queue Worker Not Processing

```bash
# Check if running
docker-compose ps queue

# View logs
docker-compose logs queue

# Restart
docker-compose restart queue
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Redis Connection Issues

```bash
# Check if Redis is healthy
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping

# Restart
docker-compose restart redis
```

### Permission Issues

```bash
# Fix storage permissions
docker-compose exec app chmod -R 777 storage bootstrap/cache
```

### Clear All Caches

```bash
docker-compose exec app php artisan optimize:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan view:clear
docker-compose exec app php artisan route:clear
```

## Environment Variables

Make sure your `.env` file has these Docker-specific settings:

```env
# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=lareact12
DB_USERNAME=sail
DB_PASSWORD=password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Queue
QUEUE_CONNECTION=redis

# MinIO
MINIO_ENDPOINT=http://minio:9000
MINIO_KEY=minioadmin
MINIO_SECRET=minioadmin123
MINIO_BUCKET=localhost
MINIO_USE_PATH_STYLE_ENDPOINT=true

# Broadcasting (Soketi)
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=app-id
PUSHER_APP_KEY=app-key
PUSHER_APP_SECRET=app-secret
PUSHER_HOST=soketi
PUSHER_PORT=6001
PUSHER_SCHEME=http

# Mail (Mailpit)
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

## Health Checks

All services include health checks:

```bash
# Check all services health
docker-compose ps

# Healthy services show "healthy" status
# Unhealthy services will auto-restart
```

## Stopping Services

```bash
# Stop all services (keep data)
docker-compose down

# Stop and remove volumes (delete data)
docker-compose down -v

# Stop specific service
docker-compose stop queue
```

## Updating Code

After pulling new code:

```bash
# Restart services
docker-compose restart app queue

# Update dependencies
docker-compose exec app composer install
docker-compose exec app npm install

# Run migrations
docker-compose exec app php artisan migrate

# Rebuild frontend
docker-compose exec app npm run build

# Clear caches
docker-compose exec app php artisan optimize:clear
```

## Documentation

For more details, see:

- **[DOCKER_QUEUE_SETUP.md](documentation/DOCKER_QUEUE_SETUP.md)** - Queue worker configuration
- **[DOCKER_SCHEDULER_SETUP.md](documentation/DOCKER_SCHEDULER_SETUP.md)** - Task scheduler configuration
- **[DOCKER_APP_VS_WEB.md](documentation/DOCKER_APP_VS_WEB.md)** - Architecture explanation
- **[QUEUE_WORKER_SETUP.md](documentation/QUEUE_WORKER_SETUP.md)** - General queue worker guide
- **[README_DOCKER.md](documentation/README_DOCKER.md)** - Complete Docker documentation
- **[DOCKER_CHECKLIST.md](documentation/DOCKER_CHECKLIST.md)** - Deployment checklist

## Summary

Your Docker setup is now **production-ready** with:

✅ **9 services** running automatically
✅ **Queue worker** processing notifications
✅ **Task scheduler** running cron jobs
✅ **Health checks** monitoring all services
✅ **Auto-restart** on failures
✅ **Persistent data** in volumes
✅ **Easy scaling** with docker-compose

Just run `docker-compose up -d` and everything works! 🚀
