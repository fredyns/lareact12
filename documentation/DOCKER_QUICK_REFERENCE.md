# Docker Quick Reference

## Essential Commands

### Start & Stop

```bash
# Start all services in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Stop all services
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
```

### View Status & Logs

```bash
# Show running containers
docker-compose ps

# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f minio
docker-compose logs -f reverb

# View last 100 lines
docker-compose logs --tail=100 app

# View logs with timestamps
docker-compose logs -f --timestamps app
```

### Execute Commands

```bash
# Run Artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed
docker-compose exec app php artisan tinker
docker-compose exec app php artisan queue:work
docker-compose exec app php artisan schedule:work

# Run npm commands
docker-compose exec app npm run build
docker-compose exec app npm run dev
docker-compose exec app npm install

# Access shell
docker-compose exec app sh
docker-compose exec app bash

# Run as root
docker-compose exec -u root app sh
```

### Database Operations

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d lareact12

# Backup database
docker-compose exec postgres pg_dump -U postgres lareact12 > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres lareact12 < backup.sql

# Create new database
docker-compose exec postgres createdb -U postgres newdb

# Drop database
docker-compose exec postgres dropdb -U postgres olddb

# List databases
docker-compose exec postgres psql -U postgres -l
```

### Redis Operations

```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Ping Redis
docker-compose exec redis redis-cli ping

# Clear all cache
docker-compose exec redis redis-cli FLUSHALL

# Clear specific database
docker-compose exec redis redis-cli SELECT 0
docker-compose exec redis redis-cli FLUSHDB

# Monitor commands in real-time
docker-compose exec redis redis-cli MONITOR

# Get memory stats
docker-compose exec redis redis-cli INFO memory

# Get all keys
docker-compose exec redis redis-cli KEYS '*'
```

### MinIO Operations

```bash
# Access MinIO console
# URL: http://localhost:9001
# User: minioadmin
# Password: minioadmin123

# Create bucket
docker-compose exec minio mc mb minio/localhost

# List buckets
docker-compose exec minio mc ls minio/

# List files in bucket
docker-compose exec minio mc ls minio/localhost/

# Upload file
docker-compose exec minio mc cp /path/to/file minio/localhost/

# Remove file
docker-compose exec minio mc rm minio/localhost/filename

# Get file info
docker-compose exec minio mc stat minio/localhost/filename
```

### Soketi Operations

```bash
# Check health
curl http://localhost:9601/health

# View metrics
# View logs
docker-compose logs -f reverb

# Test WebSocket connection
wscat -c ws://localhost:8080
```

## Development Workflow

### Initial Setup

```bash
# 1. Start all services
docker-compose up -d

# 2. Wait for services to be healthy
docker-compose ps

# 3. Run migrations
docker-compose exec app php artisan migrate

# 4. Seed database (optional)
docker-compose exec app php artisan db:seed

# 5. Build frontend assets
docker-compose exec app npm run build

# 6. Access application
# http://localhost:8000
```

### Daily Development

```bash
# Start services
docker-compose up -d

# Watch for changes and rebuild
docker-compose exec app npm run dev

# In another terminal, watch queue
docker-compose exec app php artisan queue:work

# In another terminal, watch scheduler
docker-compose exec app php artisan schedule:work

# View logs
docker-compose logs -f
```

### Testing

```bash
# Run tests
docker-compose exec app php artisan test

# Run specific test
docker-compose exec app php artisan test tests/Feature/UserTest.php

# Run with coverage
docker-compose exec app php artisan test --coverage
```

### Debugging

```bash
# Access tinker
docker-compose exec app php artisan tinker

# Check environment
docker-compose exec app php artisan env

# Check config
docker-compose exec app php artisan config:show

# Check routes
docker-compose exec app php artisan route:list

# Check database connection
docker-compose exec app php artisan db:show
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8000
lsof -i :5432
lsof -i :6379

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
# ports:
#   - '8001:8000'
```

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Rebuild image
docker-compose build --no-cache app

# Restart service
docker-compose restart app
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check connection from app
docker-compose exec app php artisan db:show
```

### Redis Connection Error

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping

# Restart Redis
docker-compose restart redis
```

### MinIO Connection Error

```bash
# Check MinIO is running
docker-compose ps minio

# Check logs
docker-compose logs minio

# Test connection
curl http://localhost:9000/minio/health/live

# Restart MinIO
docker-compose restart minio
```

### Soketi Connection Error

```bash
# Check Reverb is running
docker-compose ps reverb

# Check logs
docker-compose logs -f reverb

# Restart Reverb
docker-compose restart reverb

# Test notification
docker-compose exec app php artisan test:notification
```

### Clear Everything and Start Fresh

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down -v --rmi all

# Start fresh
docker-compose up -d

# Run migrations
docker-compose exec app php artisan migrate
```

## Performance Tips

### Monitor Resource Usage

```bash
# View container stats
docker stats

# View specific container
docker stats lareact12-app
```

### Optimize Build

```bash
# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build app

# Build with progress
docker-compose build --progress=plain app
```

### Increase Limits

Edit `docker-compose.yml` for app service:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

## Useful Aliases

Add to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
# Docker Compose shortcuts
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
alias dcexec='docker-compose exec'

# Laravel shortcuts
alias artisan='docker-compose exec app php artisan'
alias tinker='docker-compose exec app php artisan tinker'
alias migrate='docker-compose exec app php artisan migrate'
alias seed='docker-compose exec app php artisan db:seed'
alias test='docker-compose exec app php artisan test'

# Node shortcuts
alias npm-build='docker-compose exec app npm run build'
alias npm-dev='docker-compose exec app npm run dev'

# Database shortcuts
alias psql='docker-compose exec postgres psql -U postgres -d lareact12'
alias redis='docker-compose exec redis redis-cli'
```

## Common Issues & Solutions

### Issue: "Cannot connect to Docker daemon"
**Solution:** Make sure Docker Desktop is running

### Issue: "Port 8000 is already allocated"
**Solution:** Change port in docker-compose.yml or kill process using port

### Issue: "Database is locked"
**Solution:** Restart PostgreSQL: `docker-compose restart postgres`

### Issue: "Redis connection refused"
**Solution:** Check Redis is running: `docker-compose ps redis`

### Issue: "MinIO bucket not found"
**Solution:** Create bucket: `docker-compose exec minio mc mb minio/localhost`

### Issue: "WebSocket connection failed"
**Solution:** Check Soketi health: `curl http://localhost:9601/health`

## Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Laravel Docker Guide](https://laravel.com/docs/deployment)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [MinIO Documentation](https://docs.min.io/)
- [Soketi Documentation](https://docs.soketi.app/)
