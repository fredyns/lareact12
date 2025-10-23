<?php

namespace App\Actions\Sample\SubItems;

use App\Actions\Sample\Shared\MoveFilesToFinalLocation;
use App\Models\Sample\SubItem;

/**
 * Store SubItem Action
 *
 * Handles creation of new sub-items with file handling
 */
class StoreSubItem
{
    public function __construct(
        protected MoveFilesToFinalLocation $moveFilesToFinalLocation
    ) {}

    /**
     * Create a new sub-item
     *
     * @param SubItemRequest $request
     * @return SubItem
     */
    public function handle(SubItemRequest $request): SubItem
    {
        $data = $request->validated();

        // Create the sub-item first to generate ID and upload_path
        $subItem = SubItem::create($data);

        // Move uploaded files from temporary location to final location
        $this->moveFilesToFinalLocation->handle($subItem);

        return $subItem->fresh(['item', 'user', 'creator', 'updater']);
    }
}
