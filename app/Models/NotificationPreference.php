<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * NotificationPreference Model
 *
 * Manages user preferences for notifications including enabled/disabled status,
 * channel selection (in-app, email), and quiet hours configuration.
 *
 * @property string $id UUID primary key
 * @property string $user_id Foreign key to users table
 * @property string $type The notification type (e.g., 'item_created', 'item_updated')
 * @property string $channel The delivery channel ('in-app', 'email')
 * @property bool $enabled Whether this preference is enabled
 * @property \DateTime|null $quiet_hours_start Start time for quiet hours (e.g., 22:00)
 * @property \DateTime|null $quiet_hours_end End time for quiet hours (e.g., 08:00)
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder forUser(string $userId) Get preferences for a user
 * @method static \Illuminate\Database\Eloquent\Builder forChannel(string $channel) Filter by channel
 * @method static \Illuminate\Database\Eloquent\Builder forType(string $type) Filter by type
 * @method static \Illuminate\Database\Eloquent\Builder enabled() Get enabled preferences only
 */
class NotificationPreference extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'type',
        'channel',
        'enabled',
        'quiet_hours_start',
        'quiet_hours_end',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'quiet_hours_start' => 'datetime:H:i',
        'quiet_hours_end' => 'datetime:H:i',
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
     * Get the associated user
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if preference is enabled and not within quiet hours
     *
     * Returns true only if the preference is enabled AND the current time
     * is not within the configured quiet hours.
     *
     * @return bool True if notifications should be delivered
     */
    public function isEnabled(): bool
    {
        return $this->enabled && ! $this->isWithinQuietHours();
    }

    /**
     * Check if the current time is within configured quiet hours
     *
     * Handles both standard quiet hours (e.g., 09:00-17:00) and
     * overnight quiet hours (e.g., 22:00-08:00).
     *
     * @return bool True if the current time is within quiet hours
     */
    public function isWithinQuietHours(): bool
    {
        if (is_null($this->quiet_hours_start) || is_null($this->quiet_hours_end)) {
            return false;
        }

        $now = now();
        $start = $now->clone()->setTimeFromTimeString($this->quiet_hours_start->format('H:i'));
        $end = $now->clone()->setTimeFromTimeString($this->quiet_hours_end->format('H:i'));

        if ($start < $end) {
            return $now->between($start, $end);
        }

        // Handle overnight quiet hours (e.g., 22:00 to 08:00)
        return $now->greaterThanOrEqualTo($start) || $now->lessThan($end);
    }

    /**
     * Scope: Get preferences for a specific user
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $userId The user ID to filter by
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Get preferences for a specific channel
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $channel The channel to filter by ('in-app', 'email')
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    /**
     * Scope: Get preferences for a specific notification type
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $type The notification type to filter by
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Get only enabled preferences
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }
}
