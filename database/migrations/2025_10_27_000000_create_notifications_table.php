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
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('notifiable_type');
            $table->uuid('notifiable_id');
            $table->string('type'); // 'item_created', 'item_updated', etc
            $table->json('data'); // {title, body, action_url, icon, meta}
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['notifiable_id', 'notifiable_type', 'read_at']);
            $table->index(['notifiable_id', 'notifiable_type', 'created_at']);
            $table->index(['notifiable_id', 'notifiable_type', 'type']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
