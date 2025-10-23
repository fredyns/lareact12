<?php

namespace App\Actions\Sample\Items\Index;

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

        $mandatoryColumns = ['id', 'created_at', 'updated_at']; //internal use
        $defaultDisplayColumns = ['string', 'email', 'enumerate']; // when invalid or none selected
        $displayColumns = $request->getColumns($defaultDisplayColumns); // get validated selection
        $queryColumns = array_unique(array_merge($mandatoryColumns, $displayColumns)); // for database query

        // Search functionality and build query
        $query = Item::search($request->getSearch())
            ->select($queryColumns);

        // Load relationships. creator and updater for audit trail
        $with = ['creator', 'updater'];
        if (in_array('user_id', $queryColumns)) {
            $with[] = 'user';
        }
        $query->with($with);

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
            'selectedColumns' => $displayColumns,
        ]);
    }
}
