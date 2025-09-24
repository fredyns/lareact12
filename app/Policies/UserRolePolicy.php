<?php

namespace App\Policies;

use App\Models\User;

class UserRolePolicy
{
    /**
     * Determine whether the user can view any user role assignments.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('user-roles.index');
    }

    /**
     * Determine whether the user can view the user role assignment.
     */
    public function view(User $user): bool
    {
        return $user->can('user-roles.show');
    }

    /**
     * Determine whether the user can create user role assignments.
     */
    public function create(User $user): bool
    {
        return $user->can('user-roles.create');
    }

    /**
     * Determine whether the user can delete the user role assignment.
     */
    public function delete(User $user): bool
    {
        return $user->can('user-roles.delete');
    }
}
