<?php

namespace App\Enums;

use Illuminate\Support\Str;

/**
 * Trait for Enum helper methods.
 */
trait EnumTrait
{
    /**
     * Get enum cases as select options array.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function toSelectOptions(): array
    {
        return collect(self::cases())->map(fn($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ])->toArray();
    }

    public function label(): string
    {
        return Str::title($this->value);
    }
}
