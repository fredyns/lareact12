<?php

namespace App\Policies\Sample;

use App\Enums\UserRole;
use App\Models\Sample\SubItem;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Policy for SubItem model
 * 
 * Maps policy methods to permissions:
 * - viewAny → sample.sub-items.index
 * - view → sample.sub-items.show
 * - create → sample.sub-items.create
 * - update → sample.sub-items.update
 * - delete → sample.sub-items.delete
 */
class SubItemPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any sub-items.
     *
     * @param  \App\Models\User  $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN->value)) {
            return true;
        }

        return $user->can('sample.sub-items.index');
    }

    /**
     * Determine whether the user can view the sub-item.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Sample\SubItem  $subItem
     * @return bool
     */
    public function view(User $user, SubItem $subItem): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN->value)) {
            return true;
        }

        return $user->can('sample.sub-items.show');
    }

    /**
     * Determine whether the user can create sub-items.
     *
     * @param  \App\Models\User  $user
     * @return bool
     */
    public function create(User $user): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN->value)) {
            return true;
        }

        return $user->can('sample.sub-items.create');
    }

    /**
     * Determine whether the user can update the sub-item.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Sample\SubItem  $subItem
     * @return bool
     */
    public function update(User $user, SubItem $subItem): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN->value)) {
            return true;
        }

        return $user->can('sample.sub-items.update');
    }

    /**
     * Determine whether the user can delete the sub-item.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Sample\SubItem  $subItem
     * @return bool
     */
    public function delete(User $user, SubItem $subItem): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN->value)) {
            return true;
        }

        return $user->can('sample.sub-items.delete');
    }
}
