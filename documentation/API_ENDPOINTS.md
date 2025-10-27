# Notification API Endpoints

## Authentication

All endpoints require Sanctum authentication via Bearer token:

```bash
Authorization: Bearer {token}
```

---

## Notifications

### GET /api/notifications

Get paginated notifications for authenticated user.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `filter` | string | Filter by status: `unread`, `read` |
| `type` | string | Filter by notification type |
| `per_page` | int | Results per page (default: 20) |
| `page` | int | Page number (default: 1) |

**Example Request:**

```bash
GET /api/notifications?filter=unread&per_page=10
Authorization: Bearer {token}
```

**Response:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "notifiable_type": "App\\Models\\User",
      "notifiable_id": "123",
      "type": "item_created",
      "data": {
        "title": "New Item Created",
        "body": "Item 'Sample' just created",
        "action_url": "/items/456",
        "icon": "package-plus",
        "meta": {
          "item_id": "456",
          "item_name": "Sample",
          "created_by": "789"
        }
      },
      "read_at": null,
      "created_at": "2025-10-27T13:26:00Z",
      "updated_at": "2025-10-27T13:26:00Z"
    }
  ],
  "links": {
    "first": "/api/notifications?page=1",
    "last": "/api/notifications?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "/api/notifications",
    "per_page": 20,
    "to": 1,
    "total": 1
  }
}
```

---

### GET /api/notifications/count

Get unread and total notification counts.

**Example Request:**

```bash
GET /api/notifications/count
Authorization: Bearer {token}
```

**Response:**

```json
{
  "unread": 5,
  "total": 42
}
```

---

### PATCH /api/notifications/{id}/read

Mark a single notification as read.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Notification UUID |

**Example Request:**

```bash
PATCH /api/notifications/550e8400-e29b-41d4-a716-446655440000/read
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true
}
```

**Error Response (403):**

```json
{
  "error": "Unauthorized"
}
```

---

### PATCH /api/notifications/read-all

Mark all unread notifications as read.

**Example Request:**

```bash
PATCH /api/notifications/read-all
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true
}
```

---

### DELETE /api/notifications/{id}

Delete a notification.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Notification UUID |

**Example Request:**

```bash
DELETE /api/notifications/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true
}
```

**Error Response (403):**

```json
{
  "error": "Unauthorized"
}
```

---

## Notification Preferences

### GET /api/notification-preferences

Get all notification preferences for authenticated user.

**Example Request:**

```bash
GET /api/notification-preferences
Authorization: Bearer {token}
```

**Response:**

```json
{
  "item_created": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "user_id": "123",
      "type": "item_created",
      "channel": "in-app",
      "enabled": true,
      "quiet_hours_start": null,
      "quiet_hours_end": null,
      "created_at": "2025-10-27T13:26:00Z",
      "updated_at": "2025-10-27T13:26:00Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "user_id": "123",
      "type": "item_created",
      "channel": "email",
      "enabled": true,
      "quiet_hours_start": "22:00",
      "quiet_hours_end": "08:00",
      "created_at": "2025-10-27T13:26:00Z",
      "updated_at": "2025-10-27T13:26:00Z"
    }
  ],
  "item_updated": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "user_id": "123",
      "type": "item_updated",
      "channel": "in-app",
      "enabled": true,
      "quiet_hours_start": null,
      "quiet_hours_end": null,
      "created_at": "2025-10-27T13:26:00Z",
      "updated_at": "2025-10-27T13:26:00Z"
    }
  ]
}
```

---

### PUT /api/notification-preferences

Update or create a notification preference.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Notification type (e.g., `item_created`) |
| `channel` | string | Yes | Channel: `in-app` or `email` |
| `enabled` | boolean | Yes | Enable/disable notifications |
| `quiet_hours_start` | string | No | Start time in H:i format (e.g., `22:00`) |
| `quiet_hours_end` | string | No | End time in H:i format (e.g., `08:00`) |

**Example Request:**

```bash
PUT /api/notification-preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "item_created",
  "channel": "email",
  "enabled": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00"
}
```

**Response:**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "user_id": "123",
  "type": "item_created",
  "channel": "email",
  "enabled": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00",
  "created_at": "2025-10-27T13:26:00Z",
  "updated_at": "2025-10-27T13:26:00Z"
}
```

**Validation Errors (422):**

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "channel": ["The channel field must be in-app or email."],
    "quiet_hours_start": ["The quiet hours start field must be a valid time."]
  }
}
```

---

### POST /api/notification-preferences/reset

Reset all preferences to defaults (all enabled, no quiet hours).

**Example Request:**

```bash
POST /api/notification-preferences/reset
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true
}
```

---

## WebSocket Events

### Subscribe to Notifications

```typescript
import echo from '@/echo';

// Subscribe to private channel
const channel = echo.private(`user.${userId}`);

// Listen for new notifications
channel.listen('notification.created', (data) => {
  console.log('New notification:', data);
  // {
  //   id: "550e8400-e29b-41d4-a716-446655440000",
  //   type: "item_created",
  //   data: { title, body, action_url, icon, meta },
  //   created_at: "2025-10-27T13:26:00Z"
  // }
});
```

### Event Format

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "item_created",
  "data": {
    "title": "New Item Created",
    "body": "Item 'Sample' just created",
    "action_url": "/items/456",
    "icon": "package-plus",
    "meta": {
      "item_id": "456",
      "item_name": "Sample",
      "created_by": "789"
    }
  },
  "created_at": "2025-10-27T13:26:00Z"
}
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden

```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "message": "Not found."
}
```

### 422 Validation Error

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": ["Error message"]
  }
}
```

### 500 Server Error

```json
{
  "message": "Server error"
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Notifications**: 60 requests per minute
- **Preferences**: 30 requests per minute

Rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1635350400
```

---

## Pagination

List endpoints support cursor-based pagination:

**Parameters:**

- `page`: Page number (default: 1)
- `per_page`: Results per page (default: 20, max: 100)

**Response:**

```json
{
  "data": [...],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "path": "/api/notifications",
    "per_page": 20,
    "to": 20,
    "total": 100
  }
}
```

---

## Examples

### JavaScript/TypeScript

```typescript
// Fetch notifications
const response = await fetch('/api/notifications?filter=unread', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  },
});
const data = await response.json();

// Mark as read
await fetch(`/api/notifications/${notificationId}/read`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  },
});

// Update preference
await fetch('/api/notification-preferences', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'item_created',
    channel: 'email',
    enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  }),
});
```

### cURL

```bash
# Get notifications
curl -X GET 'http://localhost:8000/api/notifications?filter=unread' \
  -H 'Authorization: Bearer {token}' \
  -H 'Accept: application/json'

# Mark as read
curl -X PATCH 'http://localhost:8000/api/notifications/{id}/read' \
  -H 'Authorization: Bearer {token}' \
  -H 'Accept: application/json'

# Update preference
curl -X PUT 'http://localhost:8000/api/notification-preferences' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "item_created",
    "channel": "email",
    "enabled": true
  }'
```

---

## Changelog

### v1.0.0 (2025-10-27)

- Initial API release
- Notification endpoints
- Preference endpoints
- WebSocket support
