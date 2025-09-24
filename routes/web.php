<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\RBAC\RoleController;
use App\Http\Controllers\RBAC\PermissionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // User Management Routes
    Route::resource('users', UserController::class);

    // RBAC Routes with prefix and namespace
    Route::prefix('rbac')->name('rbac.')->group(function () {
        Route::resource('roles', RoleController::class);
        Route::resource('permissions', PermissionController::class);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
