<?php

namespace Tests\Feature\Notifications;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Notification Preference API Integration Tests
 *
 * Tests for notification preference endpoints
 */
class NotificationPreferenceApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /**
     * Test GET /api/notification-preferences
     */
    public function test_can_get_preferences(): void
    {
        NotificationPreference::factory()
            ->for($this->user)
            ->create(['type' => 'item_created', 'channel' => 'in-app']);

        NotificationPreference::factory()
            ->for($this->user)
            ->create(['type' => 'item_created', 'channel' => 'email']);

        $response = $this->actingAs($this->user)
            ->getJson('/api/notification-preferences');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'item_created' => [
                    '*' => [
                        'id',
                        'user_id',
                        'type',
                        'channel',
                        'enabled',
                        'quiet_hours_start',
                        'quiet_hours_end',
                    ],
                ],
            ]);
    }

    /**
     * Test PUT /api/notification-preferences - Create new preference
     */
    public function test_can_create_preference(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson('/api/notification-preferences', [
                'type' => 'item_created',
                'channel' => 'email',
                'enabled' => true,
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '08:00',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'type' => 'item_created',
                'channel' => 'email',
                'enabled' => true,
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '08:00',
            ]);

        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $this->user->id,
            'type' => 'item_created',
            'channel' => 'email',
        ]);
    }

    /**
     * Test PUT /api/notification-preferences - Update existing preference
     */
    public function test_can_update_preference(): void
    {
        $preference = NotificationPreference::factory()
            ->for($this->user)
            ->create([
                'type' => 'item_created',
                'channel' => 'email',
                'enabled' => true,
            ]);

        $response = $this->actingAs($this->user)
            ->putJson('/api/notification-preferences', [
                'type' => 'item_created',
                'channel' => 'email',
                'enabled' => false,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'enabled' => false,
            ]);

        $this->assertFalse($preference->fresh()->enabled);
    }

    /**
     * Test validation - invalid channel
     */
    public function test_validation_invalid_channel(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson('/api/notification-preferences', [
                'type' => 'item_created',
                'channel' => 'invalid',
                'enabled' => true,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['channel']);
    }

    /**
     * Test validation - invalid quiet hours format
     */
    public function test_validation_invalid_quiet_hours(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson('/api/notification-preferences', [
                'type' => 'item_created',
                'channel' => 'email',
                'enabled' => true,
                'quiet_hours_start' => 'invalid',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quiet_hours_start']);
    }

    /**
     * Test POST /api/notification-preferences/reset
     */
    public function test_can_reset_preferences(): void
    {
        NotificationPreference::factory()
            ->for($this->user)
            ->count(5)
            ->create(['enabled' => false]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/notification-preferences/reset');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verify all preferences are reset to enabled
        $preferences = NotificationPreference::where('user_id', $this->user->id)->get();
        $this->assertTrue($preferences->every(fn($p) => $p->enabled));
    }

    /**
     * Test quiet hours logic
     */
    public function test_quiet_hours_are_respected(): void
    {
        $preference = NotificationPreference::factory()
            ->for($this->user)
            ->create([
                'type' => 'item_created',
                'channel' => 'email',
                'enabled' => true,
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '08:00',
            ]);

        // Test within quiet hours (23:00)
        $this->assertTrue($preference->isWithinQuietHours('23:00'));

        // Test outside quiet hours (12:00)
        $this->assertFalse($preference->isWithinQuietHours('12:00'));

        // Test at boundary (22:00)
        $this->assertTrue($preference->isWithinQuietHours('22:00'));
    }

    /**
     * Test overnight quiet hours
     */
    public function test_overnight_quiet_hours(): void
    {
        $preference = NotificationPreference::factory()
            ->for($this->user)
            ->create([
                'quiet_hours_start' => '22:00',
                'quiet_hours_end' => '08:00',
            ]);

        // Before end time (07:00)
        $this->assertTrue($preference->isWithinQuietHours('07:00'));

        // After start time (23:00)
        $this->assertTrue($preference->isWithinQuietHours('23:00'));

        // Outside quiet hours (12:00)
        $this->assertFalse($preference->isWithinQuietHours('12:00'));
    }

    /**
     * Test unauthenticated access
     */
    public function test_unauthenticated_cannot_access_preferences(): void
    {
        $response = $this->getJson('/api/notification-preferences');

        $response->assertStatus(401);
    }

    /**
     * Test user can only access own preferences
     */
    public function test_user_can_only_access_own_preferences(): void
    {
        $otherUser = User::factory()->create();

        NotificationPreference::factory()
            ->for($otherUser)
            ->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/notification-preferences');

        $response->assertStatus(200);
        // Should not contain other user's preferences
        $this->assertEmpty($response->json());
    }
}
