<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds permissions for sample_items table:
     * - sample.items.index
     * - sample.items.show
     * - sample.items.create
     * - sample.items.update
     * - sample.items.delete
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $permissions = [
            'sample.items.index',
            'sample.items.show',
            'sample.items.create',
            'sample.items.update',
            'sample.items.delete',
        ];


        // Create permissions with explicit UUIDs and timestamps
        $permissionIds = [];
        $now = now();
        
        foreach ($permissions as $permission) {
            $exists = DB::table($tableNames['permissions'])->where('name', $permission)->exists();
            
            if (!$exists) {
                $permId = (string) Str::uuid();
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
        
        // Find the super-admin role and assign all sample items permissions
        $superAdminRoleId = DB::table($tableNames['roles'])->where('name', 'super-admin')->value('id');
        if ($superAdminRoleId) {
            foreach ($permissionIds as $permName => $permId) {
                $exists = DB::table($tableNames['role_has_permissions'])
                    ->where('permission_id', $permId)
                    ->where('role_id', $superAdminRoleId)
                    ->exists();
                    
                if (!$exists) {
                    DB::table($tableNames['role_has_permissions'])->insert([
                        'permission_id' => $permId,
                        'role_id' => $superAdminRoleId,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');
        $permissions = [
            'sample.items.index',
            'sample.items.show',
            'sample.items.create',
            'sample.items.update',
            'sample.items.delete',
        ];

        // Remove permissions from super-admin role
        $superAdminRoleId = DB::table($tableNames['roles'])->where('name', 'super-admin')->value('id');
        if ($superAdminRoleId) {
            $permissionIds = DB::table($tableNames['permissions'])
                ->whereIn('name', $permissions)
                ->pluck('id')
                ->toArray();
                
            DB::table($tableNames['role_has_permissions'])
                ->where('role_id', $superAdminRoleId)
                ->whereIn('permission_id', $permissionIds)
                ->delete();
        }

        // Delete permissions
        DB::table($tableNames['permissions'])
            ->whereIn('name', $permissions)
            ->delete();
    }
};
