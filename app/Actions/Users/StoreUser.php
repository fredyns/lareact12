<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Store User Action
 *
 * Handles creation of new users
 */
class StoreUser
{
    /**
     * Create a new user
     *
     * @param Request $request
     * @return User
     */
    public function handle(Request $request): User
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        return User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);
    }
}
