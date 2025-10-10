<?php

use App\Enums\UserRole;

return new class extends \App\Database\Migrations\BasePermissionMigration {
    /**
     * Run the migrations.
     *
     * Adds permissions for sample_sub_items table:
     * - sample.sub-items.index
     * - sample.sub-items.show
     * - sample.sub-items.create
     * - sample.sub-items.update
     * - sample.sub-items.delete
     */
    public function up(): void
    {
        $webPermissions = [
            'sample.sub-items.index',
            'sample.sub-items.show',
            'sample.sub-items.create',
            'sample.sub-items.update',
            'sample.sub-items.delete',
        ];
        $sanctumPermissions = [
            'api.sample.sub-items.index',
            'api.sample.sub-items.show',
            'api.sample.sub-items.create',
            'api.sample.sub-items.update',
            'api.sample.sub-items.delete',
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
            'sample.sub-items.index',
            'sample.sub-items.show',
            'sample.sub-items.create',
            'sample.sub-items.update',
            'sample.sub-items.delete',
        ];
        $sanctumPermissions = [
            'api.sample.sub-items.index',
            'api.sample.sub-items.show',
            'api.sample.sub-items.create',
            'api.sample.sub-items.update',
            'api.sample.sub-items.delete',
        ];

        $this->guard('web')->unassign(UserRole::SUPER_ADMIN, $webPermissions);
        $this->guard('sanctum')->unassign(UserRole::SUPER_ADMIN, $sanctumPermissions);

        $this->guard('web')->unassign(UserRole::USER, $webPermissions);
        $this->guard('sanctum')->unassign(UserRole::USER, $sanctumPermissions);

        $this->removePermissions($webPermissions, 'web');
        $this->removePermissions($sanctumPermissions, 'sanctum');
    }
};
