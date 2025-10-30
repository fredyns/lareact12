<?php

namespace App\Events;

use App\Models\Sample\Item;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * ItemUpdated Event
 *
 * Fired when an item is updated. Triggers the notification system
 * to send notifications to relevant users.
 *
 * @see \App\Listeners\HandleItemUpdated
 */
class ItemUpdated
{
    use Dispatchable, SerializesModels;

    /**
     * Constructor
     *
     * @param Item $item The item that was updated
     */
    public function __construct(public Item $item)
    {
    }
}
