<?php

namespace Database\Seeders\Sample;

use App\Enums\Sample\ItemEnumerate;
use App\Models\Sample\Item;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Item Seeder
 * 
 * Seeds the sample_items table with test data
 */
class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a few users if none exist
        if (User::count() === 0) {
            User::factory(3)->create();
        }
        
        $users = User::all();
        
        // Create sample items with different enumerate values
        foreach (ItemEnumerate::cases() as $enumerate) {
            Item::factory()
                ->count(5)
                ->create([
                    'enumerate' => $enumerate,
                    'user_id' => $users->random()->id,
                    'created_by' => $users->random()->id,
                    'updated_by' => $users->random()->id,
                ]);
        }
        
        // Create a few more random items
        Item::factory()
            ->count(10)
            ->create([
                'user_id' => fn() => $users->random()->id,
                'created_by' => fn() => $users->random()->id,
                'updated_by' => fn() => $users->random()->id,
            ]);
    }
}
