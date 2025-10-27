<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Str;

/**
 * Notification Model
 *
 * Represents a notification sent to a notifiable entity (typically a User).
 * Supports polymorphic relationships and tracks read/unread status.
 *
 * @property string $id UUID primary key
 * @property string $notifiable_type The class name of the notifiable model
 * @property string $notifiable_id The ID of the notifiable model
 * @property string $type The notification type (e.g., 'item_created', 'item_updated')
 * @property array $data JSON data containing notification details
 * @property \DateTime|null $read_at Timestamp when notification was read
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder unread() Get unread notifications
 * @method static \Illuminate\Database\Eloquent\Builder read() Get read notifications
 * @method static \Illuminate\Database\Eloquent\Builder ofType(string $type) Filter by type
 * @method static \Illuminate\Database\Eloquent\Builder forUser(string $userId) Get for specific user
 * @method static \Illuminate\Database\Eloquent\Builder latest() Order by created_at DESC
 */
class Notification extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'notifiable_type',
        'notifiable_id',
        'type',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (! $model->id) {
                $model->id = Str::uuid();
            }
        });
    }

    /**
     * Get the notifiable entity
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo
     */
    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Mark notification as read
     *
     * Updates the read_at timestamp to current time if not already read.
     *
     * @return void
     */
    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Mark notification as unread
     *
     * Clears the read_at timestamp.
     *
     * @return void
     */
    public function markAsUnread(): void
    {
        $this->update(['read_at' => null]);
    }

    /**
     * Check if notification is unread
     *
     * @return bool True if notification has not been read
     */
    public function isUnread(): bool
    {
        return is_null($this->read_at);
    }

    /**
     * Check if notification is read
     *
     * @return bool True if notification has been read
     */
    public function isRead(): bool
    {
        return ! is_null($this->read_at);
    }

    /**
     * Scope: Get unread notifications
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope: Get read notifications
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Scope: Filter by notification type
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $type The notification type to filter by
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Order by creation date (newest first)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeLatest($query)
    {
        return $query->orderByDesc('created_at');
    }

    /**
     * Scope: Get notifications for a specific user
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $userId The user ID to filter by
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('notifiable_id', $userId)
            ->where('notifiable_type', User::class);
    }
}
