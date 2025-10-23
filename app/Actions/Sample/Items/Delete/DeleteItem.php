<?php

namespace App\Actions\Sample\Items\Delete;

use App\Actions\Sample\Shared\DeleteFilesFromStorage;
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
        protected DeleteFilesFromStorage $deleteFilesFromStorage
    ) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(Item $item): RedirectResponse|JsonResponse
    {
        $this->authorize('delete', $item);

        // Delete associated files from MinIO
        $this->deleteFilesFromStorage->handle([$item->file, $item->image]);

        $item->delete();

        if (request()->wantsJson()) {
            return response()->json(null, 204);// explain
        }

        return redirect()->route('sample.items.index')
            ->with('success', 'Item deleted successfully.');
    }
}
