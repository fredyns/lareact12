# Single-Action Controllers Architecture

This document describes the single-action controller pattern implemented for the Items module.

## Overview

Instead of traditional controllers with multiple methods, each route is handled by a dedicated invokable controller class with a single `__invoke()` method. This follows the Single Responsibility Principle and makes the codebase more maintainable and testable.

## Benefits

✅ **Single Responsibility** - Each controller class has one clear purpose  
✅ **Direct Route Mapping** - Routes map directly to controller classes  
✅ **Easier Testing** - Test one action at a time in isolation  
✅ **Better Organization** - Clear file structure mirrors application features  
✅ **No Controller Bloat** - No large controller files with many methods  
✅ **Explicit Dependencies** - Each action declares only what it needs  

## Architecture

### Directory Structure

```
app/Actions/Sample/Items/
├── CreateItem.php          # GET  /sample/items/create
├── DeleteItem.php          # DELETE /sample/items/{item}
├── EditItem.php            # GET  /sample/items/{item}/edit
├── IndexItems.php          # GET  /sample/items
├── ItemRequest.php         # Form validation
├── ShowItem.php            # GET  /sample/items/{item}
├── StoreItem.php           # POST /sample/items
└── UpdateItem.php          # PUT  /sample/items/{item}

app/Actions/Sample/Shared/
├── DeleteFilesFromStorage.php
└── MoveFilesToFinalLocation.php
```

### Route Definition

**Before (Resource Controller):**
```php
Route::resource('items', ItemController::class);
```

**After (Single-Action Controllers):**
```php
Route::get('items', IndexItems::class)->name('items.index');
Route::get('items/create', CreateItem::class)->name('items.create');
Route::post('items', StoreItem::class)->name('items.store');
Route::get('items/{item}', ShowItem::class)->name('items.show');
Route::get('items/{item}/edit', EditItem::class)->name('items.edit');
Route::put('items/{item}', UpdateItem::class)->name('items.update');
Route::delete('items/{item}', DeleteItem::class)->name('items.destroy');
```

## Implementation Pattern

### Basic Structure

```php
<?php

namespace App\Actions\Sample\Items;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ActionName extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $this->authorize('action', Model::class);
        
        // Action logic here
        
        return response();
    }
}
```

### With Dependencies

```php
<?php

namespace App\Actions\Sample\Items;

use App\Http\Controllers\Controller;
use App\Services\SomeService;

class ActionName extends Controller
{
    public function __construct(
        protected SomeService $service
    ) {}

    public function __invoke(Request $request)
    {
        // Use $this->service
    }
}
```

### With Route Model Binding

```php
<?php

namespace App\Actions\Sample\Items;

use App\Http\Controllers\Controller;
use App\Models\Sample\Item;

class ShowItem extends Controller
{
    public function __invoke(Item $item)
    {
        $this->authorize('view', $item);
        
        return Inertia::render('sample/items/show', [
            'item' => $item
        ]);
    }
}
```

## Examples

### 1. IndexItems - List Resources

```php
<?php

namespace App\Actions\Sample\Items;

use App\Http\Controllers\Controller;
use App\Models\Sample\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IndexItems extends Controller
{
    public function __invoke(Request $request)
    {
        $this->authorize('viewAny', Item::class);

        $items = Item::query()
            ->when($request->search, fn($q) => $q->search($request->search))
            ->paginate(10);

        return Inertia::render('sample/items/index', [
            'items' => $items
        ]);
    }
}
```

### 2. StoreItem - Create Resource

```php
<?php

namespace App\Actions\Sample\Items;

use App\Http\Controllers\Controller;
use App\Models\Sample\Item;

class StoreItem extends Controller
{
    public function __invoke(ItemRequest $request)
    {
        $this->authorize('create', Item::class);

        $item = Item::create($request->validated());

        return redirect()
            ->route('sample.items.show', $item)
            ->with('success', 'Item created successfully.');
    }
}
```

### 3. UpdateItem - Update Resource

```php
<?php

namespace App\Actions\Sample\Items;

use App\Http\Controllers\Controller;
use App\Models\Sample\Item;

class UpdateItem extends Controller
{
    public function __invoke(ItemRequest $request, Item $item)
    {
        $this->authorize('update', $item);

        $item->update($request->validated());

        return redirect()
            ->route('sample.items.show', $item)
            ->with('success', 'Item updated successfully.');
    }
}
```

### 4. DeleteItem - Delete Resource

```php
<?php

namespace App\Actions\Sample\Items;

use App\Http\Controllers\Controller;
use App\Models\Sample\Item;

class DeleteItem extends Controller
{
    public function __invoke(Item $item)
    {
        $this->authorize('delete', $item);

        $item->delete();

        return redirect()
            ->route('sample.items.index')
            ->with('success', 'Item deleted successfully.');
    }
}
```

