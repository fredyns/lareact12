<?php

namespace App\Actions\Sample\Items\Create;

use App\Actions\Sample\Items\ItemRequest;
use App\Helpers\MoveFilesToUploadPath;
use App\Helpers\Storage;
use App\Http\Controllers\Controller;
use App\Http\Resources\Sample\ItemResource;
use App\Models\Sample\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

/**
 * Store Item Action Controller
 *
 * Single-action controller for creating items
 */
class StoreItem extends Controller
{
    public function __construct(
        protected MoveFilesToUploadPath $moveFilesToUploadPath
    ) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(ItemRequest $request): RedirectResponse|JsonResponse
    {
        $this->authorize('create', Item::class);

        $data = $request->validated();

        // Create a model instance, set UUID & Set an upload path for file operations
        $item = new Item();
        $item->id = (string)Str::uuid();
        $item->upload_path = Storage::generateUploadPath('sample_items', $item->id);

        // Fill with validated data
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
                ->setStatusCode(201);
        }

        return redirect()->route('sample.items.show', $item)
            ->with('success', 'Item created successfully.');
    }
}
