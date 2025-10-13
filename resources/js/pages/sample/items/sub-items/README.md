# Sub-Items Nested CRUD

This directory contains the nested CRUD implementation for `sample_sub_items` within the Items Show page.

## Overview

A fully async-optimistic CRUD system for managing sub-items that belong to a parent item. All operations (create, view, update, delete) are performed asynchronously with optimistic UI updates for instant feedback.

## Architecture

### Components

1. **sub-items-section.tsx** - Main container component
   - Manages sub-items table display
   - Handles async data fetching
   - Coordinates modal operations
   - Implements optimistic updates for all operations

2. **view-modal.tsx** - View sub-item details
   - Async field loading with shimmer effects
   - Displays all sub-item fields progressively
   - Shows skeleton loaders while data is being fetched

3. **create-modal.tsx** - Create new sub-item
   - Optimistic creation with temporary ID
   - Immediate UI update before server confirmation
   - Form validation and error handling

4. **edit-modal.tsx** - Edit existing sub-item
   - Async data loading with skeleton UI
   - Optimistic updates on save
   - Pre-populated form fields

## Features

### Async-Optimistic Operations

**Create:**
- User clicks "Add Sub Item"
- Modal opens with empty form
- On submit, item appears in table immediately with temp ID
- Server request processes in background
- Real ID replaces temp ID on success

**View:**
- User clicks eye icon
- Modal opens immediately
- Fields load asynchronously
- Shimmer/skeleton shown for pending fields
- Fields populate as data arrives

**Update:**
- User clicks edit icon
- Modal opens with skeleton loaders
- Form fields populate when data loads
- On submit, table updates immediately
- Server request confirms in background

**Delete:**
- User clicks delete icon
- Confirmation dialog appears
- Item removed from table immediately
- Server request processes in background
- Rollback on error

### UI/UX Features

- **Skeleton Loaders**: Shown while data is loading
- **Optimistic Updates**: Instant feedback for all operations
- **Error Handling**: Rollback on failure with user notification
- **Preserve Scroll**: Table position maintained during operations
- **Modal Windows**: All CRUD operations in modals (no page navigation)

## API Endpoints

### Fetch Sub-Items
```
GET /sample/items/{itemId}/sub-items
```
Returns all sub-items for a specific item.

### Fetch Single Sub-Item
```
GET /sample/sub-items/{subItemId}
```
Returns detailed information for a specific sub-item.

### Create Sub-Item
```
POST /sample/sub-items
```
Creates a new sub-item (uses Inertia for form handling).

### Update Sub-Item
```
PUT /sample/sub-items/{subItemId}
```
Updates an existing sub-item (uses Inertia for form handling).

### Delete Sub-Item
```
DELETE /sample/sub-items/{subItemId}
```
Deletes a sub-item (uses Inertia for routing).

## Integration

### In Items Show Page

```tsx
import { SubItemsSection } from './sub-items/sub-items-section';

// In component
<SubItemsSection itemId={item.id} />
```

### Backend Routes

**API Routes** (`routes/api.php`):
```php
Route::middleware('auth:sanctum')->prefix('sample')->group(function () {
    Route::get('items/{item}/sub-items', [ItemController::class, 'subItems']);
    Route::apiResource('sub-items', SubItemController::class);
});
```

**Web Routes** (existing SubItemController routes used for mutations)

## Data Flow

1. **Initial Load**
   - SubItemsSection mounts
   - Fetches sub-items via API
   - Displays skeleton while loading
   - Renders table when data arrives

2. **View Operation**
   - User clicks view icon
   - Modal opens immediately
   - Fetches full sub-item data asynchronously
   - Shows skeleton for pending fields
   - Populates fields as data loads

3. **Create Operation**
   - User clicks "Add Sub Item"
   - Modal opens with form
   - User submits form
   - Temp item added to table (optimistic)
   - API request sent
   - Real item replaces temp on success

4. **Update Operation**
   - User clicks edit icon
   - Modal opens with skeleton
   - Fetches current data
   - Populates form when ready
   - User submits changes
   - Table updates immediately (optimistic)
   - API request confirms

5. **Delete Operation**
   - User clicks delete icon
   - Confirmation dialog
   - Item removed from table (optimistic)
   - API request sent
   - Rollback if error

## State Management

- **Local State**: React useState for UI state
- **Optimistic Updates**: Immediate UI changes before server confirmation
- **Error Handling**: Rollback mechanism for failed operations
- **Loading States**: Skeleton loaders and disabled buttons

## Benefits

✅ **Instant Feedback**: Users see changes immediately
✅ **Progressive Loading**: Fields appear as data arrives
✅ **No Page Reloads**: All operations in modals
✅ **Better UX**: Skeleton loaders instead of spinners
✅ **Error Recovery**: Automatic rollback on failure
✅ **Scroll Preservation**: Table position maintained
✅ **Clean Architecture**: Separated concerns with dedicated components

## Future Enhancements

- Pagination for large sub-item lists
- Bulk operations (multi-select delete)
- Advanced filtering and sorting
- Real-time updates via WebSockets
- Undo/redo functionality
- Drag-and-drop reordering
