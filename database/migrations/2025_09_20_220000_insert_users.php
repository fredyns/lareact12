<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration {

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('users')->insert([
            [
                'id' => Str::uuid(),
                'name' => 'fredyns',
                'email' => 'dm@fredyns.id',
                'email_verified_at' => now(),
                'password' => '$2y$12$WvjfVopnzLYtfD0AULAFAuVOdF8OOVFb76OjS04Uwc6YgpklOmiy.',
                'remember_token' => Str::random(10),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'fredy',
                'email' => 'fredy.ns@gmail.com',
                'email_verified_at' => now(),
                'password' => '$2y$12$E4fQVLQTXZB6cxVFA20LNemC1HfpAYaNSzEVMvavayvEupOD2fjqe',
                'remember_token' => Str::random(10),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Fredy BKI',
                'email' => 'fredy.ns@bki.co.id',
                'email_verified_at' => now(),
                'password' => '$2y$12$E4fQVLQTXZB6cxVFA20LNemC1HfpAYaNSzEVMvavayvEupOD2fjqe',
                'remember_token' => Str::random(10),
            ],
        ]);

        $env = config('app.env');
        $production = (str_contains($env, 'prod') or str_contains($env, 'prd'));
        if ($production) return;

        DB::table('users')->insert([
            [
                'id' => Str::uuid(),
                'name' => 'Sys-Admin',
                'email' => 'admin@admin.com',
                'email_verified_at' => now(),
                'password' => Hash::make('admin'),
                'remember_token' => Str::random(10),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Sys-User',
                'email' => 'user@app.dev',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $emails = [
            'dm@fredyns.id',
            'fredy.ns@gmail.com',
            'fredy.ns@bki.co.id',
            'admin@admin.com',
            'user@app.dev',
        ];
        DB::table('users')->whereIn('email', $emails)->delete();
    }
};
