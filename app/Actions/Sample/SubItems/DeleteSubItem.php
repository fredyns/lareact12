<?php

namespace App\Actions\Sample\SubItems;

use App\Actions\Sample\Shared\DeleteFilesFromStorage;
use App\Models\Sample\SubItem;

/**
 * Delete SubItem Action
 *
 * Handles deletion of sub-items with file cleanup
 */
class DeleteSubItem
{
    public function __construct(
        protected DeleteFilesFromStorage $deleteFilesFromStorage
    ) {}

    /**
     * Delete a sub-item and its associated files
     *
     * @param SubItem $subItem
     * @return void
     */
    public function handle(SubItem $subItem): void
    {
        // Delete associated files from MinIO
        $this->deleteFilesFromStorage->handle([$subItem->file, $subItem->image]);

        $subItem->delete();
    }
}
