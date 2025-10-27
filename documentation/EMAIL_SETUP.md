# Email Notifications Setup Guide

## Overview

This guide explains how to configure email notifications using Mailgun or SendGrid.

## Prerequisites

- Active Mailgun or SendGrid account
- API credentials
- Domain verification (for Mailgun)

---

## Option 1: Mailgun Setup (Recommended)

### 1. Create Mailgun Account

1. Go to [mailgun.com](https://www.mailgun.com)
2. Sign up for free account
3. Verify your domain or use sandbox domain

### 2. Get API Credentials

1. Navigate to **Domains** section
2. Select your domain
3. Copy:
   - **Domain**: `mg.example.com`
   - **API Key**: Found under "API Keys"
   - **SMTP Password**: Found under "SMTP credentials"

### 3. Configure .env

```env
MAIL_MAILER=mailgun
MAIL_SCHEME=https
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@mg.example.com
MAIL_PASSWORD=your-mailgun-password
MAIL_FROM_ADDRESS=notifications@example.com
MAIL_FROM_NAME="Your App Name"

MAILGUN_DOMAIN=mg.example.com
MAILGUN_SECRET=your-mailgun-api-key
MAILGUN_ENDPOINT=api.mailgun.net
```

### 4. Test Email

```bash
php artisan tinker
>>> Mail::raw('Test email', function($message) {
    $message->to('your-email@example.com')->subject('Test');
});
```

---

## Option 2: SendGrid Setup

### 1. Create SendGrid Account

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for free account
3. Verify sender email

### 2. Get API Key

1. Navigate to **Settings** → **API Keys**
2. Create new API Key
3. Copy the key (you won't see it again)

### 3. Configure .env

```env
MAIL_MAILER=sendgrid
MAIL_FROM_ADDRESS=notifications@example.com
MAIL_FROM_NAME="Your App Name"

SENDGRID_API_KEY=your-sendgrid-api-key
```

### 4. Test Email

```bash
php artisan tinker
>>> Mail::raw('Test email', function($message) {
    $message->to('your-email@example.com')->subject('Test');
});
```

---

## Email Notification Preferences

Users can control email notifications through the preferences UI:

### Disable Email Notifications

```tsx
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

export function MyComponent() {
  const { updatePreference } = useNotificationPreferences();

  const handleDisableEmail = async () => {
    await updatePreference('item_created', 'email', false);
  };

  return <button onClick={handleDisableEmail}>Disable Email</button>;
}
```

### Set Quiet Hours

```tsx
const { updatePreference } = useNotificationPreferences();

// Disable emails between 22:00 and 08:00
await updatePreference(
  'item_created',
  'email',
  true,
  '22:00',
  '08:00'
);
```

---

## Notification Channels

Each notification type supports multiple channels:

- **in-app**: Database + WebSocket (real-time)
- **email**: Email delivery

### Example: Item Created Notification

```php
class ItemCreated extends Notification implements ShouldQueue
{
    public function via($notifiable): array
    {
        $channels = ['database', 'broadcast'];

        // Check email preference
        $emailPref = $notifiable->notificationPreferences()
            ->where('type', 'item_created')
            ->where('channel', 'email')
            ->first();

        if ($emailPref && $emailPref->isEnabled()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Item Created')
            ->greeting("Hello {$notifiable->name}!")
            ->line("Item '{$this->item->string}' has been created.")
            ->action('View Item', route('sample.items.show', $this->item->id));
    }
}
```

---

## Retry Strategy

Email notifications use automatic retry:

- **Retry delays**: 1s, 5s, 15s, 60s
- **Retry until**: 24 hours
- **Queue**: `notifications`

```php
public function backoff(): array
{
    return [1, 5, 15, 60];
}

public function retryUntil(): DateTime
{
    return now()->addHours(24);
}
```

---

## Monitoring

### Check Failed Jobs

```bash
php artisan queue:failed
```

### Retry Failed Jobs

```bash
php artisan queue:retry all
```

### View Logs

```bash
tail -f storage/logs/laravel.log
```

---

## Troubleshooting

### Emails Not Sending

1. **Check queue is running**
   ```bash
   php artisan queue:work
   ```

2. **Check email configuration**
   ```bash
   php artisan config:show mail
   ```

3. **Check failed jobs**
   ```bash
   php artisan queue:failed
   ```

4. **Test email directly**
   ```bash
   php artisan tinker
   >>> Mail::raw('Test', fn($m) => $m->to('test@example.com'));
   ```

### Authentication Failed

- Verify API key is correct
- Check domain is verified (Mailgun)
- Ensure credentials are in .env

### Rate Limiting

- Mailgun free tier: 300 emails/day
- SendGrid free tier: 100 emails/day
- Upgrade plan for higher limits

---

## Best Practices

1. **Use separate sender email** for notifications
2. **Add unsubscribe link** in email template
3. **Monitor delivery rates** via provider dashboard
4. **Set appropriate quiet hours** for users
5. **Test with sandbox domain** before production
6. **Use queue workers** for reliability
7. **Monitor failed jobs** regularly

---

## Production Checklist

- [ ] Email provider account created
- [ ] API credentials configured in .env
- [ ] Sender email verified
- [ ] Queue worker running
- [ ] Failed job monitoring setup
- [ ] Email templates tested
- [ ] Quiet hours configured
- [ ] User preferences UI deployed
- [ ] Monitoring alerts configured

---

## Support

For issues:

1. Check provider documentation
2. Review Laravel mail documentation
3. Check application logs
4. Test with `php artisan tinker`
