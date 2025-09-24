<?php

namespace App\Policies;

use App\Models\User;

class UserPermissionPolicy
{
    /**
     * Determine whether the user can view any user permission assignments.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('user-permissions.index');
    }

    /**
     * Determine whether the user can view the user permission assignment.
     */
    public function view(User $user): bool
    {
        return $user->can('user-permissions.show');
    }

    /**
     * Determine whether the user can create user permission assignments.
     */
    public function create(User $user): bool
    {
        return $user->can('user-permissions.create');
    }

    /**
     * Determine whether the user can delete the user permission assignment.
     */
    public function delete(User $user): bool
    {
        return $user->can('user-permissions.delete');
    }
}
