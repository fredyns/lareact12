# Docker Services: `app` vs `web`

## Overview

Your Docker setup uses a **two-tier architecture** separating the web server (Nginx) from the PHP application processor. This is a common and recommended pattern for Laravel applications.

## The Two Services

### 🐘 `app` Service - PHP-FPM Application Processor

**What it does:**
- Runs **PHP-FPM** (FastCGI Process Manager)
- Executes your **Laravel PHP code**
- Processes PHP requests sent from Nginx
- Handles database queries, business logic, and API responses

**Technology:**
- **Image**: Custom PHP 8.3 Alpine (built from `docker/php/Dockerfile`)
- **Process**: PHP-FPM listening on port 9000
- **Purpose**: Application processing only (no web serving)

**Configuration:**
```yaml
app:
    build:
        context: ./docker/php
        dockerfile: Dockerfile
    container_name: lareact12_app
    working_dir: /var/www/html
    volumes:
        - '.:/var/www/html'
    # No ports exposed - internal only
```

**What it does NOT do:**
- ❌ Does not serve HTTP requests directly
- ❌ Does not handle static files
- ❌ Does not listen on port 80/443
- ❌ Not accessible from outside Docker network

---

### 🌐 `web` Service - Nginx Web Server

**What it does:**
- Runs **Nginx** web server
- Serves **static files** (CSS, JS, images)
- Handles **HTTP requests** from browsers
- Forwards **PHP requests** to the `app` service
- Acts as a **reverse proxy** for WebSocket connections

**Technology:**
- **Image**: Official Nginx Alpine
- **Process**: Nginx listening on port 80
- **Purpose**: Web serving and request routing

**Configuration:**
```yaml
web:
    image: 'nginx:alpine'
    container_name: lareact12_web
    ports:
        - '${APP_PORT:-80}:80'  # Exposed to host
    volumes:
        - '.:/var/www/html'
        - './docker/nginx/conf.d:/etc/nginx/conf.d'
    depends_on:
        - app  # Requires app service
```

**What it does NOT do:**
- ❌ Does not execute PHP code
- ❌ Does not process Laravel logic
- ❌ Does not connect to database directly

---

## How They Work Together

### Request Flow

```
Browser Request
    ↓
[Port 80] → web (Nginx)
    ↓
    ├─→ Static files (.css, .js, .png)
    │   └─→ Served directly by Nginx
    │
    └─→ PHP files (.php)
        ↓
        [Port 9000] → app (PHP-FPM)
        ↓
        Execute Laravel code
        ↓
        Return response
        ↓
        web (Nginx)
        ↓
        Browser Response
```

### Example: Loading Homepage

1. **Browser** → `http://localhost/`
2. **Nginx (web)** receives request on port 80
3. **Nginx** checks if `/` is a static file → No
4. **Nginx** forwards to `index.php` via FastCGI
5. **PHP-FPM (app)** receives request on port 9000
6. **Laravel** processes the route, loads Inertia page
7. **PHP-FPM** returns HTML response
8. **Nginx** sends response to browser
9. **Browser** requests static assets (CSS, JS)
10. **Nginx** serves these directly (no PHP processing)

---

## Nginx Configuration

The `web` service uses this configuration to communicate with `app`:

**File: `docker/nginx/conf.d/app.conf`**

```nginx
# Define upstream (PHP-FPM app service)
upstream app {
    server app:9000;  # Points to app container on port 9000
}

server {
    listen 80;
    root /var/www/html/public;
    
    # Static files - served directly by Nginx
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # PHP files - forwarded to app service
    location ~ \.php$ {
        fastcgi_pass app;  # Send to app:9000
        fastcgi_index index.php;
        include fastcgi_params;
    }
    
    # Laravel routes - try file, then index.php
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
}
```

---

## Why This Architecture?

### ✅ Advantages

1. **Separation of Concerns**
   - Nginx does what it's best at: serving static files and routing
   - PHP-FPM does what it's best at: executing PHP code

2. **Performance**
   - Nginx is extremely fast at serving static files
   - PHP-FPM can be scaled independently
   - Static files don't consume PHP resources

3. **Scalability**
   - Can run multiple `app` containers behind one `web` container
   - Load balancing across multiple PHP-FPM instances
   - Example:
     ```bash
     docker-compose up -d --scale app=3
     ```

4. **Security**
   - PHP-FPM not directly exposed to internet
   - Nginx acts as a protective layer
   - Can add rate limiting, WAF, etc. at Nginx level

5. **Resource Efficiency**
   - Nginx uses minimal memory
   - PHP-FPM only runs when needed
   - Better resource allocation

6. **Standard Practice**
   - Industry-standard architecture
   - Well-documented and tested
   - Easy to deploy to production

---

## Service Comparison

