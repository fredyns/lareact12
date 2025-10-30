# Deployment Guide

## Overview

Complete guide for deploying the notification system to production.

---

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificate ready
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Incident response plan
- [ ] Documentation updated
- [ ] Performance targets verified

---

## Environment Setup

### 1. Production Environment Variables

```env
# .env (production)
APP_ENV=production
APP_DEBUG=false
APP_URL=https://example.com

# Database
DB_CONNECTION=mysql
DB_HOST=prod-db.example.com
DB_PORT=3306
DB_DATABASE=notifications_prod
DB_USERNAME=prod_user
DB_PASSWORD=secure-password

# Broadcasting
BROADCAST_DRIVER=reverb
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=lareact12
REVERB_APP_KEY=prod-app-key
REVERB_APP_SECRET=prod-app-secret
REVERB_HOST=reverb.example.com
REVERB_PORT=8080
REVERB_SCHEME=https

# Queue
QUEUE_CONNECTION=redis
REDIS_HOST=prod-redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=secure-password

# Mail
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=mg.example.com
MAILGUN_SECRET=prod-mailgun-key

# Cache
CACHE_STORE=redis

# Session
SESSION_DRIVER=cookie
SESSION_LIFETIME=120

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=info
```

### 2. Application Key

Generate application key:

```bash
php artisan key:generate
```

---

## Database Migration

### 1. Run Migrations

```bash
php artisan migrate --force
```

### 2. Seed Data (if needed)

```bash
php artisan db:seed --force
```

### 3. Verify Migrations

```bash
php artisan migrate:status
```

---

## Docker Deployment

### 1. Docker Compose Production

```yaml
version: '3.8'

services:
  app:
    image: your-registry/notification-app:latest
    container_name: notification-app
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
      - reverb
    networks:
      - notification-network
    restart: unless-stopped

  db:
    image: mysql:8.0
    container_name: notification-db
    environment:
      MYSQL_DATABASE: notifications_prod
      MYSQL_USER: prod_user
      MYSQL_PASSWORD: secure-password
      MYSQL_ROOT_PASSWORD: root-password
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - notification-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: notification-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - notification-network
    restart: unless-stopped

  reverb:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: notification-reverb
    environment:
      REVERB_APP_ID: 'lareact12'
      REVERB_APP_KEY: 'prod-app-key'
      REVERB_APP_SECRET: 'prod-app-secret'
      REVERB_HOST: 'reverb.example.com'
      REVERB_PORT: '8080'
      REVERB_SCHEME: 'https'
    ports:
      - "8080:8080"
    networks:
      - notification-network
    command: php artisan reverb:start --host=0.0.0.0 --port=8080
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: notification-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - notification-network
    restart: unless-stopped

volumes:
  db_data:
  redis_data:

networks:
  notification-network:
    driver: bridge
```

### 2. Nginx Configuration

```nginx
upstream app {
    server app:8000;
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    client_max_body_size 20M;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /reverb {
        proxy_pass http://reverb:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## Queue Workers

### 1. Start Queue Worker

```bash
php artisan queue:work --queue=notifications --tries=3 --timeout=90
```

### 2. Supervisor Configuration

```ini
[program:notification-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /app/artisan queue:work --queue=notifications --tries=3 --timeout=90
autostart=true
autorestart=true
numprocs=4
redirect_stderr=true
stdout_logfile=/var/log/notification-queue.log
```

### 3. Start Supervisor

```bash
supervisorctl reread
supervisorctl update
supervisorctl start notification-queue:*
```

---

## Broadcasting Setup

### 1. Reverb Configuration

```bash
# Start Reverb container
docker-compose up -d reverb

# Verify connection
docker-compose logs -f reverb
```

### 2. Test Broadcasting

```php
php artisan tinker
>>> broadcast(new \App\Events\NotificationCreated($notification, $userId))->toOthers();
```

---

## Monitoring & Logging

### 1. Application Logs

```bash
# View logs
tail -f storage/logs/laravel.log

# Search logs
grep "error" storage/logs/laravel.log
```

### 2. Queue Monitoring

```bash
# Check failed jobs
php artisan queue:failed

# Monitor queue
php artisan queue:monitor

# Start Horizon
php artisan horizon
```

### 3. Performance Monitoring

Set up monitoring tools:

- **New Relic**: Application performance
- **DataDog**: Infrastructure monitoring
- **Sentry**: Error tracking
- **Prometheus**: Metrics collection

---

## Backup Strategy

### 1. Database Backups

```bash
# Manual backup
mysqldump -u root -p notifications_prod > backup.sql

# Automated backup (cron)
0 2 * * * mysqldump -u root -p notifications_prod > /backups/db-$(date +\%Y\%m\%d).sql
```

### 2. File Backups

```bash
# Backup storage directory
tar -czf storage-backup.tar.gz storage/

# Backup configuration
tar -czf config-backup.tar.gz .env
```

### 3. Restore from Backup

```bash
# Restore database
mysql -u root -p notifications_prod < backup.sql

# Restore files
tar -xzf storage-backup.tar.gz
```

---

## SSL/TLS Certificate

### 1. Let's Encrypt with Certbot

```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx

# Generate certificate
certbot certonly --nginx -d example.com

# Auto-renewal
certbot renew --dry-run
```

### 2. Certificate Configuration

```nginx
ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

---

## Health Checks

### 1. Application Health

```php
// In routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
        'redis' => Redis::ping() ? 'connected' : 'disconnected',
    ]);
});
```

### 2. Monitor Health

```bash
# Check health endpoint
curl https://example.com/health

# Continuous monitoring
watch -n 5 'curl -s https://example.com/health | jq'
```

---

## Rollback Plan

### 1. Database Rollback

```bash
# Rollback last migration
php artisan migrate:rollback

# Rollback specific steps
php artisan migrate:rollback --steps=5
```

### 2. Application Rollback

```bash
# Revert to previous Docker image
docker-compose down
docker pull your-registry/notification-app:previous-tag
docker-compose up -d
```

### 3. Data Rollback

```bash
# Restore from backup
mysql -u root -p notifications_prod < backup.sql
```

---

## Performance Optimization

### 1. Enable Caching

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache
```

### 2. Optimize Autoloader

```bash
# Optimize Composer autoloader
composer install --optimize-autoloader --no-dev
```

### 3. Enable OPcache

```ini
# php.ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Code review completed
- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Environment variables set
- [ ] SSL certificate ready
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Documentation updated

### Deployment

- [ ] Pull latest code
- [ ] Install dependencies
- [ ] Run migrations
- [ ] Clear caches
- [ ] Restart queue workers
- [ ] Verify health checks
- [ ] Test critical flows
- [ ] Monitor logs

### Post-Deployment

- [ ] Verify all endpoints
- [ ] Check database
- [ ] Monitor performance
- [ ] Review logs
- [ ] Notify team
- [ ] Document changes
- [ ] Schedule follow-up

---

## Troubleshooting

### Queue Not Processing

```bash
# Check queue status
php artisan queue:failed

# Restart queue worker
supervisorctl restart notification-queue:*

# Check logs
tail -f /var/log/notification-queue.log
```

### Broadcasting Not Working

```bash
# Verify Reverb is running
docker ps | grep reverb

# Check Reverb logs
docker logs notification-reverb

# Test notification
docker-compose exec app php artisan test:notification
```

### Database Connection Issues

```bash
# Test database connection
php artisan tinker
>>> DB::connection()->getPdo()

# Check credentials
cat .env | grep DB_
```

---

## References

- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Docker Deployment](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
