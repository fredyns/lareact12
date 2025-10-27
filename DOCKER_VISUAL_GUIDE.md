# Docker Visual Guide

Quick visual reference for Docker setup and commands.

## 🎯 Service Architecture

### Development Setup

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Computer                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Docker Compose Network                  │   │
│  │                  (lareact12)                         │   │
│  │                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │     PHP      │  │  PostgreSQL  │                │   │
│  │  │  :8000       │  │   :5432      │                │   │
│  │  │              │  │              │                │   │
│  │  │ • Laravel    │  │ • lareact12  │                │   │
│  │  │ • npm dev    │  │ • postgres   │                │   │
│  │  │ • artisan    │  │ • password   │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  │         ▲                  ▲                        │   │
│  │         │                  │                        │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │    Redis     │  │    MinIO     │                │   │
│  │  │   :6379      │  │  :9000/9001  │                │   │
│  │  │              │  │              │                │   │
│  │  │ • cache      │  │ • localhost  │                │   │
│  │  │ • queue      │  │ • minioadmin │                │   │
│  │  │ • sessions   │  │ • console    │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  │         ▲                  ▲                        │   │
│  │         │                  │                        │   │
│  │         └──────────┬───────┘                        │   │
│  │                    │                                │   │
│  │         ┌──────────▼──────────┐                    │   │
│  │         │      Soketi         │                    │   │
│  │         │  :6001 (WS)         │                    │   │
│  │         │  :9601 (Metrics)    │                    │   │
│  │         │                     │                    │   │
│  │         │ • Real-time events  │                    │   │
│  │         │ • WebSocket server  │                    │   │
│  │         └─────────────────────┘                    │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Browser Access                          │   │
│  │                                                       │   │
│  │  • http://localhost:8000     (Application)          │   │
│  │  • http://localhost:9001     (MinIO Console)        │   │
│  │  • http://localhost:9601/health (Soketi Health)    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Production Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Server                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Internet                            │   │
│  │         (HTTPS: yourdomain.com)                     │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │                                     │
│  ┌────────────────────▼────────────────────────────────┐   │
│  │              Nginx Reverse Proxy                     │   │
│  │         :80 (HTTP) → :443 (HTTPS)                  │   │
│  │                                                       │   │
│  │  • SSL/TLS Termination                              │   │
│  │  • Load Balancing                                   │   │
│  │  • Static File Serving                              │   │
│  │  • Security Headers                                 │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │                                     │
│  ┌────────────────────▼────────────────────────────────┐   │
│  │         Docker Compose Network (lareact12)          │   │
│  │                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │  PHP-FPM     │  │  PostgreSQL  │                │   │
│  │  │   :9000      │  │   :5432      │                │   │
│  │  │              │  │              │                │   │
│  │  │ • App Server │  │ • Database   │                │   │
│  │  │ • Optimized  │  │ • Persistent │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  │         ▲                  ▲                        │   │
│  │         │                  │                        │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │    Redis     │  │    MinIO     │                │   │
│  │  │   :6379      │  │  :9000/9001  │                │   │
│  │  │              │  │              │                │   │
│  │  │ • Cache      │  │ • Storage    │                │   │
│  │  │ • Queue      │  │ • Persistent │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  │         ▲                  ▲                        │   │
│  │         │                  │                        │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │Queue Worker  │  │  Scheduler   │                │   │
│  │  │              │  │              │                │   │
│  │  │ • Background │  │ • Cron Jobs  │                │   │
│  │  │   Jobs       │  │ • Tasks      │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  │         ▲                  ▲                        │   │
│  │         │                  │                        │   │
│  │         └──────────┬───────┘                        │   │
│  │                    │                                │   │
│  │         ┌──────────▼──────────┐                    │   │
│  │         │      Soketi         │                    │   │
│  │         │  :6001 (WS)         │                    │   │
│  │         │  :9601 (Metrics)    │                    │   │
│  │         │                     │                    │   │
│  │         │ • Real-time Events  │                    │   │
│  │         │ • WebSocket Server  │                    │   │
│  │         └─────────────────────┘                    │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Persistent Storage                         │   │
│  │                                                       │   │
│  │  • postgres_data (Database)                         │   │
│  │  • redis_data (Cache)                               │   │
│  │  • minio_data (Files)                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Command Flow Diagrams

### Development Workflow

