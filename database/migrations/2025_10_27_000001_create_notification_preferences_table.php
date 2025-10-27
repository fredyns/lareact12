<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('type'); // 'item_created', 'item_updated', 'all', etc
            $table->string('channel'); // 'in-app', 'email'
            $table->boolean('enabled')->default(true);
            $table->time('quiet_hours_start')->nullable(); // e.g., 22:00
            $table->time('quiet_hours_end')->nullable(); // e.g., 08:00
            $table->timestamps();

            // Unique constraint
            $table->unique(['user_id', 'type', 'channel']);

            // Foreign key
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            // Indexes
            $table->index(['user_id', 'channel']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
