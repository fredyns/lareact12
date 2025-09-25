<?php

use App\Http\Controllers\Sample\ItemController;
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

// API endpoint for users dropdown
Route::middleware('auth:sanctum')->get('/users', function (Request $request) {
    $search = $request->input('search', '');
    $users = \App\Models\User::where('name', 'like', "%{$search}%")
        ->orWhere('email', 'like', "%{$search}%")
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

// Sample API Routes
Route::middleware('auth:sanctum')->prefix('sample')->name('sample.')->group(function () {
    Route::apiResource('items', ItemController::class);
});
