<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create admin role if it doesn't exist
        $adminRoleId = (string) Str::uuid();
        $adminRoleExists = DB::table('roles')->where('name', 'super-admin')->exists();
        
        if (!$adminRoleExists) {
            DB::table('roles')->insert([
                'id' => $adminRoleId,
                'name' => 'super-admin',
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $adminRoleId = DB::table('roles')->where('name', 'super-admin')->value('id');
        }
        
        // Create user role if it doesn't exist
        $userRoleId = (string) Str::uuid();
        $userRoleExists = DB::table('roles')->where('name', 'user')->exists();
        
        if (!$userRoleExists) {
            DB::table('roles')->insert([
                'id' => $userRoleId,
                'name' => 'user',
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $userRoleId = DB::table('roles')->where('name', 'user')->value('id');
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
            $exists = DB::table('permissions')->where('name', $permission)->exists();
            
            if (!$exists) {
                $permId = (string) Str::uuid();
                DB::table('permissions')->insert([
                    'id' => $permId,
                    'name' => $permission,
                    'guard_name' => 'web',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $permissionIds[$permission] = $permId;
            } else {
                $permissionIds[$permission] = DB::table('permissions')
                    ->where('name', $permission)
                    ->value('id');
            }
        }

        // Assign permissions to admin role
        foreach ($permissionIds as $permName => $permId) {
            $exists = DB::table('role_has_permissions')
                ->where('permission_id', $permId)
                ->where('role_id', $adminRoleId)
                ->exists();
                
            if (!$exists) {
                DB::table('role_has_permissions')->insert([
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
            $exists = DB::table('model_has_roles')
                ->where('role_id', $adminRoleId)
                ->where('model_id', $user->id)
                ->where('model_type', User::class)
                ->exists();
                
            if (!$exists) {
                DB::table('model_has_roles')->insert([
                    'id' => (string) Str::uuid(),
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
        // Remove role assignments from admin users
        $adminEmails = [
            'dm@fredyns.id',
            'fredy.ns@bki.co.id',
            'admin@admin.com',
        ];
        
        $users = User::whereIn('email', $adminEmails)->get();
        $adminRoleId = DB::table('roles')->where('name', 'super-admin')->value('id');
        
        if ($adminRoleId) {
            foreach ($users as $user) {
                DB::table('model_has_roles')
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
            
            $permissionIds = DB::table('permissions')
                ->whereIn('name', $permissions)
                ->pluck('id')
                ->toArray();
                
            DB::table('role_has_permissions')
                ->where('role_id', $adminRoleId)
                ->whereIn('permission_id', $permissionIds)
                ->delete();
        }

        // Delete permissions
        DB::table('permissions')
            ->whereIn('name', [
                'users.index',
                'users.show',
                'users.create',
                'users.update',
                'users.delete',
            ])
            ->delete();

        // Delete roles
        DB::table('roles')
            ->whereIn('name', ['super-admin', 'user'])
            ->delete();
    }
};
