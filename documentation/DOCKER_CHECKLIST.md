# Docker Setup Checklist

## Pre-Setup

- [ ] Docker Desktop installed and running
- [ ] Docker Compose v2.0+ installed
- [ ] At least 4GB RAM available
- [ ] Port 8000, 5432, 6379, 9000, 9001, 6001 are available
- [ ] Git repository cloned

## Initial Setup

- [ ] Review `DOCKER_SUMMARY.md`
- [ ] Review `DOCKER_SETUP.md`
- [ ] Review `DOCKER_QUICK_REFERENCE.md`
- [ ] Understand service architecture
- [ ] Understand port mappings

## Development Environment

### First Time Setup

```bash
# 1. Start services
- [ ] Run: docker-compose up -d
- [ ] Wait for all services to be healthy
- [ ] Verify: docker-compose ps (all running)

# 2. Database setup
- [ ] Run: docker-compose exec app php artisan migrate
- [ ] Run: docker-compose exec app php artisan db:seed (optional)
- [ ] Verify: docker-compose exec app php artisan db:show

# 3. Frontend setup
- [ ] Run: docker-compose exec app npm run build
- [ ] Verify: npm build completes without errors

# 4. Application access
- [ ] Open: http://localhost:8000
- [ ] Verify: Application loads
- [ ] Check: No console errors
```

### Daily Development

- [ ] Start services: `docker-compose up -d`
- [ ] Watch frontend: `docker-compose exec app npm run dev`
- [ ] Watch queue: `docker-compose exec app php artisan queue:work`
- [ ] Monitor logs: `docker-compose logs -f`
- [ ] Stop services: `docker-compose stop` (when done)

### Testing

- [ ] Run tests: `docker-compose exec app php artisan test`
- [ ] Check coverage: `docker-compose exec app php artisan test --coverage`
- [ ] Run linting: `docker-compose exec app ./vendor/bin/pint`
- [ ] Run static analysis: `docker-compose exec app ./vendor/bin/phpstan`

## Service Verification

### PostgreSQL

- [ ] Access: `docker-compose exec postgres psql -U postgres -d lareact12`
- [ ] Check tables: `\dt` (in psql)
- [ ] Exit: `\q`
- [ ] Verify migrations ran successfully
- [ ] Verify data seeded (if applicable)

### Redis

- [ ] Access: `docker-compose exec redis redis-cli`
- [ ] Ping: `ping` (should return PONG)
- [ ] Check keys: `KEYS *`
- [ ] Exit: `exit`

### MinIO

- [ ] Access console: http://localhost:9001
- [ ] Login: minioadmin / minioadmin123
- [ ] Verify bucket exists
- [ ] Upload test file
- [ ] Verify file appears in bucket

### Reverb

- [ ] Check running: `docker-compose ps reverb`
- [ ] Check logs: `docker-compose logs -f reverb`
- [ ] Should see: "Reverb server started"
- [ ] Check metrics: `curl http://localhost:9601/metrics`

## Development Workflow

### Code Changes

- [ ] Make code changes
- [ ] Frontend changes auto-reload (if npm run dev is running)
- [ ] Backend changes require restart: `docker-compose restart app`
- [ ] Database changes require migration: `docker-compose exec app php artisan migrate`

### Database Changes

- [ ] Create migration: `docker-compose exec app php artisan make:migration`
- [ ] Edit migration file
- [ ] Run migration: `docker-compose exec app php artisan migrate`
- [ ] Rollback if needed: `docker-compose exec app php artisan migrate:rollback`

### Debugging

- [ ] Use Tinker: `docker-compose exec app php artisan tinker`
- [ ] Check logs: `docker-compose logs -f app`
- [ ] Check database: `docker-compose exec app php artisan db:show`
- [ ] Check environment: `docker-compose exec app php artisan env`

## Production Preparation

### Pre-Deployment

- [ ] Review `DOCKER_PRODUCTION_DEPLOYMENT.md`
- [ ] Prepare environment variables
- [ ] Generate strong passwords
- [ ] Obtain SSL certificates
- [ ] Configure domain name
- [ ] Setup email service
- [ ] Setup error tracking (Sentry)
- [ ] Plan backup strategy

### SSL Certificate Setup

- [ ] Install Certbot: `sudo apt-get install certbot`
- [ ] Generate certificate: `sudo certbot certonly --standalone -d yourdomain.com`
- [ ] Copy to docker/nginx/ssl/: `cert.pem` and `key.pem`
- [ ] Set permissions: `chmod 600 docker/nginx/ssl/*`

### Environment Configuration

- [ ] Create `.env.production`
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Set strong `DB_PASSWORD`
- [ ] Set strong `REDIS_PASSWORD`
- [ ] Set strong `MINIO_ROOT_PASSWORD`
- [ ] Configure email settings
- [ ] Configure Sentry DSN
- [ ] Set `APP_URL` to production domain

### Build & Deploy

- [ ] Build production images: `docker-compose -f docker-compose.prod.yml build --no-cache`
- [ ] Start services: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Run migrations: `docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force`
- [ ] Cache configuration: `docker-compose -f docker-compose.prod.yml exec app php artisan config:cache`
- [ ] Cache routes: `docker-compose -f docker-compose.prod.yml exec app php artisan route:cache`
- [ ] Cache views: `docker-compose -f docker-compose.prod.yml exec app php artisan view:cache`

