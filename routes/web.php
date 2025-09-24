<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\RBAC\RoleController;
use App\Http\Controllers\RBAC\PermissionController;
use App\Http\Controllers\RBAC\UserRoleController;
use App\Http\Controllers\RBAC\UserPermissionController;
use App\Http\Controllers\RBAC\RolePermissionController;
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
        Route::resource('user-roles', UserRoleController::class);
        Route::resource('user-permissions', UserPermissionController::class);
        Route::resource('role-permissions', RolePermissionController::class);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
