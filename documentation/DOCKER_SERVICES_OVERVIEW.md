# Docker Services Overview

## Complete Architecture

Your Laravel application now runs with **9 Docker services** working together:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/WebSocket
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  web (Nginx) - Port 80                                          │
│  • Serves static files (CSS, JS, images)                        │
│  • Routes PHP requests to app:9000                              │
│  • Proxies WebSocket to reverb:8080                             │
└─────────────┬───────────────────────────────────────────────────┘
              │ FastCGI
              ↓
┌─────────────────────────────────────────────────────────────────┐
│  app (PHP-FPM) - Port 9000                                      │
│  • Executes Laravel PHP code                                    │
│  • Processes web requests                                       │
│  • Connects to database, Redis, MinIO                           │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ├─→ postgres:5432 (Database)
              ├─→ redis:6379 (Cache/Queue)
              └─→ minio:9000 (File Storage)

┌─────────────────────────────────────────────────────────────────┐
│  queue (PHP CLI)                                                │
│  • Processes queued jobs (notifications, emails)                │
│  • Runs: php artisan queue:work                                 │
│  • Connects to Redis for job queue                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  scheduler (PHP CLI)                                            │
│  • Runs scheduled tasks (cron jobs)                             │
│  • Runs: php artisan schedule:run every minute                  │
│  • Executes tasks like file cleanup, backups, reports           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  reverb (WebSocket Server) - Port 8080                          │
│  • Real-time notifications                                      │
│  • Broadcasting events                                          │
│  • Laravel's official WebSocket server                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  mailpit (Email Testing) - Ports 1025, 8025                     │
│  • Catches all outgoing emails                                  │
│  • Web UI for viewing emails                                    │
│  • SMTP server for development                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Service Details

### 1. 🌐 **web** (Nginx)
**Container:** `lareact12_web`
**Ports:** 80
**Purpose:** Web server and reverse proxy

**Responsibilities:**
- Serve static files (CSS, JS, images, fonts)
- Route HTTP requests
- Forward PHP requests to `app` service
- Proxy WebSocket connections to `reverb`
- SSL termination (in production)

**Technology:** Nginx Alpine

---

### 2. 🐘 **app** (PHP-FPM)
**Container:** `lareact12_app`
**Ports:** 9000 (internal)
**Purpose:** PHP application processor

**Responsibilities:**
- Execute Laravel PHP code
- Process web requests
- Handle API endpoints
- Connect to database and Redis
- Generate responses

**Technology:** PHP 8.3 Alpine + PHP-FPM

---

### 3. 📬 **queue** (Queue Worker)
**Container:** `lareact12_queue`
**Purpose:** Background job processor

**Responsibilities:**
- Process queued notifications
- Send emails asynchronously
- Handle file uploads
- Execute background tasks
- Retry failed jobs

**Command:** `php artisan queue:work redis --queue=notifications`

**Technology:** PHP 8.3 Alpine (CLI)

---

### 4. ⏰ **scheduler** (Task Scheduler)
**Container:** `lareact12_scheduler`
**Purpose:** Cron job runner

**Responsibilities:**
- Run scheduled tasks every minute
- Execute cleanup jobs (orphaned files)
- Send scheduled reports
- Database backups
- Cache updates

**Command:** `php artisan schedule:run` (every 60 seconds)

**Technology:** PHP 8.3 Alpine (CLI)

**Current Tasks:**
- 🧹 Clean orphaned files - Daily at 2:00 AM

---

### 5. 🗄️ **postgres** (Database)
**Container:** `lareact12_postgres`
**Ports:** 5432
**Purpose:** Primary database

**Responsibilities:**
- Store application data
- User accounts
- Items, notifications, permissions
- Transactional data

**Technology:** PostgreSQL 17 Alpine

**Storage:** `./storage/docker/pgsql`

---

### 6. 🔴 **redis** (Cache & Queue)
**Container:** `lareact12_redis`
**Ports:** 6379
**Purpose:** Cache and job queue

**Responsibilities:**
- Application cache
- Session storage
- Job queue (notifications)
- Rate limiting
- Real-time data

**Technology:** Redis Alpine

**Storage:** `./storage/docker/redis`

---

### 7. 📦 **minio** (Object Storage)
**Container:** `lareact12_minio`
**Ports:** 9000 (API), 8900 (Console)
**Purpose:** File storage (S3-compatible)

**Responsibilities:**
- Store uploaded files
- Store images
- Temporary file storage
- Organized folder structure
- File downloads

**Technology:** MinIO Latest

**Storage:** `./storage/docker/minio`

**Access:**
- Console: http://localhost:8900
- Credentials: minioadmin / minioadmin123

---

### 8. 📡 **reverb** (WebSocket Server)
**Container:** `lareact12_reverb`
**Ports:** 8080 (WebSocket)
**Purpose:** Real-time notifications

**Responsibilities:**
- WebSocket connections
- Broadcasting events
- Real-time notifications
- Private channel authorization
- Pusher protocol compatible

**Technology:** Laravel Reverb

---

### 9. 📧 **mailpit** (Email Testing)
**Container:** `lareact12_mailpit`
**Ports:** 1025 (SMTP), 8025 (Web UI)
**Purpose:** Email testing and debugging

