# React Notification Components Guide

## Overview

Complete guide for using React notification components and hooks in your application.

---

## Components

### 1. NotificationBell

Bell icon with unread badge and dropdown menu.

#### Features

- Unread notification badge
- Recent notifications dropdown (5 latest)
- Mark as read / Delete actions
- Link to full notification center
- Dark mode support

#### Usage

```tsx
import { NotificationBell } from '@/components/NotificationBell';

export default function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1>My App</h1>
      <NotificationBell />
    </header>
  );
}
```

#### Props

None - uses `useNotifications` hook internally

#### Example in Layout

```tsx
import { NotificationBell } from '@/components/NotificationBell';

export default function Layout({ children }) {
  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1>Dashboard</h1>
          <NotificationBell />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

### 2. NotificationCenter

Full-page notification center with filtering and bulk actions.

#### Features

- All notifications display
- Filter by read status (all, unread, read)
- Filter by notification type
- Mark as read / Delete actions
- Statistics (total, unread, read)
- Pagination support
- Dark mode support

#### Usage

```tsx
import { NotificationCenter } from '@/components/NotificationCenter';

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <NotificationCenter />
    </div>
  );
}
```

#### Props

None - uses `useNotifications` hook internally

#### Example Page

```tsx
import { NotificationCenter } from '@/components/NotificationCenter';

export default function NotificationsPage() {
  return (
    <div>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1>Notifications</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <NotificationCenter />
      </div>
    </div>
  );
}
```

---

### 3. NotificationToast

Auto-dismissing toast notification component.

#### Features

- 4 types: success, error, info, warning
- Auto-dismiss after duration
- Manual close button
- Smooth animations
- Dark mode support

#### Usage

```tsx
import { NotificationToast, ToastContainer } from '@/components/NotificationToast';
import { useState } from 'react';

export default function MyComponent() {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message, duration: 5000 }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <button onClick={() => addToast('success', 'Success', 'Operation completed!')}>
        Show Toast
      </button>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
```

#### Toast Types

```tsx
// Success
addToast('success', 'Success', 'Item created successfully');

// Error
addToast('error', 'Error', 'Failed to create item');

// Info
addToast('info', 'Info', 'Please note this information');

// Warning
addToast('warning', 'Warning', 'This action cannot be undone');
```

#### Props

**NotificationToast**

```tsx
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number; // milliseconds, default 5000
}

interface NotificationToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}
```

**ToastContainer**

```tsx
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}
```

---

### 4. NotificationPreferences

User preference management component.

#### Features

- Enable/disable per type and channel
- Configure quiet hours
- Reset to defaults
- Error handling
- Success feedback
- Dark mode support

#### Usage

```tsx
import { NotificationPreferences } from '@/components/NotificationPreferences';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <NotificationPreferences />
    </div>
  );
}
```

#### Props

None - uses `useNotificationPreferences` hook internally

#### Example Page

```tsx
import { NotificationPreferences } from '@/components/NotificationPreferences';

export default function SettingsPage() {
  return (
    <div>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1>Settings</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <NotificationPreferences />
      </div>
    </div>
  );
}
```

---

## Hooks

### 1. useNotifications

Manages real-time notifications.

#### Features

- Fetch notifications from API
- Real-time WebSocket subscription
- Mark as read / Mark all as read
- Delete notifications
- Unread count tracking
- Auto-refresh on new notifications

#### Usage

```tsx
import { useNotifications } from '@/hooks/useNotifications';

export default function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map((n) => (
        <div key={n.id}>
          <h3>{n.data.title}</h3>
          <p>{n.data.body}</p>
          <button onClick={() => markAsRead(n.id)}>Mark as Read</button>
          <button onClick={() => deleteNotification(n.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

#### Return Value

```tsx
{
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}
```

#### Interfaces

```tsx
interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### 2. useNotificationPreferences

Manages user notification preferences.

#### Features

- Fetch preferences from API
- Update preferences (enable/disable, quiet hours)
- Reset to defaults
- Error handling
- Loading states

#### Usage

```tsx
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

export default function PreferencesComponent() {
  const {
    preferences,
    isLoading,
    error,
    updatePreference,
    resetPreferences,
  } = useNotificationPreferences();

  const handleToggle = async (type, channel, enabled) => {
    await updatePreference(type, channel, !enabled);
  };

  const handleQuietHours = async (type, channel, start, end) => {
    await updatePreference(type, channel, true, start, end);
  };

  return (
    <div>
      {error && <p className="text-red-600">{error}</p>}
      {/* Render preferences */}
    </div>
  );
}
```

#### Return Value

```tsx
{
  preferences: PreferencesGrouped;
  isLoading: boolean;
  error: string | null;
  fetchPreferences: () => Promise<void>;
  updatePreference: (
    type: string,
    channel: 'in-app' | 'email',
    enabled: boolean,
    quietHoursStart?: string | null,
    quietHoursEnd?: string | null
  ) => Promise<NotificationPreference>;
  resetPreferences: () => Promise<void>;
}
```

#### Interfaces

```tsx
interface NotificationPreference {
  id: string;
  user_id: string;
  type: string;
  channel: 'in-app' | 'email';
  enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at: string;
  updated_at: string;
}

interface PreferencesGrouped {
  [type: string]: NotificationPreference[];
}
```

---

## Integration Examples

### Complete Dashboard

```tsx
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationCenter } from '@/components/NotificationCenter';
import { NotificationToast, ToastContainer } from '@/components/NotificationToast';
import { useNotifications } from '@/hooks/useNotifications';
import { useState } from 'react';

export default function Dashboard() {
  const { unreadCount } = useNotifications();
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1>Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {unreadCount} unread notifications
            </span>
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <NotificationCenter />
      </main>

      {/* Toasts */}
      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
```

### Settings Page

```tsx
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { NotificationToast, ToastContainer } from '@/components/NotificationToast';
import { useState } from 'react';

export default function SettingsPage() {
  const [toasts, setToasts] = useState([]);

  return (
    <div>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <NotificationPreferences />
      </div>

      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
```

---

## Styling

All components use Tailwind CSS with dark mode support.

### Customization

To customize colors, modify component classes:

```tsx
// Example: Change primary color from blue to purple
// In NotificationBell.tsx
className="bg-purple-600" // instead of bg-blue-600
```

### Dark Mode

Dark mode is automatically supported via Tailwind's `dark:` prefix.

Enable in `tailwind.config.ts`:

```ts
export default {
  darkMode: 'class',
  // ...
}
```

---

## Performance Tips

1. **Memoize components** to prevent unnecessary re-renders
2. **Use pagination** for large notification lists
3. **Debounce API calls** when updating preferences
4. **Lazy load** notification center on demand
5. **Use React.memo** for list items

---

## Troubleshooting

### Notifications not updating

- Check WebSocket connection in browser DevTools
- Verify Echo is initialized
- Check browser console for errors

### Preferences not saving

- Check network tab for API errors
- Verify authentication token
- Check server logs

### Styling issues

- Ensure Tailwind CSS is properly configured
- Check for CSS conflicts
- Verify dark mode is enabled

---

## API Reference

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete API documentation.
