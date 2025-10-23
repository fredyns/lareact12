<?php

namespace App\Http\Controllers\Sample;

use App\Actions\Sample\SubItems\DeleteSubItem;
use App\Actions\Sample\SubItems\IndexSubItems;
use App\Actions\Sample\SubItems\ShowSubItem;
use App\Actions\Sample\SubItems\StoreSubItem;
use App\Actions\Sample\SubItems\SubItemRequest;
use App\Actions\Sample\SubItems\UpdateSubItem;
use App\Enums\Sample\ItemEnumerate;
use App\Http\Controllers\Controller;
use App\Http\Resources\Sample\SubItemResource;
use App\Models\Sample\Item;
use App\Models\Sample\SubItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * SubItem Controller
 *
 * Handles CRUD operations for the SubItem model
 */
class SubItemController extends Controller
{
    public function __construct(
        protected IndexSubItems $indexSubItems,
        protected StoreSubItem $storeSubItem,
        protected ShowSubItem $showSubItem,
        protected UpdateSubItem $updateSubItem,
        protected DeleteSubItem $deleteSubItem
    ) {
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

        $subItems = $this->indexSubItems->handle($request);

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

        $subItem = $this->storeSubItem->handle($request);

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

        $subItem = $this->showSubItem->handle($subItem);

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

        $subItem = $this->showSubItem->handle($subItem);

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

        $subItem = $this->updateSubItem->handle($request, $subItem);

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

        $this->deleteSubItem->handle($subItem);

        if (request()->wantsJson()) {
            return response()->json(null, 204);
        }

        return redirect()->route('sample.sub-items.index')
            ->with('success', 'Sub-item deleted successfully.');
    }
}
