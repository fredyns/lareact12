<?php

namespace App\Http\Controllers\Sample;

use App\Enums\Sample\ItemEnumerate;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sample\ItemRequest;
use App\Http\Resources\Sample\ItemResource;
use App\Http\Resources\Sample\ItemResourceCollection;
use App\Models\Sample\Item;
use App\Models\User;
use App\Services\MinioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Item Controller
 *
 * Handles CRUD operations for the Item model
 */
class ItemController extends Controller
{
    protected $minioService;

    public function __construct(MinioService $minioService)
    {
        $this->minioService = $minioService;
        // Authorization is handled in individual methods
    }
    /**
     * Display a listing of the items.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response|\Illuminate\Http\Resources\Json\ResourceCollection
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Item::class);

        // Search functionality and build query
        $search = (string)$request->get('search', '');
        $query = Item::search($search)
            ->with(['user', 'creator', 'updater']);

        // Apply additional filters
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
        $items = $query->paginate(10)->withQueryString();

        // Return API response if requested
        if ($request->wantsJson()) {
            return new ItemResourceCollection($items);
        }

        // Return Inertia view
        return Inertia::render('sample/items/index', [
            'items' => [
                'data' => $items->items(),
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
                'links' => $items->linkCollection()->toArray(),
            ],
            'filters' => $request->only(['search', 'user_id', 'enumerate', 'sort_field', 'sort_direction']),
            'enumerateOptions' => ItemEnumerate::toSelectOptions(),
        ]);
    }

    /**
     * Show the form for creating a new item.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $this->authorize('create', Item::class);

        return Inertia::render('sample/items/create', [
            'enumerateOptions' => ItemEnumerate::toSelectOptions(),
        ]);
    }

    /**
     * Store a newly created item in storage.
     *
     * @param  \App\Http\Requests\Sample\ItemRequest  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function store(ItemRequest $request)
    {
        $this->authorize('create', Item::class);

        $data = $request->validated();

        // Create the item first to generate ID and upload_path
        $item = Item::create($data);

        // Move uploaded files from temporary location to final location
        // Temporary: tmp/sample_items/2025/10/01/filename.ext
        // Final: sample_items/2025/10/01/{modelID}/filename.ext
        $item->file = $this->minioService->moveToFolder($item->file, $item->upload_path) ?? $item->file;
        $item->image = $this->minioService->moveToFolder($item->image, $item->upload_path) ?? $item->image;

        // Save updated file paths if any files were moved
        if ($item->isDirty(['file', 'image'])) {
            $item->save();
        }

        if ($request->wantsJson()) {
            return (new ItemResource($item))
                ->response()
                ->setStatusCode(201);
        }

        return redirect()->route('sample.items.show', $item)
            ->with('success', 'Item created successfully.');
    }

    /**
     * Display the specified item.
     *
     * @param  \App\Models\Sample\Item  $item
     * @return \Inertia\Response|\Illuminate\Http\Resources\Json\JsonResource
     */
    public function show(Item $item)
    {
        $this->authorize('view', $item);

        $item->load(['user', 'creator', 'updater']);

        if (request()->wantsJson()) {
            return new ItemResource($item);
        }

        return Inertia::render('sample/items/show', [
            'item' => (new ItemResource($item))->toArray(request()),
            'enumerateOptions' => ItemEnumerate::toSelectOptions(),
        ]);
    }

    /**
     * Show the form for editing the specified item.
     *
     * @param  \App\Models\Sample\Item  $item
     * @return \Inertia\Response
     */
    public function edit(Item $item)
    {
        $this->authorize('update', $item);

        $item->load(['user', 'creator', 'updater']);

        return Inertia::render('sample/items/edit', [
            'item' => (new ItemResource($item))->toArray(request()),
            'enumerateOptions' => ItemEnumerate::toSelectOptions(),
        ]);
    }

    /**
     * Update the specified item in storage.
     *
     * @param  \App\Http\Requests\Sample\ItemRequest  $request
     * @param  \App\Models\Sample\Item  $item
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function update(ItemRequest $request, Item $item)
    {
        $this->authorize('update', $item);

        // Ensure upload_path is set
        if (empty($item->upload_path)) {
            $item->upload_path = $item->generateUploadPath();
        }

        $data = $request->validated();

        // Handle file uploads using MinIO
        // If new file uploaded, it will be in the request data
        // If not, keep the existing file path
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($item->file) {
                $this->minioService->deleteFile($item->file);
            }
            // Move new file to final location
            $data['file'] = $this->minioService->moveToFolder($data['file'], $item->upload_path) ?? $data['file'];
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($item->image) {
                $this->minioService->deleteFile($item->image);
            }
            // Move new image to final location
            $data['image'] = $this->minioService->moveToFolder($data['image'], $item->upload_path) ?? $data['image'];
        }

        $item->update($data);

        if ($request->wantsJson()) {
            return (new ItemResource($item))
                ->response()
                ->setStatusCode(200);
        }

        return redirect()->route('sample.items.show', $item)
            ->with('success', 'Item updated successfully.');
    }

    /**
     * Remove the specified item from storage.
     *
     * @param  \App\Models\Sample\Item  $item
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function destroy(Item $item)
    {
        $this->authorize('delete', $item);

        // Delete associated files from MinIO
        $this->minioService->deleteFiles([$item->file, $item->image]);

        $item->delete();

        if (request()->wantsJson()) {
            return response()->json(null, 204);
        }

        return redirect()->route('sample.items.index')
            ->with('success', 'Item deleted successfully.');
    }

}
