# Docker Production Deployment Guide

This guide covers deploying the LaReact12 application to production using Docker Compose.

## Pre-Deployment Checklist

- [ ] SSL certificates obtained (Let's Encrypt recommended)
- [ ] Domain name configured
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Log aggregation configured
- [ ] CDN configured (optional)
- [ ] Email service configured
- [ ] Backup strategy in place

## Environment Setup

### 1. Create Production Environment File

Create `.env.production`:

```bash
cp .env.example .env.production
```

Update with production values:

```env
APP_NAME=LaReact12
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_PASSWORD=<strong-random-password>
REDIS_PASSWORD=<strong-random-password>

MINIO_ROOT_USER=<strong-username>
MINIO_ROOT_PASSWORD=<strong-random-password>

PUSHER_APP_ID=1
PUSHER_APP_KEY=<random-key>
PUSHER_APP_SECRET=<random-secret>

# Email configuration
MAIL_MAILER=mailgun
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=<your-mailgun-username>
MAIL_PASSWORD=<your-mailgun-password>
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="LaReact12"

# Sentry (error tracking)
SENTRY_LARAVEL_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 2. Generate Strong Passwords

```bash
# Generate random passwords
openssl rand -base64 32  # Database password
openssl rand -base64 32  # Redis password
openssl rand -base64 32  # MinIO password
openssl rand -base64 32  # Pusher key
openssl rand -base64 32  # Pusher secret
```

### 3. SSL Certificate Setup

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to docker directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/key.pem

# Set permissions
sudo chown 1000:1000 docker/nginx/ssl/*
chmod 600 docker/nginx/ssl/*
```

### 4. Create Docker Secrets (Optional but Recommended)

```bash
echo "your-db-password" | docker secret create db_password -
echo "your-redis-password" | docker secret create redis_password -
echo "your-minio-password" | docker secret create minio_password -
```

## Deployment Steps

### 1. Pull Latest Code

```bash
git clone https://github.com/yourusername/lareact12.git
cd lareact12
git checkout main
```

### 2. Build Production Images

```bash
docker-compose -f docker-compose.prod.yml build --no-cache
```

### 3. Start Services

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Run Migrations

```bash
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
```

### 5. Seed Database (if needed)

```bash
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force
```

### 6. Generate Application Key

```bash
docker-compose -f docker-compose.prod.yml exec app php artisan key:generate
```

### 7. Optimize Application

```bash
# Cache configuration
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache

# Cache routes
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache

# Cache views
docker-compose -f docker-compose.prod.yml exec app php artisan view:cache

# Optimize autoloader
docker-compose -f docker-compose.prod.yml exec app composer install --optimize-autoloader --no-dev
```

### 8. Set Permissions

```bash
docker-compose -f docker-compose.prod.yml exec -u root app chown -R www-data:www-data /var/www
docker-compose -f docker-compose.prod.yml exec -u root app chmod -R 755 /var/www/storage
docker-compose -f docker-compose.prod.yml exec -u root app chmod -R 755 /var/www/bootstrap/cache
```

## Post-Deployment Verification

### 1. Check Service Health

```bash
# View all services
docker-compose -f docker-compose.prod.yml ps

# Check specific service
docker-compose -f docker-compose.prod.yml exec app curl http://localhost:8000/health
```

### 2. Verify Database Connection

```bash
docker-compose -f docker-compose.prod.yml exec app php artisan db:show
```

### 3. Test WebSocket Connection

```bash
curl http://localhost:9601/health
```

### 4. Check MinIO

```bash
curl http://localhost:9000/minio/health/live
```

### 5. View Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## Monitoring & Maintenance

### 1. Set Up Log Aggregation

```bash
# View logs from all services
docker-compose -f docker-compose.prod.yml logs -f

# Export logs to file
docker-compose -f docker-compose.prod.yml logs > logs.txt
```

### 2. Monitor Resource Usage

```bash
# Real-time stats
docker stats

# Specific container
docker stats lareact12-app
```

### 3. Database Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/lareact12"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker-compose -f docker-compose.prod.yml exec postgres pg_dump \
  -U postgres lareact12 | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### 4. SSL Certificate Renewal

```bash
# Renew certificate
sudo certbot renew --quiet

# Copy new certificate
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/key.pem

# Reload Nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### 5. Health Checks

```bash
#!/bin/bash
# Check all services are healthy

echo "Checking PostgreSQL..."
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

echo "Checking Redis..."
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

echo "Checking MinIO..."
curl -s http://localhost:9000/minio/health/live

echo "Checking Soketi..."
curl -s http://localhost:9601/health

echo "Checking Application..."
curl -s http://localhost:8000/health
```

## Scaling & Performance

### 1. Horizontal Scaling

For multiple app instances, use load balancing:

```yaml
# Add to docker-compose.prod.yml
app-1:
  # ... app config

app-2:
  # ... app config

app-3:
  # ... app config
```

### 2. Database Connection Pooling

Add PgBouncer for connection pooling:

```yaml
pgbouncer:
  image: pgbouncer/pgbouncer
  environment:
    DATABASES_HOST: postgres
    DATABASES_PORT: 5432
    DATABASES_USER: postgres
    DATABASES_PASSWORD: ${DB_PASSWORD}
```

### 3. Redis Clustering

For high availability:

```yaml
redis-cluster:
  image: redis:7-alpine
  command: redis-server --cluster-enabled yes
```

### 4. MinIO Distributed Setup

For production MinIO:

```yaml
minio-1:
  # ... minio config
minio-2:
  # ... minio config
minio-3:
  # ... minio config
minio-4:
  # ... minio config
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Docker Security

```bash
# Run containers with read-only filesystem
docker run --read-only ...

# Limit capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE ...

# Use user namespaces
docker run --userns-remap=default ...
```

### 3. Network Security

```yaml
# Use internal networks
networks:
  lareact12:
    internal: true
  external:
    internal: false
```

### 4. Secrets Management

```bash
# Use Docker secrets
docker secret create db_password -
docker secret create redis_password -

# Reference in compose file
secrets:
  db_password:
    external: true
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache app

# Restart
docker-compose -f docker-compose.prod.yml restart app
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# View PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs postgres

# Restart PostgreSQL
docker-compose -f docker-compose.prod.yml restart postgres
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Increase limits in docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 4G
```

### Disk Space Issues

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Remove old images
docker image prune -a --filter "until=720h"
```

## Rollback Procedure

```bash
# Save current version
git tag production-backup-$(date +%Y%m%d)

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump \
  -U postgres lareact12 > backup_before_rollback.sql

# Checkout previous version
git checkout <previous-tag>

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Run migrations if needed
docker-compose -f docker-compose.prod.yml exec app php artisan migrate:rollback
```

## Useful Commands

```bash
# View all running containers
docker-compose -f docker-compose.prod.yml ps

# Execute command in container
docker-compose -f docker-compose.prod.yml exec app php artisan tinker

# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop all services
docker-compose -f docker-compose.prod.yml stop

# Remove all containers
docker-compose -f docker-compose.prod.yml down

# Backup volumes
docker run --rm -v lareact12_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Additional Resources

- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Nginx Best Practices](https://nginx.org/en/docs/)
- [PostgreSQL Production Setup](https://www.postgresql.org/docs/current/runtime.html)
- [Redis Production Setup](https://redis.io/topics/admin)
- [Let's Encrypt](https://letsencrypt.org/)
