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

// Note: Notification routes moved to web.php for session-based authentication
// Web pages use session auth, not Sanctum token auth
// Pattern: API endpoints called from web pages should use web routes

// Sample API Routes
Route::middleware('auth:sanctum')->prefix('sample')->name('sample.')->group(function () {
//    Route::apiResource('items', ItemController::class);
});