| Feature | `app` (PHP-FPM) | `web` (Nginx) |
|---------|----------------|---------------|
| **Technology** | PHP 8.3 Alpine | Nginx Alpine |
| **Primary Role** | Execute PHP code | Serve HTTP requests |
| **Listens On** | Port 9000 (internal) | Port 80 (public) |
| **Exposed to Host** | ❌ No | ✅ Yes |
| **Serves Static Files** | ❌ No | ✅ Yes |
| **Executes PHP** | ✅ Yes | ❌ No |
| **Database Access** | ✅ Yes | ❌ No |
| **Redis Access** | ✅ Yes | ❌ No |
| **Can Scale** | ✅ Yes (multiple instances) | Usually 1 instance |
| **Memory Usage** | Higher (PHP runtime) | Lower (just routing) |

---

## All Three PHP Services

Your setup actually has **3 services** running PHP:

### 1. `app` - Main Application
```yaml
app:
    # Runs PHP-FPM for web requests
    # No specific command (default: php-fpm)
```

### 2. `queue` - Queue Worker
```yaml
queue:
    # Same image as app
    # Different command
    command: php artisan queue:work redis --queue=notifications
```

### 3. `web` - Nginx (No PHP)
```yaml
web:
    # Only Nginx, no PHP
    # Forwards PHP requests to app:9000
```

**Why separate `app` and `queue`?**
- Different processes (PHP-FPM vs CLI)
- Different resource needs
- Queue worker runs continuously
- App processes requests on-demand
- Can scale independently

---

## Common Commands

### Execute Commands in `app` Service

```bash
# Artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan cache:clear

# Composer
docker-compose exec app composer install

# NPM
docker-compose exec app npm install
docker-compose exec app npm run build

# Tinker
docker-compose exec app php artisan tinker

# Shell access
docker-compose exec app sh
```

### Execute Commands in `web` Service

```bash
# View Nginx logs
docker-compose logs -f web

# Test Nginx config
docker-compose exec web nginx -t

# Reload Nginx
docker-compose exec web nginx -s reload

# Shell access
docker-compose exec web sh
```

---

## Troubleshooting

### "502 Bad Gateway" Error

**Cause:** Nginx can't connect to PHP-FPM

**Check:**
```bash
# Is app service running?
docker-compose ps app

# Check app logs
docker-compose logs app

# Test connection from web to app
docker-compose exec web ping app
```

**Fix:**
```bash
# Restart app service
docker-compose restart app
```

### Static Files Not Loading

**Cause:** Nginx can't find files or wrong permissions

**Check:**
```bash
# Check if files exist
docker-compose exec web ls -la /var/www/html/public

# Check Nginx config
docker-compose exec web nginx -t

# View Nginx error log
docker-compose logs web
```

**Fix:**
```bash
# Fix permissions
docker-compose exec app chmod -R 755 public

# Rebuild assets
docker-compose exec app npm run build
```

### PHP Changes Not Reflecting

**Cause:** PHP-FPM cache or OPcache

**Fix:**
```bash
# Restart PHP-FPM
docker-compose restart app

# Clear Laravel cache
docker-compose exec app php artisan optimize:clear
```

---

## Performance Tuning

### Nginx (web)

**File: `docker/nginx/nginx.conf`**
```nginx
worker_processes auto;
worker_connections 1024;

# Enable gzip compression
gzip on;
gzip_types text/css application/javascript;

# Client body size (file uploads)
client_max_body_size 100M;
```

### PHP-FPM (app)

**File: `docker/php/local.ini`**
```ini
; Process manager
pm.max_children = 10
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3

; Memory
memory_limit = 512M
upload_max_filesize = 100M
post_max_size = 100M
```

---

## Summary

### `app` Service (PHP-FPM)
- 🐘 **Executes PHP code**
- 💾 **Connects to database and Redis**
- 🔒 **Internal only** (not exposed to host)
- ⚙️ **Processes Laravel logic**

### `web` Service (Nginx)
- 🌐 **Serves HTTP requests**
- 📁 **Serves static files**
- 🔀 **Routes PHP requests to app**
- 🌍 **Public-facing** (exposed on port 80)

### Together
- **web** receives requests → routes to **app** → **app** processes → returns to **web** → **web** sends to browser
- Standard, scalable, production-ready architecture
- Best practice for Laravel applications

---

## Visual Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP Request
                  ↓
┌─────────────────────────────────────────────────────┐
│  web (Nginx) - Port 80                              │
│  ┌──────────────────────────────────────────────┐   │
│  │ Static files? → Serve directly               │   │
│  │ PHP file?     → Forward to app:9000          │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────┘
                  │ FastCGI
                  ↓
┌─────────────────────────────────────────────────────┐
│  app (PHP-FPM) - Port 9000                          │
│  ┌──────────────────────────────────────────────┐   │
│  │ Execute Laravel code                         │   │
│  │ Query database (postgres:5432)               │   │
│  │ Access Redis (redis:6379)                    │   │
│  │ Return response                              │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

This architecture is the foundation of your Docker setup and enables efficient, scalable Laravel application deployment! 🚀
