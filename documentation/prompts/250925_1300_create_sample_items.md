You are an expert Laravel + PHP + REST + (Blade or Inertia+React) scaffolder. Generate a complete CRUD app for the table below, including backend (Laravel 12), API resources, policies, tests, seeders, repositories/services, and views. Follow every requirement exactly.

## Table & Constraints
- Table name: sample_items
- PK & FK are UUID.
- Columns marked with "#uuid" use the `uuid` type.
- Foreign keys:
    - user_id → users.id (UUID)
    - created_by → users.id (UUID)
    - updated_by → users.id (UUID)

### Columns
- id uuid [PK, not null]              #uuid
- created_at TIMESTAMP [nullable]
- updated_at TIMESTAMP [nullable]
- created_by uuid [nullable]          #uuid (FK to users.id)
- updated_by uuid [nullable]          #uuid (FK to users.id)
- user_id uuid [nullable]             #uuid (FK to users.id)
- string VARCHAR(255) [not null]
- email VARCHAR(255) [nullable]       #email
- color VARCHAR(20) [nullable]        #color
- integer INT [nullable]              #slider #min:1 #max:100
- decimal DECIMAL [nullable]
- npwp VARCHAR(20) [nullable]         #mask: 99.999.999.9-999.999
- datetime DATETIME [nullable]
- date DATE [nullable]
- time TIME [nullable]
- ip_address VARCHAR(255) [nullable] #ipaddress
- boolean TINYINT [nullable]         #boolean
- enumerate ENUM('enable','disable') [nullable] → must be implemented using a dedicated PHP Enum object
- text TEXT [nullable]
- file TEXT [nullable]               #file:pdf,docx,pptx,xlsx,zip,rar
- image TEXT [nullable]              #image:jpg,jpeg,png
- markdown_text TEXT [nullable]      #markdown
- wysiwyg TEXT [nullable]            #wysiwyg
- latitude DECIMAL [nullable]
- longitude DECIMAL [nullable]

### Routing & Navigation
- Route prefix: `sample`
- Resource route path: `sample/items`
- Menu: add “Items” under “Sample” group.

### Frontend Widgets
- `#wysiwyg` → **TinyMCE** editor.
- `#markdown` → **@uiw/react-md-editor**.
- `#color` → **@uiw/react-color**.
- Boolean → toggle/switch control button.
- ENUM (`enumerate`) → **react-select** bound to Enum values.
- Foreign keys (`user_id`, `created_by`, `updated_by`) → **react-select** with async search from `/api/users`.
- **Geo Location (latitude/longitude) → Leaflet + OpenStreetMap**:
    - Interactive Leaflet map in create/edit form.
    - Default center [0,0], zoom 2 (or item coords on edit).
    - Click/drag marker updates `latitude` & `longitude`; typing updates marker.
    - Use OpenStreetMap tiles (no API key). Nominatim search optional.
- **NPWP input masking**:
    - Input mask enforcing format: `99.999.999.9-999.999`.
    - React: use `react-input-mask` or `cleave.js`.
    - Laravel validation: regex `/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/`

## Files to Create
- Migration to create table and indices.
- Migration to create table relations (FKs).
- Migration to add permissions for this table with the following entries:
    - sample.items.index
    - sample.items.show
    - sample.items.create
    - sample.items.update
    - sample.items.delete
- **PHP Enum Object**: `App\Enums\Sample\ItemEnumerate` for the `enumerate` column:
  ```php
  <?php
  namespace App\Enums\Sample;

  /**
   * Enum for Item enumerate field.
   */
  enum ItemEnumerate: string {
      case ENABLE = 'enable';
      case DISABLE = 'disable';
  }
  ```


### Create related objects
Eloquent Model: App\Models\Sample\Item (casts enumerate column to ItemEnumerate).
Controller: App\Http\Controllers\Sample\ItemController
Views (Blade) or Pages (Inertia+React) for the resource.
API Resource: App\Http\Resources\Sample\ItemResource
API ResourceCollection: App\Http\Resources\Sample\ItemResourceCollection
Form Request: App\Http\Requests\Sample\ItemRequest
Web routes in routes/web.php under prefix sample.
API routes in routes/api.php under prefix sample.
Factory: Database\Factories\Sample\ItemFactory (use ItemEnumerate::cases() for enumerate)
Feature Test: Tests\Feature\Sample\ItemTest
Seeder: Database\Seeders\Sample\ItemSeeder (use ItemEnumerate values instead of raw strings)
Policy: App\Policies\Sample\ItemPolicy and registration.
Supporting API Endpoint: /api/users returning users for react-select dropdowns.


### Implementation Details

UUIDs:
All PK/FK columns are uuid.

Model: $keyType = 'string', $incrementing = false; generate with Str::uuid().

Relationships:
belongsTo User via user_id, created_by, updated_by.

Indexes:
Index on user_id; primary on id.

Foreign Keys: onUpdate cascade; onDelete set null for user-linked FKs.

#### Validation (ItemRequest):
string: required|string|max:255
email: nullable|email|max:255
color: nullable|string|max:20
integer: nullable|integer|between:1,100
decimal: nullable|numeric
npwp: nullable|string|max:20|regex:/^\d{2}.\d{3}.\d{3}.\d-\d{3}.\d{3}$/
datetime: nullable|date
date: nullable|date
time: nullable|date_format:H:i
ip_address: nullable|ip
boolean: nullable|boolean
enumerate: nullable|enum:App\Enums\Sample\ItemEnumerate
text/file/image/markdown_text/wysiwyg: nullable|string
latitude/longitude: nullable|numeric (lat -90..90, lng -180..180)
user_id/created_by/updated_by: nullable|uuid|exists:users,id

#### Policy ↔ Permissions mapping:
viewAny → sample.items.index
view → sample.items.show
create → sample.items.create
update → sample.items.update
delete → sample.items.delete

#### Views:
Index: filter with react-select for enumerate (bound to ItemEnumerate) and user_id.
Create/Edit: TinyMCE, react-md-editor, react-color, toggle, react-select for enums/FKs, Leaflet map for lat/lng, NPWP masked input.

#### Routes:
Web: Route::prefix('sample')->name('sample.')->group(fn() => Route::resource('items', ItemController::class));
API: Route::prefix('sample')->name('sample.')->group(fn() => Route::apiResource('items', ItemController::class));
Extra: /api/users for user dropdown.

### Documentation & Comments
Add inline comments explaining purpose and logic.
Add DocBlocks to all objects: Classes, methods, properties, migrations, factories, tests.
Include type hints, return types, and param annotations.

Deliver fully working code with namespaces and PSR-4 paths exactly as specified above.
