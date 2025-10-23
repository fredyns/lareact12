<?php

namespace App\Actions\Sample\Items\Index;

use App\Enums\Sample\ItemEnumerate;
use App\Http\Controllers\Controller;
use App\Http\Resources\Sample\ItemResource;
use App\Models\Sample\Item;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Index Items Action Controller
 *
 * Single-action controller for listing items
 */
class IndexItems extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(IndexItemsRequest $request): AnonymousResourceCollection|Response
    {
        $this->authorize('viewAny', Item::class);

        // Search functionality and build query
        $query = Item::search($request->getSearch())
            ->with(['user', 'creator', 'updater']);

        // Apply additional filters (only if validated)
        if ($userId = $request->validated('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($enumerate = $request->validated('enumerate')) {
            $query->where('enumerate', $enumerate);
        }

        // Apply sorting (already validated)
        $query->orderBy(
            $request->getSortField(),
            $request->getSortDirection()
        );

        // Paginate results
        $items = $query->paginate($request->getPerPage())->withQueryString();

        // Return API response if requested
        if ($request->wantsJson()) {
            return ItemResource::collection($items);
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
            'enumerateOptions' => ItemEnumerate::toSelectOptions(), // todo: remove this and let input component fetch from Enum API
        ]);
    }
}
