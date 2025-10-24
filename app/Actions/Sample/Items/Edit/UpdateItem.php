<?php

namespace App\Actions\Sample\Items\Edit;

use App\Actions\Sample\Items\ItemRequest;
use App\Helpers\MoveFilesToUploadPath;
use App\Http\Controllers\Controller;
use App\Http\Resources\Sample\ItemResource;
use App\Models\Sample\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

/**
 * Update Item Action Controller
 *
 * Single-action controller for updating items
 */
class UpdateItem extends Controller
{
    public function __construct(
        protected MoveFilesToUploadPath $moveFilesToUploadPath
    ) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(ItemRequest $request, Item $item): RedirectResponse|JsonResponse
    {
        $this->authorize('update', $item);

        // Ensure upload_path is set
        if (empty($item->upload_path)) {
            $item->upload_path = $item->generateUploadPath();
        }

        $data = $request->validated();

        // Fill the model with validated data
        $item->fill($data);

        // Move uploaded files to the final location
        $this->moveFilesToUploadPath->handle($item, ['file', 'image']);

        // Save everything in a single operation
        $item->save();

        // Refresh relationships
        $item->load(['user', 'creator', 'updater']);

        if ($request->wantsJson()) {
            return (new ItemResource($item))
                ->response()
                ->setStatusCode(200);
        }

        return redirect()->route('sample.items.show', $item)
            ->with('success', 'Item updated successfully.');
    }
}
