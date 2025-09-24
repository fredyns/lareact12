<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Permission;

class PermissionPolicy
{
    /**
     * Determine whether the user can view any permissions.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('permissions.index');
    }

    /**
     * Determine whether the user can view the permission.
     */
    public function view(User $user, Permission $permission): bool
    {
        return $user->can('permissions.show');
    }

    /**
     * Determine whether the user can create permissions.
     */
    public function create(User $user): bool
    {
        return $user->can('permissions.create');
    }

    /**
     * Determine whether the user can update the permission.
     */
    public function update(User $user, Permission $permission): bool
    {
        return $user->can('permissions.update');
    }

    /**
     * Determine whether the user can delete the permission.
     */
    public function delete(User $user, Permission $permission): bool
    {
        // Prevent deletion of permissions that are assigned to roles
        if ($permission->roles()->count() > 0) {
            return false;
        }

        // Prevent deletion of permissions that are directly assigned to users
        if ($permission->users()->count() > 0) {
            return false;
        }

        return $user->can('permissions.delete');
    }
}
