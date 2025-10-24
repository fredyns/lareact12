<?php

namespace App\Actions\Sample\Items\Show;

use App\Http\Controllers\Controller;
use App\Http\Resources\Sample\ItemResource;
use App\Models\Sample\Item;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Show Item Action Controller
 *
 * Single-action controller for displaying an item
 */
class ShowItem extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Item $item): Response|ItemResource
    {
        $this->authorize('view', $item);

        $item->load(['user', 'creator', 'updater']);

        if (request()->wantsJson()) {
            return new ItemResource($item); 
        }

        return Inertia::render('sample/items/show', [
            'item' => (new ItemResource($item))->toArray(request()),
        ]);
    }
}
