<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates the sample_sub_items table with all required columns.
     * - Primary key is UUID
     * - Foreign key to sample_items table (item_id)
     * - Foreign keys to users table
     * - Various data types with specific constraints
     */
    public function up(): void
    {
        Schema::create('sample_sub_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('item_id'); // Foreign key to sample_items
            $table->uuid('user_id')->nullable();
            $table->string('string', 255);
            $table->string('email', 255)->nullable();
            $table->string('color', 20)->nullable();
            $table->integer('integer')->nullable();
            $table->decimal('decimal', 10, 2)->nullable();
            $table->string('npwp', 20)->nullable();
            $table->dateTime('datetime')->nullable();
            $table->date('date')->nullable();
            $table->time('time')->nullable();
            $table->string('ip_address', 255)->nullable();
            $table->boolean('boolean')->nullable();
            $table->enum('enumerate', ['enable', 'disable'])->nullable();
            $table->text('text')->nullable();
            $table->text('file')->nullable();
            $table->text('image')->nullable();
            $table->text('markdown_text')->nullable();
            $table->text('wysiwyg')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('upload_path', 500)->nullable();
            
            // Add indexes
            $table->index('item_id');
            $table->index('user_id');
            
            // Add foreign key constraint
            $table->foreign('item_id')
                  ->references('id')
                  ->on('sample_items')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sample_sub_items');
    }
};
