<?php

namespace App\Actions\Sample\Items\Delete;

use App\Helpers\TrashingFiles;
use App\Http\Controllers\Controller;
use App\Models\Sample\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

/**
 * Delete Item Action Controller
 *
 * Single-action controller for deleting items
 */
class DeleteItem extends Controller
{
    public function __construct(
        protected TrashingFiles          $trashingFiles
    ){}

    /**
     * Handle the incoming request.
     */
    public function __invoke(Item $item): RedirectResponse|JsonResponse
    {
        $this->authorize('delete', $item);

        // Move associated files to trash
        $this->trashingFiles->handle($item, ['file', 'image']);

        $item->delete();

        if (request()->wantsJson()) {
            return response()->json(null, 204);// explain
        }

        return redirect()->route('sample.items.index')
            ->with('success', 'Item deleted successfully.');
    }
}
