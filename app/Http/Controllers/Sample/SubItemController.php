<?php

namespace App\Http\Controllers\Sample;

use App\Enums\Sample\ItemEnumerate;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sample\SubItemRequest;
use App\Http\Resources\Sample\SubItemResource;
use App\Models\Sample\Item;
use App\Models\Sample\SubItem;
use App\Services\MinioService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * SubItem Controller
 *
 * Handles CRUD operations for the SubItem model
 */
class SubItemController extends Controller
{
    protected $minioService;

    public function __construct(MinioService $minioService)
    {
        $this->minioService = $minioService;
        // Authorization is handled in individual methods
    }

    /**
     * Display a listing of the sub-items.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response|\Illuminate\Http\Resources\Json\ResourceCollection
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', SubItem::class);

        // Search functionality and build query
        $search = (string)$request->get('search', '');
        $query = SubItem::search($search)
            ->with(['item', 'user', 'creator', 'updater']);

        // Apply additional filters
        if ($request->filled('item_id')) {
            $query->where('item_id', $request->item_id);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('enumerate')) {
            $query->where('enumerate', $request->enumerate);
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        $allowedSorts = ['string', 'email', 'integer', 'decimal', 'datetime', 'date', 'created_at', 'updated_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Paginate results
        $subItems = $query->paginate(10)->withQueryString();

        // Return API response if requested
        if ($request->wantsJson()) {
            return SubItemResource::collection($subItems);
        }

        // Get all items for filter dropdown
        $items = Item::orderBy('string')->get(['id', 'string']);

        // Return Inertia view
        return Inertia::render('sample/sub-items/index', [
            'subItems' => [
                'data' => SubItemResource::collection($subItems->items())->resolve(),
                'current_page' => $subItems->currentPage(),
                'last_page' => $subItems->lastPage(),
                'per_page' => $subItems->perPage(),
                'total' => $subItems->total(),
                'links' => $subItems->linkCollection()->toArray(),
            ],
            'filters' => $request->only(['search', 'item_id', 'user_id', 'enumerate', 'sort_field', 'sort_direction']),
            'enumerateOptions' => ItemEnumerate::toSelectOptions(),
            'items' => $items,
        ]);
    }

    /**
     * Show the form for creating a new sub-item.
     *
     * @return \Inertia\Response
     */
    public function create(Request $request)
    {
        $this->authorize('create', SubItem::class);

        // Get all items for parent selection
        $items = Item::orderBy('string')->get(['id', 'string']);

        return Inertia::render('sample/sub-items/create', [
            'enumerateOptions' => ItemEnumerate::toSelectOptions(),
            'items' => $items,
            'selectedItemId' => $request->get('item_id'),
        ]);
    }

    /**
     * Store a newly created sub-item in storage.
     *
     * @param  \App\Http\Requests\Sample\SubItemRequest  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function store(SubItemRequest $request)
    {
        $this->authorize('create', SubItem::class);

        $data = $request->validated();

        // Create the sub-item first to generate ID and upload_path
        $subItem = SubItem::create($data);

        // Move uploaded files from temporary location to final location
        $subItem->file = $this->minioService->moveToFolder($subItem->file, $subItem->upload_path) ?? $subItem->file;
        $subItem->image = $this->minioService->moveToFolder($subItem->image, $subItem->upload_path) ?? $subItem->image;

        // Save updated file paths if any files were moved
        if ($subItem->isDirty(['file', 'image'])) {
            $subItem->save();
        }

        if ($request->wantsJson()) {
            return (new SubItemResource($subItem))
                ->response()
                ->setStatusCode(201);
        }

        return redirect()->route('sample.sub-items.show', $subItem)
            ->with('success', 'Sub-item created successfully.');
    }

    /**
     * Display the specified sub-item.
     *
     * @param  \App\Models\Sample\SubItem  $subItem
     * @return \Inertia\Response|\Illuminate\Http\Resources\Json\JsonResource
     */
    public function show(SubItem $subItem)
    {
        $this->authorize('view', $subItem);

        $subItem->load(['item', 'user', 'creator', 'updater']);

        if (request()->wantsJson()) {
            return new SubItemResource($subItem);
        }

        return Inertia::render('sample/sub-items/show', [
            'subItem' => (new SubItemResource($subItem))->toArray(request()),
            'enumerateOptions' => ItemEnumerate::toSelectOptions(),
        ]);
    }

    /**
     * Show the form for editing the specified sub-item.
     *
     * @param  \App\Models\Sample\SubItem  $subItem
     * @return \Inertia\Response
     */
    public function edit(SubItem $subItem)
    {
        $this->authorize('update', $subItem);

        $subItem->load(['item', 'user', 'creator', 'updater']);

        // Get all items for parent selection
        $items = Item::orderBy('string')->get(['id', 'string']);

        return Inertia::render('sample/sub-items/edit', [
            'subItem' => (new SubItemResource($subItem))->toArray(request()),
            'enumerateOptions' => ItemEnumerate::toSelectOptions(),
            'items' => $items,
        ]);
    }

    /**
     * Update the specified sub-item in storage.
     *
     * @param  \App\Http\Requests\Sample\SubItemRequest  $request
     * @param  \App\Models\Sample\SubItem  $subItem
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function update(SubItemRequest $request, SubItem $subItem)
    {
        $this->authorize('update', $subItem);

        // Ensure upload_path is set
        if (empty($subItem->upload_path)) {
            $subItem->upload_path = $subItem->generateUploadPath();
        }

        $data = $request->validated();

        // Handle file uploads using MinIO
        // If new file uploaded, it will be in the request data
        // If not, keep the existing file path
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($subItem->file) {
                $this->minioService->deleteFile($subItem->file);
            }
            // Move new file to final location
            $data['file'] = $this->minioService->moveToFolder($data['file'], $subItem->upload_path) ?? $data['file'];
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($subItem->image) {
                $this->minioService->deleteFile($subItem->image);
            }
            // Move new image to final location
            $data['image'] = $this->minioService->moveToFolder($data['image'], $subItem->upload_path) ?? $data['image'];
        }

        $subItem->update($data);

        if ($request->wantsJson()) {
            return (new SubItemResource($subItem))
                ->response()
                ->setStatusCode(200);
        }

        return redirect()->route('sample.sub-items.show', $subItem)
            ->with('success', 'Sub-item updated successfully.');
    }

    /**
     * Remove the specified sub-item from storage.
     *
     * @param  \App\Models\Sample\SubItem  $subItem
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function destroy(SubItem $subItem)
    {
        $this->authorize('delete', $subItem);

        // Delete associated files from MinIO
        $this->minioService->deleteFiles([$subItem->file, $subItem->image]);

        $subItem->delete();

        if (request()->wantsJson()) {
            return response()->json(null, 204);
        }

        return redirect()->route('sample.sub-items.index')
            ->with('success', 'Sub-item deleted successfully.');
    }
}
