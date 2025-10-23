<?php

namespace App\Actions\Sample\SubItems;

use App\Models\Sample\SubItem;
use App\Services\MinioService;

/**
 * Update SubItem Action
 *
 * Handles updating sub-items with file handling
 */
class UpdateSubItem
{
    public function __construct(
        protected MinioService $minioService
    ) {}

    /**
     * Update an existing sub-item
     *
     * @param SubItemRequest $request
     * @param SubItem $subItem
     * @return SubItem
     */
    public function handle(SubItemRequest $request, SubItem $subItem): SubItem
    {
        // Ensure upload_path is set
        if (empty($subItem->upload_path)) {
            $subItem->upload_path = $subItem->generateUploadPath();
        }

        $data = $request->validated();

        // Handle file uploads using MinIO
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($subItem->file) {
                $this->minioService->deleteFile($subItem->file);
            }
            // Move new file to final location
            $data['file'] = $this->minioService->moveToFolder($data['file'], $subItem->upload_path) ?? $data['file'];
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($subItem->image) {
                $this->minioService->deleteFile($subItem->image);
            }
            // Move new image to final location
            $data['image'] = $this->minioService->moveToFolder($data['image'], $subItem->upload_path) ?? $data['image'];
        }

        $subItem->update($data);

        return $subItem->fresh(['item', 'user', 'creator', 'updater']);
    }
}
