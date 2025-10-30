<?php

namespace App\Providers;

use App\Events\ItemCreated;
use App\Events\ItemUpdated;
use App\Events\NotifyUser;
use App\Events\NotifyUserByEmail;
use App\Listeners\HandleItemCreated;
use App\Listeners\HandleItemUpdated;
use App\Listeners\HandleNotifyUser;
use App\Listeners\HandleNotifyUserByEmail;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

/**
 * EventServiceProvider
 *
 * Registers event listeners for the application.
 * Implements multi-step event-driven notification system with FOW pattern.
 *
 * Event Flow:
 * 1. ItemCreated/ItemUpdated → HandleItemCreated/HandleItemUpdated (FOW batch insert)
 * 2. NotifyUser → HandleNotifyUser (check preferences)
 * 3. NotifyUserInApp → Broadcasts to Reverb (real-time)
 * 4. NotifyUserByEmail → HandleNotifyUserByEmail (send email)
 */
class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * Multi-step event chain:
     * - Step 1: Item events trigger FOW batch insert
     * - Step 2: NotifyUser checks preferences and dispatches channel events
     * - Step 3: Channel-specific events handle delivery
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // Step 1: Item events (FOW - batch insert notifications)
        ItemCreated::class => [
            HandleItemCreated::class,
        ],
        ItemUpdated::class => [
            HandleItemUpdated::class,
        ],

        // Step 2: Check preferences and dispatch to channels
        NotifyUser::class => [
            HandleNotifyUser::class,
        ],

        // Step 3: Channel-specific delivery
        // NotifyUserInApp is a broadcast event (ShouldBroadcastNow)
        // so it doesn't need a listener - it broadcasts automatically
        
        NotifyUserByEmail::class => [
            HandleNotifyUserByEmail::class,
        ],
    ];

    /**
     * Register any events for your application.
     *
     * Called during application bootstrap.
     *
     * @return void
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     *
     * Set to false to use explicit event/listener registration.
     *
     * @return bool
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
