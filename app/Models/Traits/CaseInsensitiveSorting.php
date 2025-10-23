<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

trait CaseInsensitiveSorting
{
    /**
     * Apply case-insensitive ordering to the query
     *
     * @param Builder $query
     * @param string $column
     * @param string $direction
     * @return Builder
     */
    public function scopeOrderByInsensitive(Builder $query, string $column, string $direction = 'asc'): Builder
    {
        $driver = $query->getConnection()->getDriverName();
        $direction = strtoupper($direction);

        return match ($driver) {
            'pgsql' => $query->orderByRaw("LOWER({$column}) {$direction}"),
            'sqlite' => $query->orderByRaw("{$column} COLLATE NOCASE {$direction}"),
            default => $query->orderBy($column, $direction),
        };
    }
}
