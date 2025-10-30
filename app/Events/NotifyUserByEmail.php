<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * NotifyUserByEmail Event
 *
 * Triggered to send notification via email.
 * Listener will queue the email job for async delivery.
 *
 * @see \App\Listeners\HandleNotifyUserByEmail
 */
class NotifyUserByEmail
{
    use Dispatchable, SerializesModels;

    /**
     * Constructor
     *
     * @param Notification $notification The notification to send via email
     */
    public function __construct(public Notification $notification)
    {
    }
}
