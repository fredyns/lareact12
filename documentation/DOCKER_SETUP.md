# Docker Setup Guide

This guide explains how to run the LaReact12 application using Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+
- At least 4GB of available RAM

## Services Included

The `docker-compose.yml` includes the following services:

1. **PHP Application** (port 8000)
   - Laravel application server
   - Runs on `http://localhost:8000`

2. **PostgreSQL** (port 5432)
   - Database server
   - Database: `lareact12`
   - User: `postgres`
   - Password: `postgres`

3. **Redis** (port 6379)
   - Cache and queue driver
   - Used for sessions, cache, and queues

4. **MinIO** (ports 9000, 9001)
   - S3-compatible object storage
   - API: `http://localhost:9000`
   - Console: `http://localhost:9001`
   - Access Key: `minioadmin`
   - Secret Key: `minioadmin123`

5. **Reverb** (port 8080)
   - Laravel's official WebSocket server for real-time features
   - WebSocket: `ws://localhost:8080`
   - Debug mode enabled for development

## Quick Start

### 1. Start All Services

```bash
docker-compose up -d
```

This will:
- Build the PHP image
- Start all containers
- Create volumes for data persistence
- Set up the network

### 2. Run Database Migrations

```bash
docker-compose exec app php artisan migrate
```

### 3. Seed Database (Optional)

```bash
docker-compose exec app php artisan db:seed
```

### 4. Access the Application

- **Application**: http://localhost:8000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)
- **Reverb WebSocket**: ws://localhost:8080

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f minio
docker-compose logs -f reverb
```

### Execute Commands in Container

```bash
# Run Artisan commands
docker-compose exec app php artisan tinker
docker-compose exec app php artisan queue:work
docker-compose exec app php artisan schedule:work

# Run npm commands
docker-compose exec app npm run build
docker-compose exec app npm run dev

# Access shell
docker-compose exec app sh
```

### Stop Services

```bash
# Stop all services (keep volumes)
docker-compose stop

# Stop and remove containers (keep volumes)
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
```

## Environment Configuration

The `.env` file is automatically configured for Docker. Key settings:

```env
DB_HOST=postgres          # Docker service name
DB_PORT=5432
DB_DATABASE=lareact12
DB_USERNAME=postgres
DB_PASSWORD=postgres

REDIS_HOST=redis          # Docker service name
REDIS_PORT=6379

MINIO_ENDPOINT=http://minio:9000
BROADCAST_DRIVER=reverb
REVERB_HOST=localhost
REVERB_PORT=8080
```

## Database Management

### Access PostgreSQL

```bash
docker-compose exec postgres psql -U postgres -d lareact12
```

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres lareact12 > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U postgres lareact12 < backup.sql
```

## MinIO Management

### Access MinIO Console

1. Open http://localhost:9001
2. Login with:
   - Access Key: `minioadmin`
   - Secret Key: `minioadmin123`

### Create Bucket

```bash
docker-compose exec minio mc mb minio/localhost
```

### List Buckets

```bash
docker-compose exec minio mc ls minio/
```

## Redis Management

### Access Redis CLI

```bash
docker-compose exec redis redis-cli
```

### Monitor Redis Commands

```bash
docker-compose exec redis redis-cli MONITOR
```

### Clear Cache

```bash
docker-compose exec redis redis-cli FLUSHALL
```

## Reverb WebSocket Server

### Check Status

```bash
curl http://localhost:9601/health
```

### View Metrics

```bash
curl http://localhost:9601/metrics
```

## Troubleshooting

### Port Already in Use

If a port is already in use, modify the port mapping in `docker-compose.yml`:

```yaml
ports:
  - '8001:8000'  # Change 8000 to 8001
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Redis Connection Error

```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### MinIO Connection Error

```bash
# Check MinIO is running
docker-compose ps minio

# View MinIO logs
docker-compose logs minio
```

### Reverb Connection Error

```bash
# Check Reverb is running
docker-compose ps reverb

# Check Reverb logs
docker-compose logs -f reverb

# Restart Reverb
docker-compose restart reverb
```

## Performance Optimization

### Increase Memory Limit

Edit `docker/php/local.ini`:

```ini
memory_limit = 1024M
```

### Enable OPcache

Add to `docker/php/local.ini`:

```ini
opcache.enable = 1
opcache.memory_consumption = 256
opcache.max_accelerated_files = 20000
opcache.validate_timestamps = 0
```

### Database Connection Pooling

For production, consider using PgBouncer:

```yaml
pgbouncer:
  image: pgbouncer/pgbouncer
  environment:
    DATABASES_HOST: postgres
    DATABASES_PORT: 5432
    DATABASES_USER: postgres
    DATABASES_PASSWORD: postgres
    DATABASES_DBNAME: lareact12
```

## Production Deployment

For production deployment:

1. Use a reverse proxy (Nginx)
2. Enable HTTPS with SSL certificates
3. Use environment-specific `.env` files
4. Set `APP_DEBUG=false`
5. Configure proper logging
6. Set up automated backups
7. Use managed database services
8. Configure CDN for static assets

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Laravel Docker Guide](https://laravel.com/docs/deployment)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [MinIO Documentation](https://docs.min.io/)
- [Laravel Reverb Documentation](https://laravel.com/docs/reverb)
