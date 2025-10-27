<?php

namespace App\Providers;

use App\Events\ItemCreated;
use App\Listeners\SendItemCreatedNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

/**
 * EventServiceProvider
 *
 * Registers event listeners for the application.
 * Maps events to their corresponding listeners.
 *
 * @see \App\Events\ItemCreated
 * @see \App\Listeners\SendItemCreatedNotification
 */
class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * Maps event classes to their listener classes.
     * Multiple listeners can be registered for a single event.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        ItemCreated::class => [
            SendItemCreatedNotification::class,
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