```
START
  │
  ├─→ docker-compose up -d
  │      │
  │      ├─→ PostgreSQL starts
  │      ├─→ Redis starts
  │      ├─→ MinIO starts
  │      ├─→ Soketi starts
  │      └─→ PHP starts
  │
  ├─→ docker-compose exec app php artisan migrate
  │      │
  │      └─→ Database ready
  │
  ├─→ docker-compose exec app npm run dev
  │      │
  │      └─→ Frontend watching
  │
  ├─→ docker-compose exec app php artisan queue:work
  │      │
  │      └─→ Queue processing
  │
  ├─→ http://localhost:8000
  │      │
  │      └─→ Application running
  │
  └─→ docker-compose logs -f
         │
         └─→ Monitoring logs
```

### Production Deployment

```
PREPARATION
  │
  ├─→ .env.production setup
  │
  ├─→ SSL certificates
  │      │
  │      ├─→ cert.pem
  │      └─→ key.pem
  │
  └─→ docker/nginx/ssl/ ready

BUILD
  │
  ├─→ docker-compose -f docker-compose.prod.yml build --no-cache
  │      │
  │      ├─→ Build PHP image
  │      ├─→ Build Nginx image
  │      └─→ Push to registry (optional)
  │
  └─→ Images ready

DEPLOY
  │
  ├─→ docker-compose -f docker-compose.prod.yml up -d
  │      │
  │      ├─→ Start all services
  │      ├─→ Health checks pass
  │      └─→ Services running
  │
  ├─→ docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
  │      │
  │      └─→ Database migrated
  │
  ├─→ docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
  │      │
  │      ├─→ docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
  │      │
  │      └─→ docker-compose -f docker-compose.prod.yml exec app php artisan view:cache
  │
  └─→ https://yourdomain.com ready
```

## 🔄 Service Lifecycle

### Service Startup Order

```
1. PostgreSQL
   └─→ Health check: pg_isready
       └─→ Ready for connections

2. Redis
   └─→ Health check: redis-cli ping
       └─→ Ready for connections

3. MinIO
   └─→ Health check: /minio/health/live
       └─→ Ready for uploads

4. Soketi
   └─→ Health check: /health
       └─→ Ready for WebSocket

5. PHP Application
   └─→ Depends on all above
       └─→ Ready for requests
```

### Service Shutdown Order

```
1. PHP Application
   └─→ Graceful shutdown

2. Queue Worker (if running)
   └─→ Finish current jobs

3. Scheduler (if running)
   └─→ Stop scheduled tasks

4. Soketi
   └─→ Close WebSocket connections

5. MinIO
   └─→ Flush pending writes

6. Redis
   └─→ Save data

7. PostgreSQL
   └─→ Commit transactions
```

## 📈 Port Mapping

### Development Ports

```
Host Port    Container Port    Service              URL
─────────────────────────────────────────────────────────
8000    →    8000             PHP Application      http://localhost:8000
5432    →    5432             PostgreSQL           localhost:5432
6379    →    6379             Redis                localhost:6379
9000    →    9000             MinIO API            http://localhost:9000
9001    →    9001             MinIO Console        http://localhost:9001
6001    →    6001             Soketi WebSocket     ws://localhost:6001
9601    →    9601             Soketi Metrics       http://localhost:9601
```

### Production Ports

```
Host Port    Container Port    Service              URL
─────────────────────────────────────────────────────────
80      →    80               Nginx HTTP           http://yourdomain.com
443     →    443              Nginx HTTPS          https://yourdomain.com
9000    →    9000             MinIO API            (internal)
9001    →    9001             MinIO Console        (internal)
6001    →    6001             Soketi WebSocket     (internal)
9601    →    9601             Soketi Metrics       (internal)
```

## 🔐 Data Flow

### User Request Flow (Development)

```
Browser Request
    │
    ├─→ http://localhost:8000/api/items
    │
    ├─→ PHP Application
    │      │
    │      ├─→ Query PostgreSQL
    │      │      └─→ Get data
    │      │
    │      ├─→ Check Redis Cache
    │      │      └─→ Cache hit/miss
    │      │
    │      └─→ Return JSON Response
    │
    └─→ Browser Display
```

### File Upload Flow

```
User Selects File
    │
    ├─→ Browser Upload
    │      │
    │      ├─→ POST /upload/file
    │      │
    │      ├─→ PHP Validation
    │      │      └─→ Size, type check
    │      │
    │      ├─→ MinIO Upload
    │      │      └─→ Store in bucket
    │      │
    │      └─→ Return File Path
    │
    ├─→ Form Submission
    │      │
    │      ├─→ POST /items
    │      │
    │      ├─→ Create Item
    │      │      └─→ Save with file path
    │      │
    │      └─→ Redirect to Item
    │
    └─→ Display Item with File
```

### Real-time Event Flow

