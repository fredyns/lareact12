# Security Audit & Best Practices

## Overview

Comprehensive security guide for the notification system covering authentication, authorization, data protection, and best practices.

---

## Authentication

### 1. Sanctum Authentication

All API endpoints require Sanctum authentication:

```php
// In routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
});
```

### 2. Token Management

Generate tokens securely:

```php
// In AuthController
public function login(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($validated)) {
        return response()->json(['error' => 'Invalid credentials'], 401);
    }

    $user = Auth::user();
    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json(['token' => $token]);
}
```

### 3. Token Expiration

Implement token expiration:

```php
// In config/sanctum.php
'expiration' => 525600, // 1 year in minutes

// Or per token
$token = $user->createToken('api-token', ['*'], 
    now()->addHours(24)
);
```

---

## Authorization

### 1. Policy-Based Authorization

Create notification policy:

```php
namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

class NotificationPolicy
{
    public function view(User $user, Notification $notification): bool
    {
        return $user->id === $notification->notifiable_id;
    }

    public function update(User $user, Notification $notification): bool
    {
        return $user->id === $notification->notifiable_id;
    }

    public function delete(User $user, Notification $notification): bool
    {
        return $user->id === $notification->notifiable_id;
    }
}
```

### 2. Authorization in Controller

```php
public function markAsRead($notificationId)
{
    $notification = Notification::findOrFail($notificationId);
    
    // Check authorization
    $this->authorize('update', $notification);
    
    $notification->update(['read_at' => now()]);
    
    return response()->json(['success' => true]);
}
```

### 3. Middleware Authorization

```php
// In routes/api.php
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
});
```

---

## Data Protection

### 1. Input Validation

Validate all inputs:

```php
public function updatePreference(Request $request)
{
    $validated = $request->validate([
        'type' => 'required|string|in:item_created,item_updated',
        'channel' => 'required|string|in:in-app,email',
        'enabled' => 'required|boolean',
        'quiet_hours_start' => 'nullable|date_format:H:i',
        'quiet_hours_end' => 'nullable|date_format:H:i',
    ]);

    return $this->updatePreferenceLogic($validated);
}
```

### 2. Mass Assignment Protection

Protect against mass assignment:

```php
class Notification extends Model
{
    protected $fillable = ['type', 'data', 'read_at'];
    
    // Or use guarded
    protected $guarded = ['id', 'notifiable_id', 'notifiable_type'];
}
```

### 3. Encryption

Encrypt sensitive data:

```php
class Notification extends Model
{
    protected $casts = [
        'data' => 'encrypted:array',
    ];
}
```

---

## WebSocket Security

### 1. Private Channels

Use private channels for user-specific notifications:

```php
// In routes/channels.php
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
```

### 2. Channel Authorization

Verify user authorization:

```php
// In NotificationCreated event
public function broadcastOn(): array
{
    return [
        new PrivateChannel("user.{$this->userId}"),
    ];
}
```

### 3. Event Authorization

```php
// In echo.ts
const channel = echo.private(`user.${userId}`);

channel.listen('notification.created', (data) => {
    // Only authenticated users on their channel receive this
    console.log('New notification:', data);
});
```

---

## CSRF Protection

### 1. CSRF Middleware

Ensure CSRF middleware is enabled:

```php
// In app/Http/Middleware/VerifyCsrfToken.php
protected $except = [
    // Exclude broadcasting routes if needed
];
```

### 2. CSRF Token in Requests

Include CSRF token in API requests:

```tsx
const response = await fetch('/api/notifications/read-all', {
    method: 'PATCH',
    headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content,
        'Content-Type': 'application/json',
    },
});
```

---

## Rate Limiting

### 1. API Rate Limiting

```php
// In routes/api.php
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
});
```

### 2. Custom Rate Limiting

```php
// In RouteServiceProvider
RateLimiter::for('notifications', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});
```

### 3. Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1635350400
```

---

## Logging & Auditing

### 1. Audit Trail

Log preference changes:

```php
public function updatePreference(Request $request)
{
    $validated = $request->validate([...]);
    
    $preference = NotificationPreference::updateOrCreate(
        ['user_id' => auth()->id(), 'type' => $validated['type'], 'channel' => $validated['channel']],
        $validated
    );

    // Log change
    Log::info('Preference updated', [
        'user_id' => auth()->id(),
        'type' => $validated['type'],
        'channel' => $validated['channel'],
        'enabled' => $validated['enabled'],
    ]);

    return response()->json($preference);
}
```

### 2. Activity Logging

Use Laravel Activity Log package:

```php
activity()
    ->causedBy(auth()->user())
    ->performedOn($preference)
    ->withProperties(['enabled' => $preference->enabled])
    ->log('preference_updated');
