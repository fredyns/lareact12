<?php

namespace App\Actions\Sample\Items\Edit;

use App\Http\Controllers\Controller;
use App\Http\Resources\Sample\ItemResource;
use App\Models\Sample\Item;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Edit Item Action Controller
 *
 * Single-action controller for showing the edit form
 */
class EditItem extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Item $item): Response
    {
        $this->authorize('update', $item);

        $item->load(['user', 'creator', 'updater']);

        return Inertia::render('sample/items/edit', [
            'item' => (new ItemResource($item))->toArray(request()),
        ]);
    }
}
