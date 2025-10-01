<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule) {
        // Clean up orphaned temporary files older than 1 day
        // Runs daily at 2:00 AM
        $schedule->command('files:cleanup-orphaned --days=1')
            ->dailyAt('02:00')
            ->onSuccess(function () {
                \Log::info('Orphaned files cleanup completed successfully');
            })
            ->onFailure(function () {
                \Log::error('Orphaned files cleanup failed');
            });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
