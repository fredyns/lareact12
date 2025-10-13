<?php

namespace App\Http\Controllers\Sample\Item;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sample\Item\SubItemRequest;
use App\Http\Resources\Sample\SubItemResource;
use App\Models\Sample\Item;
use App\Models\Sample\SubItem;
use Illuminate\Http\Request;

/**
 * Embedded SubItem Controller for Item Show Page
 *
 * Handles CRUD operations for sub-items within the parent item context
 * This is separate from the standalone SubItem controller
 */
class SubItemController extends Controller
{
    /**
     * Display a listing of sub-items for a specific item.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request, string $itemId)
    {
        $item = Item::findOrFail($itemId);
        $this->authorize('view', $item);

        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        $subItems = SubItem::where('item_id', $itemId)
            ->with(['user', 'creator', 'updater'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => SubItemResource::collection($subItems->items()),
            'meta' => [
                'total' => $subItems->total(),
                'per_page' => $subItems->perPage(),
                'current_page' => $subItems->currentPage(),
                'last_page' => $subItems->lastPage(),
                'from' => $subItems->firstItem(),
                'to' => $subItems->lastItem(),
            ],
        ]);
    }

    /**
     * Store a newly created sub-item.
     *
     * @param  \App\Http\Requests\Sample\Item\SubItemRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(SubItemRequest $request)
    {
        $item = Item::findOrFail($request->item_id);
        $this->authorize('view', $item);

        $data = $request->validated();
        
        // Create the sub-item
        $subItem = SubItem::create($data);
        
        // Load relationships for consistent data structure
        $subItem->load(['user', 'creator', 'updater']);

        return (new SubItemResource($subItem))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified sub-item.
     *
     * @param  string  $itemId
     * @param  string  $subItemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $itemId, string $subItemId)
    {
        $item = Item::findOrFail($itemId);
        $this->authorize('view', $item);

        $subItem = SubItem::with(['item', 'user', 'creator', 'updater'])
            ->where('item_id', $itemId)
            ->findOrFail($subItemId);

        return (new SubItemResource($subItem))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Update the specified sub-item.
     *
     * @param  \App\Http\Requests\Sample\Item\SubItemRequest  $request
     * @param  string  $itemId
     * @param  string  $subItemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(SubItemRequest $request, string $itemId, string $subItemId)
    {
        $item = Item::findOrFail($itemId);
        $this->authorize('view', $item);

        $subItem = SubItem::where('item_id', $itemId)
            ->findOrFail($subItemId);

        $data = $request->validated();
        
        // Update the sub-item
        $subItem->update($data);

        return (new SubItemResource($subItem))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Remove the specified sub-item.
     *
     * @param  string  $itemId
     * @param  string  $subItemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $itemId, string $subItemId)
    {
        $item = Item::findOrFail($itemId);
        $this->authorize('view', $item);

        $subItem = SubItem::where('item_id', $itemId)
            ->findOrFail($subItemId);

        $subItem->delete();

        return response()->json(null, 204);
    }
}
