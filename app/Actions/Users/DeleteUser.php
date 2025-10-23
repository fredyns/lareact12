<?php

namespace App\Actions\Users;

use App\Models\User;

/**
 * Delete User Action
 *
 * Handles deletion of users
 */
class DeleteUser
{
    /**
     * Delete a user
     *
     * @param User $user
     * @return void
     */
    public function handle(User $user): void
    {
        $user->delete();
    }
}