```
Event Triggered
    │
    ├─→ PHP Application
    │      │
    │      ├─→ Broadcast Event
    │      │      └─→ Laravel Echo
    │      │
    │      └─→ Send to Soketi
    │
    ├─→ Soketi WebSocket Server
    │      │
    │      ├─→ Receive Event
    │      │
    │      └─→ Broadcast to Clients
    │
    └─→ Browser JavaScript
           │
           ├─→ Receive Event
           │
           └─→ Update UI
```

## 📋 Health Check Status

### Development Health Checks

```
Service         Check Command                    Expected Response
────────────────────────────────────────────────────────────────
PostgreSQL      pg_isready -U postgres           accepting connections
Redis           redis-cli ping                   PONG
MinIO           curl http://localhost:9000/...   200 OK
Soketi          curl http://localhost:9601/...   {"ok":true}
PHP             curl http://localhost:8000       200 OK
```

### Production Health Checks

```
Service         Check Command                    Expected Response
────────────────────────────────────────────────────────────────
PostgreSQL      pg_isready -U postgres           accepting connections
Redis           redis-cli ping                   PONG
MinIO           curl http://minio:9000/...       200 OK
Soketi          curl http://soketi:9601/...      {"ok":true}
PHP-FPM         curl http://app:9000/ping        200 OK
Nginx           curl http://localhost:443        200 OK
```

## 🎯 Common Task Flows

### Adding a New Feature

```
1. Create Migration
   └─→ docker-compose exec app php artisan make:migration

2. Edit Migration
   └─→ Update migration file

3. Run Migration
   └─→ docker-compose exec app php artisan migrate

4. Create Model
   └─→ docker-compose exec app php artisan make:model

5. Create Controller
   └─→ docker-compose exec app php artisan make:controller

6. Update Frontend
   └─→ Edit React components

7. Test Changes
   └─→ docker-compose exec app npm run dev
   └─→ docker-compose exec app php artisan test

8. Commit & Push
   └─→ git add .
   └─→ git commit -m "Add feature"
   └─→ git push
```

### Deploying to Production

```
1. Prepare Environment
   └─→ Create .env.production
   └─→ Setup SSL certificates

2. Build Images
   └─→ docker-compose -f docker-compose.prod.yml build --no-cache

3. Start Services
   └─→ docker-compose -f docker-compose.prod.yml up -d

4. Run Migrations
   └─→ docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

5. Optimize
   └─→ Cache config, routes, views

6. Verify
   └─→ Check all services healthy
   └─→ Test application
   └─→ Monitor logs

7. Monitor
   └─→ Watch logs
   └─→ Check resource usage
   └─→ Verify backups
```

### Troubleshooting Issues

```
Service Won't Start
    │
    ├─→ Check logs
    │      └─→ docker-compose logs service-name
    │
    ├─→ Check health
    │      └─→ docker-compose ps
    │
    ├─→ Rebuild image
    │      └─→ docker-compose build --no-cache service-name
    │
    └─→ Restart service
           └─→ docker-compose restart service-name

Database Connection Error
    │
    ├─→ Check PostgreSQL running
    │      └─→ docker-compose ps postgres
    │
    ├─→ Verify credentials
    │      └─→ Check .env file
    │
    ├─→ Test connection
    │      └─→ docker-compose exec app php artisan db:show
    │
    └─→ Restart PostgreSQL
           └─→ docker-compose restart postgres

Memory Issues
    │
    ├─→ Check memory usage
    │      └─→ docker stats
    │
    ├─→ Increase limits
    │      └─→ Edit docker-compose.yml
    │
    └─→ Restart services
           └─→ docker-compose restart
```

## 🚀 Performance Optimization

### Development Optimization

```
Faster Builds
    ├─→ Use .dockerignore
    ├─→ Cache layers
    └─→ Parallel builds

Faster Execution
    ├─→ Use volume mounts
    ├─→ Enable hot reload
    └─→ Optimize queries

Better Debugging
    ├─→ Enable logging
    ├─→ Use Tinker
    └─→ Monitor resources
```

### Production Optimization

```
Performance
    ├─→ Enable OPcache
    ├─→ Use Redis cache
    ├─→ Optimize database
    └─→ Enable Gzip

Scalability
    ├─→ Multiple app instances
    ├─→ Load balancing
    ├─→ Database pooling
    └─→ CDN for static files

Reliability
    ├─→ Health checks
    ├─→ Auto-restart
    ├─→ Backups
    └─→ Monitoring
```

---

**Quick Reference**: Use this guide alongside the detailed documentation for visual understanding of Docker setup and workflows.
