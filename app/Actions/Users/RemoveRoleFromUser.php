<?php

namespace App\Actions\Users;

use App\Models\RBAC\Role;
use App\Models\User;

/**
 * Remove Role from User Action
 *
 * Handles removing a role from a user
 */
class RemoveRoleFromUser
{
    /**
     * Remove a role from a user
     *
     * @param User $user
     * @param string $roleId
     * @return array{success: bool, message: string, role: Role}
     */
    public function handle(User $user, string $roleId): array
    {
        $role = Role::findById($roleId);

        if ($user->hasRole($role)) {
            $user->removeRole($role);
            return [
                'success' => true,
                'message' => "Role '{$role->name}' removed successfully.",
                'role' => $role,
            ];
        }

        return [
            'success' => false,
            'message' => "User doesn't have the role '{$role->name}'.",
            'role' => $role,
        ];
    }
}
