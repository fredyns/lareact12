<?php

namespace App\Actions\Users;

use App\Models\RBAC\Role;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * Assign Role to User Action
 *
 * Handles assigning a role to a user
 */
class AssignRoleToUser
{
    /**
     * Assign a role to a user
     *
     * @param Request $request
     * @param User $user
     * @return array{success: bool, message: string, role: Role}
     */
    public function handle(Request $request, User $user): array
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findById($validated['role_id']);

        if (!$user->hasRole($role)) {
            $user->assignRole($role);
            return [
                'success' => true,
                'message' => "Role '{$role->name}' assigned successfully.",
                'role' => $role,
            ];
        }

        return [
            'success' => false,
            'message' => "User already has the role '{$role->name}'.",
            'role' => $role,
        ];
    }
}
