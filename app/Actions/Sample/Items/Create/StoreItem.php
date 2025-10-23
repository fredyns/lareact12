<?php

namespace App\Actions\Sample\Items\Create;

use App\Actions\Sample\Items\ItemRequest;
use App\Actions\Sample\Shared\MoveFilesToFinalLocation;
use App\Http\Controllers\Controller;
use App\Http\Resources\Sample\ItemResource;
use App\Models\Sample\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

/**
 * Store Item Action Controller
 *
 * Single-action controller for creating items
 */
class StoreItem extends Controller
{
    public function __construct(
        protected MoveFilesToFinalLocation $moveFilesToFinalLocation
    ) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(ItemRequest $request): RedirectResponse|JsonResponse
    {
        $this->authorize('create', Item::class);

        $data = $request->validated();

        // Create the item first to generate ID and upload_path
        $item = Item::create($data);

        // Move uploaded files from temporary location to final location
        $this->moveFilesToFinalLocation->handle($item);

        $item = $item->fresh(['user', 'creator', 'updater']); // explain

        if ($request->wantsJson()) {
            return (new ItemResource($item))
                ->response()
                ->setStatusCode(201);
        }

        return redirect()->route('sample.items.show', $item)
            ->with('success', 'Item created successfully.');
    }
}