**Responsibilities:**
- Catch all outgoing emails
- Display emails in web interface
- Test email templates
- Debug email delivery
- No emails sent to real addresses

**Technology:** Mailpit Latest

**Access:** http://localhost:8025

---

## Service Dependencies

```
app
├── postgres (database)
└── redis (cache)

queue
├── postgres (database)
└── redis (queue)

scheduler
├── postgres (database)
└── redis (cache)

web
└── app (PHP-FPM)
```

## Resource Usage

| Service | CPU | Memory | Disk |
|---------|-----|--------|------|
| **web** | Low | ~10MB | - |
| **app** | Medium | ~100MB | - |
| **queue** | Low | ~50MB | - |
| **scheduler** | Very Low | ~50MB | - |
| **postgres** | Medium | ~50MB | Persistent |
| **redis** | Low | ~20MB | Persistent |
| **minio** | Low | ~30MB | Persistent |
| **reverb** | Low | ~30MB | - |
| **mailpit** | Low | ~20MB | - |
| **TOTAL** | - | ~360MB | ~1GB+ |

## Port Mapping

| Service | Internal Port | External Port | Purpose |
|---------|---------------|---------------|---------|
| web | 80 | 80 | HTTP |
| app | 9000 | - | PHP-FPM (internal) |
| postgres | 5432 | 5432 | PostgreSQL |
| redis | 6379 | 6379 | Redis |
| minio | 9000 | 9000 | MinIO API |
| minio | 8900 | 8900 | MinIO Console |
| reverb | 8080 | 8080 | WebSocket |
| mailpit | 1025 | 1025 | SMTP |
| mailpit | 8025 | 8025 | Web UI |

## Data Persistence

### Persistent Volumes

```yaml
postgres:
    volumes:
        - './storage/docker/pgsql:/var/lib/postgresql/data'

redis:
    volumes:
        - './storage/docker/redis:/data'

minio:
    volumes:
        - './storage/docker/minio:/data'
```

### Shared Code Volume

All PHP services share the application code:

```yaml
volumes:
    - '.:/var/www/html'
```

This allows:
- ✅ Hot reload during development
- ✅ Code changes reflected immediately
- ✅ Same codebase across all services

## Health Checks

All services include health checks for monitoring:

| Service | Health Check | Interval |
|---------|-------------|----------|
| **postgres** | `pg_isready` | Default |
| **redis** | `redis-cli ping` | Default |
| **minio** | `mc ready local` | Default |
| **queue** | Process check | 30s |
| **scheduler** | Process check | 60s |

## Service Communication

### Internal Network

All services communicate via the `sail` network:

```yaml
networks:
    sail:
        driver: bridge
```

**Service names as hostnames:**
- `postgres` → postgres:5432
- `redis` → redis:6379
- `minio` → minio:9000
- `app` → app:9000
- `soketi` → soketi:6001

### Example: App connecting to database

```env
DB_HOST=postgres  # Not localhost!
DB_PORT=5432
```

## Startup Order

Docker Compose ensures services start in the correct order:

1. **postgres** (database first)
2. **redis** (cache/queue)
3. **minio** (file storage)
4. **soketi** (WebSocket)
5. **mailpit** (email)
6. **app** (after postgres & redis are healthy)
7. **queue** (after postgres & redis are healthy)
8. **scheduler** (after postgres & redis are healthy)
9. **web** (after app is ready)

## Quick Commands

### Start All Services
```bash
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f queue
docker-compose logs -f scheduler
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart app
docker-compose restart queue
docker-compose restart scheduler
```

### Stop All Services
```bash
docker-compose down
```

### Scale Services
```bash
# Run 3 queue workers
docker-compose up -d --scale queue=3

# Run 2 schedulers (not recommended)
docker-compose up -d --scale scheduler=2
```

## Production Considerations

### Security
- [ ] Change default passwords (MinIO, PostgreSQL)
- [ ] Use environment-specific .env files
- [ ] Enable SSL/TLS for web service
- [ ] Restrict port exposure
- [ ] Use secrets management

### Performance
- [ ] Increase PHP-FPM workers
- [ ] Optimize PostgreSQL configuration
- [ ] Configure Redis persistence
- [ ] Set up CDN for static files
- [ ] Enable OPcache

### Monitoring
- [ ] Add logging aggregation
- [ ] Set up health check endpoints
- [ ] Configure alerts for failures
- [ ] Monitor resource usage
- [ ] Track queue metrics

### Backup
- [ ] Automated database backups
- [ ] MinIO data backups
- [ ] Redis snapshots
- [ ] Configuration backups

## Summary

Your Docker architecture provides:

✅ **Complete separation of concerns**
- Web serving (Nginx)
- Application processing (PHP-FPM)
- Background jobs (Queue)
- Scheduled tasks (Scheduler)

✅ **Scalability**
- Can scale queue workers independently
- Can add more app instances
- Load balancing ready

✅ **Reliability**
- Health checks on all services
- Auto-restart on failure
- Persistent data storage

✅ **Development-friendly**
- Hot reload for code changes
- Easy to start/stop
- Consistent across environments

✅ **Production-ready**
- Industry-standard architecture
- Well-tested components
- Easy to deploy

This is a **modern, scalable, production-ready** Docker setup for Laravel applications! 🚀
