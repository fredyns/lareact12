<?php

use App\Enums\UserRole;

return new class extends \App\Database\Migrations\BasePermissionMigration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $webPermissions = [
            'users.index',
            'users.show',
            'users.create',
            'users.update',
            'users.delete',
        ];
        $sanctumPermissions = [
            'api.users.index',
            'api.users.show',
            'api.users.create',
            'api.users.update',
            'api.users.delete',
        ];
        $this->addPermissions($webPermissions, 'web');
        $this->addPermissions($sanctumPermissions, 'sanctum');

        $this->guard('web')->assign(UserRole::SUPER_ADMIN, $webPermissions);
        $this->guard('sanctum')->assign(UserRole::SUPER_ADMIN, $sanctumPermissions);

        $this->guard('web')->assign(UserRole::USER, ['users.index', 'users.show']);
        $this->guard('sanctum')->assign(UserRole::USER, ['api.users.index', 'api.users.show']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->guard('web')->unassign(UserRole::USER, ['users.index', 'users.show']);
        $this->guard('sanctum')->unassign(UserRole::USER, ['api.users.index', 'api.users.show']);

        $webPermissions = [
            'users.index',
            'users.show',
            'users.create',
            'users.update',
            'users.delete',
        ];
        $sanctumPermissions = [
            'api.users.index',
            'api.users.show',
            'api.users.create',
            'api.users.update',
            'api.users.delete',
        ];
        $this->guard('web')->unassign(UserRole::SUPER_ADMIN, $webPermissions);
        $this->guard('sanctum')->unassign(UserRole::SUPER_ADMIN, $sanctumPermissions);

        $this->removePermissions($webPermissions, 'web');
        $this->removePermissions($sanctumPermissions, 'sanctum');
    }
};
