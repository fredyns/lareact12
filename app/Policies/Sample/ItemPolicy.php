<?php

namespace App\Policies\Sample;

use App\Enums\UserRole;
use App\Models\Sample\Item;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Policy for Item model
 * 
 * Maps policy methods to permissions:
 * - viewAny → sample.items.index
 * - view → sample.items.show
 * - create → sample.items.create
 * - update → sample.items.update
 * - delete → sample.items.delete
 */
class ItemPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any items.
     *
     * @param  \App\Models\User  $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN->value)) {
            return true;
        }

        return $user->can('sample.items.index');
    }

    /**
     * Determine whether the user can view the item.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Sample\Item  $item
     * @return bool
     */
    public function view(User $user, Item $item): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN->value)) {
            return true;
        }

        return $user->can('sample.items.show');
    }

    /**
     * Determine whether the user can create items.
     *
     * @param  \App\Models\User  $user
     * @return bool
     */
    public function create(User $user): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN->value)) {
            return true;
        }

        return $user->can('sample.items.create');
    }

    /**
     * Determine whether the user can update the item.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Sample\Item  $item
     * @return bool
     */
    public function update(User $user, Item $item): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN->value)) {
            return true;
        }

        return $user->can('sample.items.update');
    }

    /**
     * Determine whether the user can delete the item.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Sample\Item  $item
     * @return bool
     */
    public function delete(User $user, Item $item): bool
    {
        if ($user->hasRole(UserRole::SUPER_ADMIN->value)) {
            return true;
        }

        return $user->can('sample.items.delete');
    }
}
