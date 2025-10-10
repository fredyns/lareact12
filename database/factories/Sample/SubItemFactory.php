<?php

namespace Database\Factories\Sample;

use App\Enums\Sample\ItemEnumerate;
use App\Models\Sample\Item;
use App\Models\Sample\SubItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sample\SubItem>
 */
class SubItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = SubItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => Str::uuid(),
            'item_id' => Item::factory(),
            'user_id' => User::factory(),
            'string' => $this->faker->sentence(3),
            'email' => $this->faker->optional()->safeEmail(),
            'color' => $this->faker->optional()->hexColor(),
            'integer' => $this->faker->optional()->numberBetween(0, 100),
            'decimal' => $this->faker->optional()->randomFloat(2, 1, 1000),
            'npwp' => $this->faker->optional()->regexify('^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$'),
            'datetime' => $this->faker->optional()->dateTime(),
            'date' => $this->faker->optional()->date(),
            'time' => $this->faker->optional()->time('H:i'),
            'ip_address' => $this->faker->optional()->ipv4(),
            'boolean' => $this->faker->optional()->boolean(),
            'enumerate' => $this->faker->optional()->randomElement(ItemEnumerate::cases()),
            'text' => $this->faker->optional()->paragraph(),
            'markdown_text' => $this->faker->optional()->paragraph(),
            'wysiwyg' => $this->faker->optional()->randomHtml(),
            'latitude' => $this->faker->optional()->latitude(),
            'longitude' => $this->faker->optional()->longitude(),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
