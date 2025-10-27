<?php

use App\Http\Controllers\Api\NotificationController;
//use App\Http\Controllers\Sample\ItemController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Notification API Routes
Route::middleware('auth:sanctum')->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::get('/count', [NotificationController::class, 'count'])->name('count');
    Route::patch('/{id}/read', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
    Route::patch('/read-all', [NotificationController::class, 'markAllAsRead'])->name('mark-all-as-read');
    Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
});

// Notification Preferences API Routes
Route::middleware('auth:sanctum')->prefix('notification-preferences')->name('notification-preferences.')->group(function () {
    Route::get('/', [NotificationController::class, 'getPreferences'])->name('index');
    Route::put('/', [NotificationController::class, 'updatePreference'])->name('update');
    Route::post('/reset', [NotificationController::class, 'resetPreferences'])->name('reset');
});

// Sample API Routes
Route::middleware('auth:sanctum')->prefix('sample')->name('sample.')->group(function () {
//    Route::apiResource('items', ItemController::class);
});
