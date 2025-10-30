<?php

namespace App\Events\Sample;

use App\Models\Sample\Item;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * ItemCreated Event
 *
 * Fired when a new item is created. Triggers the notification system
 * to send notifications to relevant users.
 *
 */
class ItemCreated
{
    use Dispatchable, SerializesModels;

    /**
     * Constructor
     *
     * @param mixed $model The item model that was created
     */
    public function __construct(public Item $model)
    {
    }
}
