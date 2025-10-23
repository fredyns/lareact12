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

        $selectColumns = array_map(fn($col) => "sample_items.{$col}", $queryColumns);

        // Search functionality and build query
        $query = Item::search($request->getSearch());

        // Apply sorting (before select to handle joins properly)
        $sortField = $request->getSortField();
        $sortDirection = $request->getSortDirection();

        // Text fields that should use case-insensitive sorting
        $textFields = ['user_id', 'string', 'email', 'color', 'npwp', 'ip_address', 'enumerate'];

        if ($sortField === 'user_id') {
            // Sort by user's name using relationship join (case-insensitive)
            $query->leftJoin('users', 'sample_items.user_id', '=', 'users.id')
                ->orderByInsensitive('users.name', $sortDirection);
        } elseif (in_array($sortField, $textFields)) {
            // Case-insensitive sorting for text fields
            $query->orderByInsensitive("sample_items.{$sortField}", $sortDirection);
        } else {
            // Regular sorting for numeric/date fields
            $query->orderBy('sample_items.' . $sortField, $sortDirection);
        }

        // Apply select after joins
        $query->select($selectColumns);

        // Load relationships with optimized select to reduce data transfer
        // Only load necessary columns for each relationship
        $with = [
            'creator:id,name',  // Only load id and name for creator
            'updater:id,name',  // Only load id and name for updater
        ];
        if (in_array('user_id', $queryColumns)) {
            $with[] = 'user:id,name,email';  // Only load necessary user fields
        }
        $query->with($with);

        // Apply additional filters (only if validated)
        if ($userId = $request->validated('user_id')) {
            $query->where('sample_items.user_id', $userId);
        }

        if ($enumerate = $request->validated('enumerate')) {
            $query->where('sample_items.enumerate', $enumerate);
        }

        // Paginate results
        $items = $query->paginate($request->getPerPage())->withQueryString();

        // Return API response if requested
        if ($request->wantsJson()) {
            return ItemResource::collection($items);
        }

        // Return Inertia view
        return Inertia::render('sample/items/index', [
            'items' => [
                'data' => ItemResource::collection($items->items())->resolve(),
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
