<?php

namespace App\Database\Migrations;

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Base class for permission migrations.
 * 
 * Simplifies adding permissions and assigning them to roles.
 * Supports multiple guards (web, sanctum, api).
 * 
 * Basic Usage (web guard - default):
 * 
 * public function up(): void
 * {
 *     $this->addPermissions([
 *         'users.index',
 *         'users.show',
 *         'users.create',
 *         'users.update',
 *         'users.delete',
 *     ]);
 * 
 *     $this->assign(UserRole::SUPER_ADMIN, [
 *         'users.index',
 *         'users.show',
 *         'users.create',
 *         'users.update',
 *         'users.delete',
 *     ]);
 * 
 *     $this->assign(UserRole::USER, [
 *         'users.index',
 *         'users.show',
 *     ]);
 * }
 * 
 * Multiple Guards Usage:
 * 
 * public function up(): void
 * {
 *     // Web guard (default)
 *     $this->addPermissions(['users.index', 'users.show']);
 *     $this->assign(UserRole::SUPER_ADMIN, ['users.index', 'users.show']);
 * 
 *     // Sanctum guard for API
 *     $this->guard('sanctum')
 *          ->addPermissions(['api.users.index', 'api.users.show'])
 *          ->assign(UserRole::SUPER_ADMIN, ['api.users.index']);
 * 
 *     // Or specify guard directly
 *     $this->addPermissions(['api.posts.index'], 'api');
 * }
 * 
 * public function down(): void
 * {
 *     $this->removePermissions(['users.index', 'users.show']);
 *     $this->guard('sanctum')->removePermissions(['api.users.index', 'api.users.show']);
 * }
 */
abstract class BasePermissionMigration extends Migration
{
    /**
     * Cache for table names from config
     */
    protected array $tableNames;

    /**
     * Cache for permission IDs
     */
    protected array $permissionIds = [];

    /**
     * Cache for role IDs
     */
    protected array $roleIds = [];

    /**
     * Default guard name
     */
    protected string $guardName = 'web';

    /**
     * Initialize table names
     */
    public function __construct()
    {
        $this->tableNames = config('permission.table_names');
    }

    /**
     * Set the guard name for permissions and roles
     * 
     * @param string $guard Guard name (web, sanctum, api)
     * @return self
     */
    protected function guard(string $guard): self
    {
        $this->guardName = $guard;
        return $this;
    }

