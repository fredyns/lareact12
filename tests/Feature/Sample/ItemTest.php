<?php

namespace Tests\Feature\Sample;

use App\Enums\Sample\ItemEnumerate;
use App\Models\Sample\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Item Feature Test
 * 
 * Tests CRUD operations for the Item model
 */
class ItemTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user with all permissions
        $this->user = User::factory()->create();
        $this->user->givePermissionTo([
            'sample.items.index',
            'sample.items.show',
            'sample.items.create',
            'sample.items.update',
            'sample.items.delete',
        ]);
        
        // Create test items
        $this->items = Item::factory()->count(5)->create();
    }

    /**
     * Test the index page.
     */
    public function test_index_page(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('sample.items.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('sample/Items/Index')
            ->has('items.data', 5)
        );
    }

    /**
     * Test the show page.
     */
    public function test_show_page(): void
    {
        $item = $this->items->first();

        $response = $this->actingAs($this->user)
            ->get(route('sample.items.show', $item));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('sample/Items/Show')
            ->has('item')
            ->where('item.id', $item->id)
        );
    }

    /**
     * Test the create page.
     */
    public function test_create_page(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('sample.items.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('sample/Items/Create')
            ->has('enumerateOptions')
        );
    }

    /**
     * Test the edit page.
     */
    public function test_edit_page(): void
    {
        $item = $this->items->first();

        $response = $this->actingAs($this->user)
            ->get(route('sample.items.edit', $item));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('sample/Items/Edit')
            ->has('item')
            ->where('item.id', $item->id)
        );
    }

    /**
     * Test storing a new item.
     */
    public function test_store_item(): void
    {
        $data = [
            'string' => $this->faker->sentence(),
            'email' => $this->faker->safeEmail(),
            'color' => $this->faker->hexColor(),
            'integer' => $this->faker->numberBetween(1, 100),
            'decimal' => $this->faker->randomFloat(2, 1, 1000),
            'npwp' => '12.345.678.9-012.345',
            'datetime' => now()->format('Y-m-d H:i:s'),
            'date' => now()->format('Y-m-d'),
            'time' => now()->format('H:i'),
            'ip_address' => $this->faker->ipv4(),
            'boolean' => true,
            'enumerate' => ItemEnumerate::ENABLE->value,
            'text' => $this->faker->paragraph(),
            'markdown_text' => $this->faker->paragraph(),
            'wysiwyg' => $this->faker->paragraph(),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'user_id' => $this->user->id,
        ];

        $response = $this->actingAs($this->user)
            ->post(route('sample.items.store'), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('sample_items', [
            'string' => $data['string'],
            'email' => $data['email'],
            'enumerate' => ItemEnumerate::ENABLE->value,
        ]);
    }

    /**
     * Test updating an item.
     */
    public function test_update_item(): void
    {
        $item = $this->items->first();
        
        $data = [
            'string' => 'Updated String',
            'email' => 'updated@example.com',
            'enumerate' => ItemEnumerate::DISABLE->value,
        ];

        $response = $this->actingAs($this->user)
            ->put(route('sample.items.update', $item), array_merge($item->toArray(), $data));

        $response->assertRedirect();
        $this->assertDatabaseHas('sample_items', [
            'id' => $item->id,
            'string' => 'Updated String',
            'email' => 'updated@example.com',
            'enumerate' => ItemEnumerate::DISABLE->value,
        ]);
    }

    /**
     * Test deleting an item.
     */
    public function test_delete_item(): void
    {
        $item = $this->items->first();

        $response = $this->actingAs($this->user)
            ->delete(route('sample.items.destroy', $item));

        $response->assertRedirect();
        $this->assertDatabaseMissing('sample_items', [
            'id' => $item->id,
        ]);
    }

    /**
     * Test API endpoints.
     */
    public function test_api_endpoints(): void
    {
        // Test index endpoint
        $response = $this->actingAs($this->user)
            ->getJson(route('sample.items.index'));
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => ['total', 'count', 'per_page', 'current_page', 'last_page'],
            ]);

        // Test show endpoint
        $item = $this->items->first();
        $response = $this->actingAs($this->user)
            ->getJson(route('sample.items.show', $item));
        
        $response->assertStatus(200)
            ->assertJson([
                'id' => $item->id,
                'string' => $item->string,
            ]);

        // Test store endpoint
        $data = [
            'string' => 'API Test Item',
            'email' => 'api@example.com',
            'enumerate' => ItemEnumerate::ENABLE->value,
        ];

        $response = $this->actingAs($this->user)
            ->postJson(route('sample.items.store'), $data);
        
        $response->assertStatus(201)
            ->assertJson([
                'string' => 'API Test Item',
                'email' => 'api@example.com',
            ]);

        // Test update endpoint
        $updateData = [
            'string' => 'Updated API Item',
        ];

        $response = $this->actingAs($this->user)
            ->putJson(route('sample.items.update', $item), array_merge($item->toArray(), $updateData));
        
        $response->assertStatus(200)
            ->assertJson([
                'string' => 'Updated API Item',
            ]);

        // Test delete endpoint
        $response = $this->actingAs($this->user)
            ->deleteJson(route('sample.items.destroy', $item));
        
        $response->assertStatus(204);
    }
}
