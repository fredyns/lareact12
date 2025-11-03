import { useEffect, useState, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

/**
 * Notification Preference interface
 */
interface NotificationPreference {
  id: string;
  user_id: string;
  type: string;
  channel: 'in-app' | 'email';
  enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Preferences grouped by type
 */
interface PreferencesGrouped {
  [type: string]: NotificationPreference[];
}

/**
 * useNotificationPreferences Hook
 *
 * Manages user notification preferences including:
 * - Enable/disable notifications per type and channel
 * - Configure quiet hours
 * - Reset to defaults
 *
 * @returns {Object} Preferences state and methods
 * @example
 * const { preferences, updatePreference, resetPreferences } = useNotificationPreferences();
 */
export function useNotificationPreferences() {
  const { auth } = usePage<PageProps>().props;
  const [preferences, setPreferences] = useState<PreferencesGrouped>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences from API
  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/notification-preferences', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) throw new Error('Failed to fetch preferences');

      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error fetching preferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a single preference
  const updatePreference = useCallback(
    async (
      type: string,
      channel: 'in-app' | 'email',
      enabled: boolean,
      quietHoursStart?: string | null,
      quietHoursEnd?: string | null
    ) => {
      try {
        setError(null);

        const response = await fetch('/notification-preferences', {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            type,
            channel,
            enabled,
            quiet_hours_start: quietHoursStart || null,
            quiet_hours_end: quietHoursEnd || null,
          }),
        });

        if (!response.ok) throw new Error('Failed to update preference');

        const updated = await response.json();

        // Update local state
        setPreferences((prev) => {
          const newPrefs = { ...prev };
          if (!newPrefs[type]) {
            newPrefs[type] = [];
          }
          const index = newPrefs[type].findIndex((p) => p.channel === channel);
          if (index >= 0) {
            newPrefs[type][index] = updated;
          } else {
            newPrefs[type].push(updated);
          }
          return newPrefs;
        });

        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error updating preference:', err);
        throw err;
      }
    },
    []
  );

  // Reset all preferences to defaults
  const resetPreferences = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/notification-preferences/reset', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) throw new Error('Failed to reset preferences');

      // Refetch preferences
      await fetchPreferences();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error resetting preferences:', err);
      throw err;
    }
  }, [fetchPreferences]);

  // Fetch preferences on mount
  useEffect(() => {
    if (auth.user?.id) {
      fetchPreferences();
    }
  }, [auth.user?.id, fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    fetchPreferences,
    updatePreference,
    resetPreferences,
  };
}