### Post-Deployment

- [ ] Verify all services running: `docker-compose -f docker-compose.prod.yml ps`
- [ ] Test application: Open https://yourdomain.com
- [ ] Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
- [ ] Test database: `docker-compose -f docker-compose.prod.yml exec app php artisan db:show`
- [ ] Test WebSocket: Check real-time features work
- [ ] Test file uploads: Upload file to MinIO
- [ ] Test email: Send test email
- [ ] Monitor resources: `docker stats`

## Monitoring & Maintenance

### Daily

- [ ] Check application logs
- [ ] Monitor resource usage
- [ ] Verify all services healthy
- [ ] Check disk space

### Weekly

- [ ] Review error logs
- [ ] Check database size
- [ ] Verify backups completed
- [ ] Update dependencies (if applicable)

### Monthly

- [ ] Review performance metrics
- [ ] Update SSL certificates (if needed)
- [ ] Optimize database
- [ ] Archive old logs
- [ ] Review security logs

### Quarterly

- [ ] Update Docker images
- [ ] Update PHP version (if needed)
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance review

## Troubleshooting

### Services Won't Start

- [ ] Check Docker is running: `docker ps`
- [ ] Check logs: `docker-compose logs`
- [ ] Check ports available: `lsof -i :8000`
- [ ] Rebuild images: `docker-compose build --no-cache`
- [ ] Restart Docker: Restart Docker Desktop

### Database Connection Error

- [ ] Check PostgreSQL running: `docker-compose ps postgres`
- [ ] Check logs: `docker-compose logs postgres`
- [ ] Verify credentials in .env
- [ ] Restart PostgreSQL: `docker-compose restart postgres`
- [ ] Check connection: `docker-compose exec app php artisan db:show`

### Redis Connection Error

- [ ] Check Redis running: `docker-compose ps redis`
- [ ] Test connection: `docker-compose exec redis redis-cli ping`
- [ ] Restart Redis: `docker-compose restart redis`
- [ ] Clear cache: `docker-compose exec redis redis-cli FLUSHALL`

### MinIO Connection Error

- [ ] Check MinIO running: `docker-compose ps minio`
- [ ] Test health: `curl http://localhost:9000/minio/health/live`
- [ ] Access console: http://localhost:9001
- [ ] Restart MinIO: `docker-compose restart minio`

### WebSocket Connection Error

- [ ] Check Reverb running: `docker-compose ps reverb`
- [ ] Check logs: `docker-compose logs -f reverb`
- [ ] Restart Reverb: `docker-compose restart reverb`
- [ ] Verify REVERB_* env variables are set

### Out of Memory

- [ ] Check memory: `docker stats`
- [ ] Increase memory limit in docker-compose.yml
- [ ] Restart services: `docker-compose restart`
- [ ] Clear cache: `docker-compose exec redis redis-cli FLUSHALL`

### Disk Space Issues

- [ ] Check disk: `df -h`
- [ ] Clean Docker: `docker system prune -a`
- [ ] Remove old images: `docker image prune -a`
- [ ] Check database size: `docker-compose exec postgres du -sh /var/lib/postgresql/data`

## Cleanup

### Stop Services

- [ ] Stop all: `docker-compose stop`
- [ ] Remove containers: `docker-compose down`
- [ ] Remove volumes: `docker-compose down -v`
- [ ] Remove images: `docker-compose down -v --rmi all`

### Backup Before Cleanup

- [ ] Backup database: `docker-compose exec postgres pg_dump -U postgres lareact12 > backup.sql`
- [ ] Backup MinIO: `docker run --rm -v lareact12_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_backup.tar.gz -C /data .`

## Documentation

- [ ] Read DOCKER_SUMMARY.md
- [ ] Read DOCKER_SETUP.md
- [ ] Read DOCKER_QUICK_REFERENCE.md
- [ ] Read DOCKER_PRODUCTION_DEPLOYMENT.md
- [ ] Bookmark useful commands
- [ ] Create team documentation

## Team Onboarding

- [ ] Share Docker setup documentation
- [ ] Run through setup with team
- [ ] Verify everyone can start services
- [ ] Verify everyone can run migrations
- [ ] Verify everyone can access application
- [ ] Create team troubleshooting guide
- [ ] Establish development standards

## Final Verification

- [ ] All services start successfully
- [ ] Application accessible
- [ ] Database working
- [ ] Redis working
- [ ] MinIO working
- [ ] WebSocket working
- [ ] Tests passing
- [ ] Linting passing
- [ ] Documentation complete
- [ ] Team trained

## Sign-Off

- [ ] Development environment ready: _____ (Date)
- [ ] Production environment ready: _____ (Date)
- [ ] Team trained: _____ (Date)
- [ ] Documentation complete: _____ (Date)

---

**Notes:**
- Keep this checklist updated as you discover new issues or improvements
- Share learnings with the team
- Update documentation as needed
- Review quarterly for improvements
