<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
 * ItemUpdated Notification
 *
 * Sent when an existing item is updated. Delivers via database, broadcast (WebSocket),
 * and optionally email based on user preferences.
 *
 * @see \App\Models\Notification
 * @see \App\Models\NotificationPreference
 */
class ItemUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Constructor
     *
     * @param mixed $item The item that was updated
     */
    public function __construct(private $item)
    {
        $this->onQueue('notifications');
    }

    /**
     * Get the notification's delivery channels
     *
     * Determines which channels to use based on user preferences.
     * Always includes database and broadcast; email is conditional.
     *
     * @param mixed $notifiable The user receiving the notification
     * @return array List of channels to deliver through
     */
    public function via($notifiable): array
    {
        $channels = ['database'];

        // Check email preference
        $emailPref = $notifiable->notificationPreferences()
            ->where('type', 'item_updated')
            ->where('channel', 'email')
            ->first();

        if ($emailPref && $emailPref->isEnabled()) {
            $channels[] = 'mail';
        }

        // Note: Broadcasting is handled by NotificationCreated event
        return $channels;
    }

    /**
     * Get the array representation of the notification for database storage
     *
     * @param mixed $notifiable The user receiving the notification
     * @return array Notification data to be stored as JSON
     */
    public function toDatabase($notifiable): array
    {
        return [
            'title' => 'Item Updated',
            'body' => "Item '{$this->item->string}' just updated",
            'action_url' => route('sample.items.show', $this->item->id),
            'icon' => 'package-check',
            'meta' => [
                'item_id' => $this->item->id,
                'item_name' => $this->item->string,
                'updated_by' => auth()->id(),
            ],
        ];
    }

    /**
     * Get the broadcastable representation of the notification
     *
     * Used for real-time delivery via WebSocket.
     *
     * @param mixed $notifiable The user receiving the notification
     * @return \Illuminate\Notifications\Messages\BroadcastMessage
     */
    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }


    /**
     * Get the mail representation of the notification
     *
     * Builds the email message to be sent to the user.
     *
     * @param mixed $notifiable The user receiving the notification
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Item Updated')
            ->greeting("Hello {$notifiable->name}!")
            ->line("Item '{$this->item->string}' has been updated.")
            ->action('View Item', route('sample.items.show', $this->item->id))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the retry strategy (in seconds)
     *
     * Defines when failed delivery attempts should be retried.
     *
     * @return array Retry delays in seconds
     */
    public function backoff(): array
    {
        return [1, 5, 15, 60];
    }

    /**
     * Determine the time at which the job should timeout
     *
     * Stops retrying after 24 hours.
     *
     * @return \DateTime
     */
    public function retryUntil(): \DateTime
    {
        return now()->addHours(24);
    }
}
