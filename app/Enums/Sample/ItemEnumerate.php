<?php

namespace App\Enums\Sample;

use App\Enums\EnumTrait;

/**
 * Enum for Item enumerate field.
 */
enum ItemEnumerate: string {
    use EnumTrait;

    case ENABLE = 'enable';
    case DISABLE = 'disable';
}
