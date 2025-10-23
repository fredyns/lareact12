<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds performance indexes to sample_items table for:
     * - Search optimization (string, email fields)
     * - Sorting optimization (commonly sorted fields)
     * - Filter optimization (enumerate, created_at)
     * - Audit trail optimization (created_by, updated_by)
     */
    public function up(): void
    {
        Schema::table('sample_items', function (Blueprint $table) {
            // Index for search queries on string field
            $table->index('string', 'idx_sample_items_string');
            
            // Index for email searches and sorting
            $table->index('email', 'idx_sample_items_email');
            
            // Index for enumerate filter
            $table->index('enumerate', 'idx_sample_items_enumerate');
            
            // Composite index for created_at sorting (most common sort)
            $table->index('created_at', 'idx_sample_items_created_at');
            
            // Index for audit trail queries
            $table->index('created_by', 'idx_sample_items_created_by');
            $table->index('updated_by', 'idx_sample_items_updated_by');
            
            // Composite index for user_id + created_at (common filter + sort combination)
            $table->index(['user_id', 'created_at'], 'idx_sample_items_user_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sample_items', function (Blueprint $table) {
            $table->dropIndex('idx_sample_items_string');
            $table->dropIndex('idx_sample_items_email');
            $table->dropIndex('idx_sample_items_enumerate');
            $table->dropIndex('idx_sample_items_created_at');
            $table->dropIndex('idx_sample_items_created_by');
            $table->dropIndex('idx_sample_items_updated_by');
            $table->dropIndex('idx_sample_items_user_created');
        });
    }
};