```

### 3. Monitoring Logs

```bash
# Monitor logs in real-time
tail -f storage/logs/laravel.log

# Search for security events
grep -i "unauthorized\|failed\|error" storage/logs/laravel.log
```

---

## SQL Injection Prevention

### 1. Parameterized Queries

Always use parameterized queries:

```php
// Bad - vulnerable to SQL injection
$notifications = DB::select("SELECT * FROM notifications WHERE type = '$type'");

// Good - parameterized
$notifications = DB::select('SELECT * FROM notifications WHERE type = ?', [$type]);

// Good - using Eloquent
$notifications = Notification::where('type', $type)->get();
```

### 2. Eloquent ORM

Use Eloquent to prevent SQL injection:

```php
// Safe - Eloquent handles escaping
$notifications = Notification::where('type', $request->input('type'))
    ->where('user_id', auth()->id())
    ->get();
```

---

## XSS Prevention

### 1. Output Escaping

Escape output in React:

```tsx
// Good - React escapes by default
<h3>{notification.data.title}</h3>

// Bad - don't use dangerouslySetInnerHTML
<h3 dangerouslySetInnerHTML={{ __html: notification.data.title }} />
```

### 2. Content Security Policy

Set CSP headers:

```php
// In middleware
header('Content-Security-Policy: default-src \'self\'; script-src \'self\' \'unsafe-inline\'');
```

---

## Environment Variables

### 1. Secure Configuration

Never commit sensitive data:

```env
# .env (not in version control)
MAIL_MAILER=mailgun
MAILGUN_SECRET=your-secret-key
SOKETI_APP_SECRET=your-secret

# .env.example (safe to commit)
MAIL_MAILER=mailgun
MAILGUN_SECRET=your-secret-key-here
SOKETI_APP_SECRET=your-secret-here
```

### 2. Environment Validation

```php
// In AppServiceProvider
if (!env('MAILGUN_SECRET')) {
    throw new Exception('MAILGUN_SECRET is not configured');
}
```

---

## HTTPS & TLS

### 1. Force HTTPS

```php
// In AppServiceProvider
if ($this->app->environment('production')) {
    URL::forceScheme('https');
}
```

### 2. HSTS Header

```php
// In middleware
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
```

---

## Dependency Security

### 1. Keep Dependencies Updated

```bash
# Check for vulnerabilities
composer audit

# Update dependencies
composer update

# Update security patches only
composer update --no-dev
```

### 2. Composer Lock File

Always commit `composer.lock`:

```bash
git add composer.lock
git commit -m "Update dependencies"
```

---

## Security Checklist

- [ ] Sanctum authentication configured
- [ ] Authorization policies implemented
- [ ] Input validation on all endpoints
- [ ] Mass assignment protection enabled
- [ ] Private WebSocket channels used
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Audit logging implemented
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] Dependencies audited
- [ ] Security headers configured
- [ ] Error messages don't leak info
- [ ] Sensitive data not logged
- [ ] Database backups configured
- [ ] Incident response plan

---

## Common Vulnerabilities

### 1. Broken Authentication

**Risk:** Unauthorized access to notifications

**Prevention:**
- Use Sanctum authentication
- Implement token expiration
- Require strong passwords
- Enable 2FA

### 2. Broken Authorization

**Risk:** Users access other users' notifications

**Prevention:**
- Implement authorization policies
- Check user ownership
- Use private channels
- Validate all requests

### 3. Sensitive Data Exposure

**Risk:** Notification data exposed in logs

**Prevention:**
- Encrypt sensitive data
- Don't log sensitive info
- Use HTTPS
- Secure environment variables

### 4. SQL Injection

**Risk:** Database compromise

**Prevention:**
- Use parameterized queries
- Use Eloquent ORM
- Validate input
- Escape output

### 5. Cross-Site Scripting (XSS)

**Risk:** Malicious scripts in notifications

**Prevention:**
- Escape output
- Use Content Security Policy
- Validate input
- Sanitize user input

---

## Incident Response

### 1. Security Breach

If a security breach occurs:

1. **Identify** - Determine scope and impact
2. **Contain** - Stop the breach from spreading
3. **Eradicate** - Remove the threat
4. **Recover** - Restore systems
5. **Learn** - Implement preventive measures

### 2. Reporting

Report security issues to: `security@example.com`

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security](https://laravel.com/docs/security)
- [Sanctum Documentation](https://laravel.com/docs/sanctum)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
