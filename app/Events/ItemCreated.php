<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * ItemCreated Event
 *
 * Fired when a new item is created. Triggers the notification system
 * to send notifications to relevant users.
 *
 * @see \App\Listeners\SendItemCreatedNotification
 */
class ItemCreated
{
    use Dispatchable, SerializesModels;

    /**
     * Constructor
     *
     * @param mixed $model The item model that was created
     */
    public function __construct(public $model)
    {
    }
}