## Migration Guide

### Step 1: Create Action Controllers

For each method in your resource controller, create a new action controller:

```bash
# Create directory
mkdir -p app/Actions/Sample/Items

# Create action controllers
touch app/Actions/Sample/Items/IndexItems.php
touch app/Actions/Sample/Items/CreateItem.php
touch app/Actions/Sample/Items/StoreItem.php
touch app/Actions/Sample/Items/ShowItem.php
touch app/Actions/Sample/Items/EditItem.php
touch app/Actions/Sample/Items/UpdateItem.php
touch app/Actions/Sample/Items/DeleteItem.php
```

### Step 2: Move Logic

Copy the logic from each controller method into the corresponding action's `__invoke()` method.

### Step 3: Update Routes

Replace resource route with individual route definitions:

```php
// Before
Route::resource('items', ItemController::class);

// After
Route::get('items', IndexItems::class)->name('items.index');
Route::get('items/create', CreateItem::class)->name('items.create');
Route::post('items', StoreItem::class)->name('items.store');
Route::get('items/{item}', ShowItem::class)->name('items.show');
Route::get('items/{item}/edit', EditItem::class)->name('items.edit');
Route::put('items/{item}', UpdateItem::class)->name('items.update');
Route::delete('items/{item}', DeleteItem::class)->name('items.destroy');
```

### Step 4: Delete Old Controller

Once all routes are updated and tested:

```bash
rm app/Http/Controllers/Sample/ItemController.php
```

## Testing

### Unit Testing

```php
<?php

namespace Tests\Unit\Actions\Sample\Items;

use App\Actions\Sample\Items\Create\StoreItem;use Tests\TestCase;

class StoreItemTest extends TestCase
{
    public function test_it_creates_an_item()
    {
        $action = new StoreItem();
        
        $request = ItemRequest::create('/sample/items', 'POST', [
            'name' => 'Test Item'
        ]);
        
        $response = $action($request);
        
        $this->assertDatabaseHas('items', ['name' => 'Test Item']);
    }
}
```

### Feature Testing

```php
<?php

namespace Tests\Feature\Actions\Sample\Items;

use App\Models\User;
use Tests\TestCase;

class StoreItemTest extends TestCase
{
    public function test_authenticated_user_can_create_item()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)
            ->post(route('sample.items.store'), [
                'name' => 'Test Item'
            ]);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('items', ['name' => 'Test Item']);
    }
}
```

## Best Practices

1. **Keep Actions Focused** - Each action should do one thing well
2. **Use Type Hints** - Leverage PHP type hints for better IDE support
3. **Inject Dependencies** - Use constructor injection for services
4. **Authorize Early** - Call `$this->authorize()` at the start of `__invoke()`
5. **Return Consistent Responses** - Use same response pattern across actions
6. **Share Common Logic** - Extract shared logic into separate classes
7. **Name Clearly** - Action names should clearly describe what they do

## Common Patterns

### Handling JSON and HTML Responses

```php
public function __invoke(Request $request)
{
    $data = // ... get data
    
    if ($request->wantsJson()) {
        return response()->json($data);
    }
    
    return Inertia::render('view', ['data' => $data]);
}
```

### With Service Dependencies

```php
public function __construct(
    protected MinioService $minioService,
    protected NotificationService $notificationService
) {}

public function __invoke(Request $request)
{
    // Use services
    $this->minioService->upload($file);
    $this->notificationService->send($message);
}
```

### Shared Logic

Create dedicated classes for shared logic:

```php
// app/Actions/Sample/Shared/MoveFilesToFinalLocation.php
class MoveFilesToFinalLocation
{
    public function handle(Model $model): void
    {
        // Shared file moving logic
    }
}

// Use in action
public function __construct(
    protected MoveFilesToFinalLocation $moveFiles
) {}

public function __invoke(Request $request)
{
    $item = Item::create($data);
    $this->moveFiles->handle($item);
}
```

## Completed Migrations

✅ **ItemController** → Single-action controllers in `app/Actions/Sample/Items/`
- IndexItems
- CreateItem
- StoreItem
- ShowItem
- EditItem
- UpdateItem
- DeleteItem

## Next Steps

The following controllers are candidates for refactoring:

- [ ] SubItemController
- [ ] UserController
- [ ] RoleController
- [ ] PermissionController

## References

- [Laravel Single Action Controllers](https://laravel.com/docs/controllers#single-action-controllers)
- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [Action-Domain-Responder Pattern](https://en.wikipedia.org/wiki/Action%E2%80%93domain%E2%80%93responder)
