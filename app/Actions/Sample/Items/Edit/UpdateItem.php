<?php

namespace App\Actions\Sample\Items\Edit;

use App\Actions\Sample\Items\ItemRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\Sample\ItemResource;
use App\Models\Sample\Item;
use App\Services\MinioService;
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
        protected MinioService $minioService
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

        // Handle file uploads using MinIO
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($item->file) {
                $this->minioService->deleteFile($item->file);
            }
            // Move new file to final location
            $data['file'] = $this->minioService->moveToFolder($data['file'], $item->upload_path) ?? $data['file'];
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($item->image) {
                $this->minioService->deleteFile($item->image);
            }
            // Move new image to final location
            $data['image'] = $this->minioService->moveToFolder($data['image'], $item->upload_path) ?? $data['image'];
        }

        $item->update($data);
        $item = $item->fresh(['user', 'creator', 'updater']);

        if ($request->wantsJson()) {
            return (new ItemResource($item))
                ->response()
                ->setStatusCode(200);// todo: standardize json output
        }

        return redirect()->route('sample.items.show', $item)
            ->with('success', 'Item updated successfully.');
    }
}
