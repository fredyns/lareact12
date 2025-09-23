<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // basic roles
        $adminRole = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

        // permissions to access users
        $batch = [
            ['name' => 'users.index', 'guard_name' => 'web'],
            ['name' => 'users.show', 'guard_name' => 'web'],
            ['name' => 'users.create', 'guard_name' => 'web'],
            ['name' => 'users.update', 'guard_name' => 'web'],
            ['name' => 'users.delete', 'guard_name' => 'web'],
        ];
        Permission::insert($batch);

        $adminRole->givePermissionTo($this->searchPermissions('users'));

        // assign super-admin to users
        $adminEmails = [
            'dm@fredyns.id',
            'fredy.ns@bki.co.id',
            'admin@admin.com',
        ];
        $admins = User::whereIn('email', $adminEmails)->get();
        foreach ($admins as $admin) {
            $admin->assignRole($adminRole);
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
        $admins = User::whereIn('email', $adminEmails)->get();
        foreach ($admins as $admin) {
            $admin->removeRole('super-admin');
        }

        // Remove permissions from roles
        $adminRole = Role::where('name', 'super-admin')->first();
        if ($adminRole) {
            $adminRole->revokePermissionTo($this->searchPermissions('users'));
        }

        // Delete permissions
        Permission::whereIn('name', [
            'users.index',
            'users.show',
            'users.create',
            'users.update',
            'users.delete',
        ])->delete();

        // Delete roles
        Role::whereIn('name', ['super-admin', 'user'])->delete();
    }

    protected function searchPermissions($search)
    {
        $dbConnection = config('database.default', 'mysql');
        $searchOperator = ($dbConnection == 'pgsql') ? 'ilike' : 'like';
        return Permission::where('name', $searchOperator, "{$search}.%")->get();
    }
};
