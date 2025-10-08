<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        // Create admin role if it doesn't exist
        $adminRoleId = (string)Str::uuid();
        $adminRoleExists = DB::table($tableNames['roles'])->where('name', 'super-admin')->exists();

        if (!$adminRoleExists) {
            DB::table($tableNames['roles'])->insert([
                'id' => $adminRoleId,
                'name' => 'super-admin',
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $adminRoleId = DB::table($tableNames['roles'])->where('name', 'super-admin')->value('id');
        }

        // Create user role if it doesn't exist
        $userRoleId = (string)Str::uuid();
        $userRoleExists = DB::table($tableNames['roles'])->where('name', 'user')->exists();

        if (!$userRoleExists) {
            DB::table($tableNames['roles'])->insert([
                'id' => $userRoleId,
                'name' => 'user',
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $userRoleId = DB::table($tableNames['roles'])->where('name', 'user')->value('id');
        }

        // Create permissions with explicit UUIDs and timestamps
        $permissionIds = [];
        $permissions = [
            'users.index',
            'users.show',
            'users.create',
            'users.update',
            'users.delete',
        ];

        $now = now();
        foreach ($permissions as $permission) {
            $exists = DB::table($tableNames['permissions'])->where('name', $permission)->exists();

            if (!$exists) {
                $permId = (string)Str::uuid();
                DB::table($tableNames['permissions'])->insert([
                    'id' => $permId,
                    'name' => $permission,
                    'guard_name' => 'web',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $permissionIds[$permission] = $permId;
            } else {
                $permissionIds[$permission] = DB::table($tableNames['permissions'])
                    ->where('name', $permission)
                    ->value('id');
            }
        }

        // Assign permissions to admin role
        foreach ($permissionIds as $permName => $permId) {
            $exists = DB::table($tableNames['role_has_permissions'])
                ->where('permission_id', $permId)
                ->where('role_id', $adminRoleId)
                ->exists();

            if (!$exists) {
                DB::table($tableNames['role_has_permissions'])->insert([
                    'permission_id' => $permId,
                    'role_id' => $adminRoleId,
                ]);
            }
        }

        // Assign super-admin role to users
        $adminEmails = [
            'dm@fredyns.id',
            'fredy.ns@bki.co.id',
            'admin@admin.com',
        ];

        $users = User::whereIn('email', $adminEmails)->get();
        foreach ($users as $user) {
            $exists = DB::table($tableNames['model_has_roles'])
                ->where('role_id', $adminRoleId)
                ->where('model_id', $user->id)
                ->where('model_type', User::class)
                ->exists();

            if (!$exists) {
                DB::table($tableNames['model_has_roles'])->insert([
                    'id' => (string)Str::uuid(),
                    'role_id' => $adminRoleId,
                    'model_id' => $user->id,
                    'model_type' => User::class,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');
        // Remove role assignments from admin users
        $adminEmails = [
            'dm@fredyns.id',
            'fredy.ns@bki.co.id',
            'admin@admin.com',
        ];
        
        $users = User::whereIn('email', $adminEmails)->get();
        $adminRoleId = DB::table($tableNames['roles'])->where('name', 'super-admin')->value('id');

        if ($adminRoleId) {
            foreach ($users as $user) {
                DB::table($tableNames['model_has_roles'])
                    ->where('role_id', $adminRoleId)
                    ->where('model_id', $user->id)
                    ->where('model_type', User::class)
                    ->delete();
            }

            // Remove permissions from admin role
            $permissions = [
                'users.index',
                'users.show',
                'users.create',
                'users.update',
                'users.delete',
            ];

            $permissionIds = DB::table($tableNames['permissions'])
                ->whereIn('name', $permissions)
                ->pluck('id')
                ->toArray();

            DB::table($tableNames['role_has_permissions'])
                ->where('role_id', $adminRoleId)
                ->whereIn('permission_id', $permissionIds)
                ->delete();
        }

        // Delete permissions
        DB::table($tableNames['permissions'])
            ->whereIn('name', [
                'users.index',
                'users.show',
                'users.create',
                'users.update',
                'users.delete',
            ])
            ->delete();

        // Delete roles
        DB::table($tableNames['roles'])
            ->whereIn('name', ['super-admin', 'user'])
            ->delete();
    }
};