    /**
     * Add permissions to the database
     * 
     * @param array $permissions Array of permission names
     * @param string|null $guard Guard name (defaults to current guard)
     * @return void
     */
    protected function addPermissions(array $permissions, ?string $guard = null): void
    {
        $guard = $guard ?? $this->guardName;
        $now = now();

        foreach ($permissions as $permission) {
            $exists = DB::table($this->tableNames['permissions'])
                ->where('name', $permission)
                ->where('guard_name', $guard)
                ->exists();

            if (!$exists) {
                $permId = (string) Str::uuid();
                DB::table($this->tableNames['permissions'])->insert([
                    'id' => $permId,
                    'name' => $permission,
                    'guard_name' => $guard,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $this->permissionIds[$permission] = $permId;
            } else {
                $this->permissionIds[$permission] = DB::table($this->tableNames['permissions'])
                    ->where('name', $permission)
                    ->where('guard_name', $guard)
                    ->value('id');
            }
        }
    }

    /**
     * Assign permissions to a role
     * 
     * @param UserRole $role The role enum
     * @param array $permissions Array of permission names
     * @return void
     */
    protected function assign(UserRole $role, array $permissions): void
    {
        $roleId = $this->getRoleId($role);

        if (!$roleId) {
            // Create role if it doesn't exist
            $roleId = $this->createRole($role);
        }

        foreach ($permissions as $permission) {
            $permId = $this->getPermissionId($permission);

            if (!$permId) {
                throw new \Exception("Permission '{$permission}' does not exist. Call addPermissions() first.");
            }

            $exists = DB::table($this->tableNames['role_has_permissions'])
                ->where('permission_id', $permId)
                ->where('role_id', $roleId)
                ->exists();

            if (!$exists) {
                DB::table($this->tableNames['role_has_permissions'])->insert([
                    'permission_id' => $permId,
                    'role_id' => $roleId,
                ]);
            }
        }
    }

    /**
     * Remove permissions from a role
     * 
     * @param UserRole $role The role enum
     * @param array $permissions Array of permission names
     * @return void
     */
    protected function unassign(UserRole $role, array $permissions): void
    {
        $roleId = $this->getRoleId($role);

        if (!$roleId) {
            return;
        }

        $permissionIds = DB::table($this->tableNames['permissions'])
            ->whereIn('name', $permissions)
            ->pluck('id')
            ->toArray();

        DB::table($this->tableNames['role_has_permissions'])
            ->where('role_id', $roleId)
            ->whereIn('permission_id', $permissionIds)
            ->delete();
    }

    /**
     * Remove permissions from the database
     * 
     * @param array $permissions Array of permission names
     * @param string|null $guard Guard name (defaults to current guard)
     * @return void
     */
    protected function removePermissions(array $permissions, ?string $guard = null): void
    {
        $guard = $guard ?? $this->guardName;

        // First remove all role assignments
        $permissionIds = DB::table($this->tableNames['permissions'])
            ->whereIn('name', $permissions)
            ->where('guard_name', $guard)
            ->pluck('id')
            ->toArray();

        DB::table($this->tableNames['role_has_permissions'])
            ->whereIn('permission_id', $permissionIds)
            ->delete();

        // Then delete the permissions
        DB::table($this->tableNames['permissions'])
            ->whereIn('name', $permissions)
            ->where('guard_name', $guard)
            ->delete();
    }

    /**
     * Get role ID from cache or database
     * 
     * @param UserRole $role
     * @param string|null $guard Guard name (defaults to current guard)
     * @return string|null
     */
    protected function getRoleId(UserRole $role, ?string $guard = null): ?string
    {
        $guard = $guard ?? $this->guardName;
        $roleName = $role->value;
        $cacheKey = "{$roleName}@{$guard}";

        if (isset($this->roleIds[$cacheKey])) {
            return $this->roleIds[$cacheKey];
        }

        $roleId = DB::table($this->tableNames['roles'])
            ->where('name', $roleName)
            ->where('guard_name', $guard)
            ->value('id');

        if ($roleId) {
            $this->roleIds[$cacheKey] = $roleId;
        }

        return $roleId;
    }

    /**
     * Create a role if it doesn't exist
     * 
     * @param UserRole $role
     * @param string|null $guard Guard name (defaults to current guard)
     * @return string Role ID
     */
    protected function createRole(UserRole $role, ?string $guard = null): string
    {
        $guard = $guard ?? $this->guardName;
        $roleName = $role->value;
        $roleId = (string) Str::uuid();

        DB::table($this->tableNames['roles'])->insert([
            'id' => $roleId,
            'name' => $roleName,
            'guard_name' => $guard,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->roleIds[$roleName] = $roleId;

        return $roleId;
    }

    /**
     * Get permission ID from cache or database
     * 
     * @param string $permission
     * @param string|null $guard Guard name (defaults to current guard)
     * @return string|null
     */
    protected function getPermissionId(string $permission, ?string $guard = null): ?string
    {
        $guard = $guard ?? $this->guardName;
        $cacheKey = "{$permission}@{$guard}";

        if (isset($this->permissionIds[$cacheKey])) {
            return $this->permissionIds[$cacheKey];
        }

        $permId = DB::table($this->tableNames['permissions'])
            ->where('name', $permission)
            ->where('guard_name', $guard)
            ->value('id');

        if ($permId) {
            $this->permissionIds[$cacheKey] = $permId;
        }

        return $permId;
    }

    /**
     * Ensure role exists (creates if needed)
     * 
     * @param UserRole $role
     * @return string Role ID
     */
    protected function ensureRole(UserRole $role): string
    {
        $roleId = $this->getRoleId($role);

        if (!$roleId) {
            $roleId = $this->createRole($role);
        }

        return $roleId;
    }
}
