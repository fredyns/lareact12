<?php

namespace App\Actions\Sample\SubItems;

use App\Models\Sample\SubItem;

/**
 * Show SubItem Action
 *
 * Handles loading a single sub-item with relationships
 */
class ShowSubItem
{
    /**
     * Load sub-item with relationships
     *
     * @param SubItem $subItem
     * @return SubItem
     */
    public function handle(SubItem $subItem): SubItem
    {
        return $subItem->load(['item', 'user', 'creator', 'updater']);
    }
}
