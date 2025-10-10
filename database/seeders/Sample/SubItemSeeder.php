<?php

namespace Database\Seeders\Sample;

use App\Enums\Sample\ItemEnumerate;
use App\Models\Sample\Item;
use App\Models\Sample\SubItem;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * SubItem Seeder
 * 
 * Seeds the sample_sub_items table with test data
 */
class SubItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all items
        $items = Item::all();
        
        if ($items->isEmpty()) {
            $this->command->warn('No items found. Please run ItemSeeder first.');
            return;
        }
        
        $users = User::all();
        
        // Create 2-5 sub-items for each item
        foreach ($items as $item) {
            $subItemCount = rand(2, 5);
            
            SubItem::factory()
                ->count($subItemCount)
                ->create([
                    'item_id' => $item->id,
                    'user_id' => $users->random()->id,
                    'created_by' => $users->random()->id,
                    'updated_by' => $users->random()->id,
                ]);
        }
    }
}
