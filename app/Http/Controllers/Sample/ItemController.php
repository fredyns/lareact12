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

        $query = Item::query()
            ->with(['user', 'creator', 'updater']);

        // Apply filters
        if ($request->filled('search')) {
            $query->where('string', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%')
                ->orWhere('text', 'like', '%' . $request->search . '%');
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
        $query->orderBy($sortField, $sortDirection);

        // Paginate results
        $items = $query->paginate($request->input('per_page', 10))
            ->appends($request->query());

        // Return API response if requested
        if ($request->wantsJson()) {
            return new ItemResourceCollection($items);
        }

        // Return Inertia view
        return Inertia::render('sample/Items/Index', [
            'items' => [
                'data' => $items->items(),
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
                'links' => $items->linkCollection()->toArray(),
            ],
            'filters' => $request->only(['search', 'user_id', 'enumerate', 'sort_field', 'sort_direction']),
            'enumerateOptions' => collect(ItemEnumerate::cases())->map(fn($case) => [
                'value' => $case->value,
                'label' => Str::title($case->value),
            ])->toArray(),
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

        return Inertia::render('sample/Items/Create', [
            'enumerateOptions' => collect(ItemEnumerate::cases())->map(fn($case) => [
                'value' => $case->value,
                'label' => Str::title($case->value),
            ])->toArray(),
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

        // Files are now uploaded via separate API endpoint
        // The 'file' and 'image' fields contain MinIO paths as strings
        // No additional file processing needed here

        $item = Item::create($data);

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

        return Inertia::render('sample/Items/Show', [
            'item' => $item,
            'enumerateOptions' => collect(ItemEnumerate::cases())->map(fn($case) => [
                'value' => $case->value,
                'label' => Str::title($case->value),
            ])->toArray(),
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

        return Inertia::render('sample/Items/Edit', [
            'item' => new ItemResource($item),
            'enumerateOptions' => collect(ItemEnumerate::cases())->map(fn($case) => [
                'value' => $case->value,
                'label' => Str::title($case->value),
            ])->toArray(),
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

        $data = $request->validated();

        // Handle file uploads using MinIO
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($item->file && $this->minioService->fileExists($item->file)) {
                $this->minioService->deleteFile($item->file);
            }
            $filePath = $this->minioService->uploadFile(
                $request->file('file'),
                'items/files'
            );
            if ($filePath) {
                $data['file'] = $filePath;
            }
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($item->image && $this->minioService->fileExists($item->image)) {
                $this->minioService->deleteFile($item->image);
            }
            $imagePath = $this->minioService->uploadFile(
                $request->file('image'),
                'items/images'
            );
            if ($imagePath) {
                $data['image'] = $imagePath;
            }
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
        if ($item->file && $this->minioService->fileExists($item->file)) {
            $this->minioService->deleteFile($item->file);
        }

        if ($item->image && $this->minioService->fileExists($item->image)) {
            $this->minioService->deleteFile($item->image);
        }

        $item->delete();

        if (request()->wantsJson()) {
            return response()->json(null, 204);
        }

        return redirect()->route('sample.items.index')
            ->with('success', 'Item deleted successfully.');
    }

}
