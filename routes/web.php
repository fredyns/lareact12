<?php

use App\Http\Controllers\DownloadController;
use App\Http\Controllers\EnumController;
use App\Http\Controllers\RBAC\PermissionController;
use App\Http\Controllers\RBAC\RoleController;
use App\Http\Controllers\Sample\ItemController;
use App\Http\Controllers\Sample\SubItemController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/landing/home');
})->name('home');

// Landing Pages Routes - Public (no auth required)
Route::prefix('landing')->name('landing.')->group(function () {
    Route::get('home', function () {
        return Inertia::render('landing/home');
    })->name('home');

    Route::get('services', function () {
        return Inertia::render('landing/services');
    })->name('services');

    Route::get('about', function () {
        return Inertia::render('landing/about');
    })->name('about');
});

// File Download Routes - Serve files from S3/MinIO through application domain
Route::get('downloads/{path}', [DownloadController::class, 'serve'])
    ->where('path', '.*')
    ->name('downloads.serve');

Route::get('downloading/{path}', [DownloadController::class, 'download'])
    ->where('path', '.*')
    ->name('downloads.force');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Enum API Routes
    Route::get('enums/{enumClass}', [EnumController::class, 'show'])->name('enums.show');

    // Select Options Routes with prefix and namespace
    Route::prefix('select-options')->name('select-options.')->group(function () {
        // API endpoint for users dropdown
        Route::get('users', function (Request $request) {
            $search = (string)$request->input('search', '');
            $users = \App\Models\User::search($search)
                ->select('id', 'name', 'email')
                ->limit(10)
                ->get()
                ->map(function ($user) {
                    return [
                        'value' => $user->id,
                        'label' => $user->name . ' (' . $user->email . ')',
                    ];
                });

            return response()->json($users);
        });
    });

    // Generic Upload Routes for MinIO
    Route::prefix('upload')->name('upload.')->group(function () {
        Route::post('file', [UploadController::class, 'uploadFile'])->name('file');
        Route::post('image', [UploadController::class, 'uploadImage'])->name('image');
    });

    // User Management Routes
    Route::resource('users', UserController::class);

    // User Role Management Routes
    Route::post('users/{user}/roles', [UserController::class, 'addRole'])->name('users.roles.add');
    Route::delete('users/{user}/roles/{role}', [UserController::class, 'removeRole'])->name('users.roles.remove');

    // RBAC Routes with prefix and namespace
    Route::prefix('rbac')->name('rbac.')->group(function () {
        Route::resource('roles', RoleController::class);
        Route::resource('permissions', PermissionController::class);
    });

    // Sample Routes with prefix and namespace
    Route::prefix('sample')->name('sample.')->group(function () {
        Route::resource('items', ItemController::class);
        Route::resource('sub-items', SubItemController::class);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
