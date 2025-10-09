<?php

use App\Enums\UserRole;

return new class extends \App\Database\Migrations\BasePermissionMigration {
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
        $webPermissions = [
            'sample.items.index',
            'sample.items.show',
            'sample.items.create',
            'sample.items.update',
            'sample.items.delete',
        ];
        $sanctumPermissions = [
            'api.sample.items.index',
            'api.sample.items.show',
            'api.sample.items.create',
            'api.sample.items.update',
            'api.sample.items.delete',
        ];
        $this->addPermissions($webPermissions, 'web');
        $this->addPermissions($sanctumPermissions, 'sanctum');

        $this->guard('web')->assign(UserRole::SUPER_ADMIN, $webPermissions);
        $this->guard('sanctum')->assign(UserRole::SUPER_ADMIN, $sanctumPermissions);

        $this->guard('web')->assign(UserRole::USER, $webPermissions);
        $this->guard('sanctum')->assign(UserRole::USER, $sanctumPermissions);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $webPermissions = [
            'sample.items.index',
            'sample.items.show',
            'sample.items.create',
            'sample.items.update',
            'sample.items.delete',
        ];
        $sanctumPermissions = [
            'api.sample.items.index',
            'api.sample.items.show',
            'api.sample.items.create',
            'api.sample.items.update',
            'api.sample.items.delete',
        ];

        $this->guard('web')->unassign(UserRole::SUPER_ADMIN, $webPermissions);
        $this->guard('sanctum')->unassign(UserRole::SUPER_ADMIN, $sanctumPermissions);

        $this->guard('web')->unassign(UserRole::USER, $webPermissions);
        $this->guard('sanctum')->unassign(UserRole::USER, $sanctumPermissions);

        $this->removePermissions($webPermissions, 'web');
        $this->removePermissions($sanctumPermissions, 'sanctum');
    }
};
