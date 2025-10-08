<?php

namespace App\Models\RBAC;

use App\Models\Traits\Searchable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;

class Permission extends \Spatie\Permission\Models\Permission
{
    use HasUuids;
    use Searchable;
    
    /**
     * The attributes that are searchable from a single keyword.
     *
     * @var list<string>
     */
    protected $searchableFields = [
        'name',
        'guard_name',
    ];
    
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }
}
