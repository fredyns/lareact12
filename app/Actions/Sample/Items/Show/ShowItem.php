<?php

namespace App\Actions\Sample\Items\Show;

use App\Enums\Sample\ItemEnumerate;
use App\Http\Controllers\Controller;
use App\Http\Resources\Sample\ItemResource;
use App\Models\Sample\Item;
use Illuminate\Http\JsonResponse;
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
    public function __invoke(Item $item): Response|JsonResponse
    {
        $this->authorize('view', $item);

        $item->load(['user', 'creator', 'updater']);

        if (request()->wantsJson()) {
            return new ItemResource($item); // todo: there are some method to generate json. standardize these
        }

        return Inertia::render('sample/items/show', [
            'item' => (new ItemResource($item))->toArray(request()),
            'enumerateOptions' => ItemEnumerate::toSelectOptions(),// todo: remove this and let input component fetch from Enum API
        ]);
    }
}
