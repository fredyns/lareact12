<?php

namespace App\Policies;

use App\Models\User;

class RolePermissionPolicy
{
    /**
     * Determine whether the user can view any role permission assignments.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('role-permissions.index');
    }

    /**
     * Determine whether the user can view the role permission assignment.
     */
    public function view(User $user): bool
    {
        return $user->can('role-permissions.show');
    }

    /**
     * Determine whether the user can create role permission assignments.
     */
    public function create(User $user): bool
    {
        return $user->can('role-permissions.create');
    }

    /**
     * Determine whether the user can delete the role permission assignment.
     */
    public function delete(User $user): bool
    {
        return $user->can('role-permissions.delete');
    }
}
