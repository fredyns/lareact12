<?php

namespace App\Actions\Sample\SubItems;

use App\Models\Sample\SubItem;
use Illuminate\Http\Request;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Index SubItems Action
 *
 * Handles listing and filtering of sub-items
 */
class IndexSubItems
{
    /**
     * Get paginated and filtered sub-items
     *
     * @param Request $request
     * @return LengthAwarePaginator
     */
    public function handle(Request $request): LengthAwarePaginator
    {
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
        return $query->paginate(10)->withQueryString();
    }
}
