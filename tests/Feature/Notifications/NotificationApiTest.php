<?php

namespace Tests\Feature\Notifications;

use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Notification API Integration Tests
 *
 * Tests for notification endpoints and functionality
 */
class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
    }

    /**
     * Test GET /api/notifications
     */
    public function test_can_get_notifications(): void
    {
        // Create notifications
        Notification::factory()
            ->for($this->user, 'notifiable')
            ->count(5)
            ->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'type', 'data', 'read_at', 'created_at'],
                ],
                'meta' => ['current_page', 'total', 'per_page'],
            ])
            ->assertJsonCount(5, 'data');
    }

    /**
     * Test GET /api/notifications with filter
     */
    public function test_can_filter_unread_notifications(): void
    {
        Notification::factory()
            ->for($this->user, 'notifiable')
            ->count(3)
            ->create(['read_at' => null]);

        Notification::factory()
            ->for($this->user, 'notifiable')
            ->count(2)
            ->create(['read_at' => now()]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/notifications?filter=unread');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test GET /api/notifications/count
     */
    public function test_can_get_notification_count(): void
    {
        Notification::factory()
            ->for($this->user, 'notifiable')
            ->count(3)
            ->create(['read_at' => null]);

        Notification::factory()
            ->for($this->user, 'notifiable')
            ->count(2)
            ->create(['read_at' => now()]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/notifications/count');

        $response->assertStatus(200)
            ->assertJson([
                'unread' => 3,
                'total' => 5,
            ]);
    }

    /**
     * Test PATCH /api/notifications/{id}/read
     */
    public function test_can_mark_notification_as_read(): void
    {
        $notification = Notification::factory()
            ->for($this->user, 'notifiable')
            ->create(['read_at' => null]);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    /**
     * Test cannot mark other user's notification as read
     */
    public function test_cannot_mark_other_user_notification_as_read(): void
    {
        $notification = Notification::factory()
            ->for($this->otherUser, 'notifiable')
            ->create(['read_at' => null]);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(403);
    }

    /**
     * Test PATCH /api/notifications/read-all
     */
    public function test_can_mark_all_notifications_as_read(): void
    {
        Notification::factory()
            ->for($this->user, 'notifiable')
            ->count(5)
            ->create(['read_at' => null]);

        $response = $this->actingAs($this->user)
            ->patchJson('/api/notifications/read-all');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $unreadCount = Notification::where('notifiable_id', $this->user->id)
            ->whereNull('read_at')
            ->count();

        $this->assertEquals(0, $unreadCount);
    }

    /**
     * Test DELETE /api/notifications/{id}
     */
    public function test_can_delete_notification(): void
    {
        $notification = Notification::factory()
            ->for($this->user, 'notifiable')
            ->create();

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/notifications/{$notification->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    /**
     * Test cannot delete other user's notification
     */
    public function test_cannot_delete_other_user_notification(): void
    {
        $notification = Notification::factory()
            ->for($this->otherUser, 'notifiable')
            ->create();

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/notifications/{$notification->id}");

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated access
     */
    public function test_unauthenticated_cannot_access_notifications(): void
    {
        $response = $this->getJson('/api/notifications');

        $response->assertStatus(401);
    }

    /**
     * Test pagination
     */
    public function test_notifications_are_paginated(): void
    {
        Notification::factory()
            ->for($this->user, 'notifiable')
            ->count(25)
            ->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/notifications?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJson([
                'meta' => [
                    'per_page' => 10,
                    'total' => 25,
                ],
            ]);
    }
}
