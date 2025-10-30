<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * NotifyUser Event
 *
 * Triggered after notification is created in database.
 * Checks user preferences and dispatches appropriate channel events.
 *
 * Flow:
 * 1. Check user's notification preferences
 * 2. Dispatch NotifyUserInApp if in-app enabled
 * 3. Dispatch NotifyUserByEmail if email enabled
 *
 * @see \App\Listeners\HandleNotifyUser
 */
class NotifyUser
{
    use Dispatchable, SerializesModels;

    /**
     * Constructor
     *
     * @param Notification $notification The notification to send
     */
    public function __construct(public Notification $notification)
    {
    }
}
