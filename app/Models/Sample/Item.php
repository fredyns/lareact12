<?php

namespace App\Models\Sample;

use App\Enums\Sample\ItemEnumerate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * App\Models\Sample\Item
 *
 * @property string $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $created_by
 * @property string|null $updated_by
 * @property string|null $user_id
 * @property string $string
 * @property string|null $email
 * @property string|null $color
 * @property int|null $integer
 * @property float|null $decimal
 * @property string|null $npwp
 * @property \Illuminate\Support\Carbon|null $datetime
 * @property \Illuminate\Support\Carbon|null $date
 * @property string|null $time
 * @property string|null $ip_address
 * @property bool|null $boolean
 * @property ItemEnumerate|null $enumerate
 * @property string|null $text
 * @property string|null $file
 * @property string|null $image
 * @property string|null $markdown_text
 * @property string|null $wysiwyg
 * @property float|null $latitude
 * @property float|null $longitude
 * @property string|null $upload_path
 * @property-read User|null $user
 * @property-read User|null $creator
 * @property-read User|null $updater
 */
class Item extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sample_items';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'string',
        'email',
        'color',
        'integer',
        'decimal',
        'npwp',
        'datetime',
        'date',
        'time',
        'ip_address',
        'boolean',
        'enumerate',
        'text',
        'file',
        'image',
        'markdown_text',
        'wysiwyg',
        'latitude',
        'longitude',
        'upload_path',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'datetime' => 'datetime',
        'date' => 'date',
        'boolean' => 'boolean',
        'enumerate' => ItemEnumerate::class,
        'decimal' => 'float',
        'integer' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    /**
     * Boot the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
            
            // Generate upload_path based on creation date and ID
            if (empty($model->upload_path)) {
                $model->upload_path = $model->generateUploadPath();
            }
            
            if (auth()->check()) {
                $model->created_by = auth()->id();
                $model->updated_by = auth()->id();
            }
        });

        static::updating(function ($model) {
            // Generate upload_path if empty (for existing records)
            if (empty($model->upload_path)) {
                $model->upload_path = $model->generateUploadPath();
            }
            
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });
    }

    /**
     * Get the user that owns the item.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user that created the item.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user that last updated the item.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Generate the upload path for this item.
     * Format: {tableName}/{year}/{month}/{day}/{modelID}
     *
     * @return string
     */
    public function generateUploadPath(): string
    {
        $createdAt = $this->created_at ?? now();
        
        return sprintf(
            '%s/%s/%s/%s/%s',
            $this->getTable(),
            $createdAt->format('Y'),
            $createdAt->format('m'),
            $createdAt->format('d'),
            $this->id
        );
    }

    /**
     * Get the full file path within the upload directory.
     *
     * @param string $filename
     * @return string
     */
    public function getFilePath(string $filename): string
    {
        return $this->upload_path . '/' . $filename;
    }
}
