<?php

namespace App\Enums;

use App\Enums\EnumTrait;

/**
 * Enum for User roles.
 */
enum UserRole: string {
    use EnumTrait;

    case SUPER_ADMIN = 'super-admin';
    case USER = 'user';
}
