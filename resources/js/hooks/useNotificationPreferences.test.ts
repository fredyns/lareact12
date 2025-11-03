import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotificationPreferences } from './useNotificationPreferences';
import * as inertia from '@inertiajs/react';
import type { Page } from '@inertiajs/core';

/**
 * Notification Preference interface (matches hook definition)
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
 * useNotificationPreferences Hook Tests
 *
 * Unit tests for notification preferences management hook
 */

vi.mock('@inertiajs/react');

describe('useNotificationPreferences', () => {
  const mockPreferences = {
    item_created: [
      {
        id: '1',
        user_id: '123',
        type: 'item_created',
        channel: 'in-app',
        enabled: true,
        quiet_hours_start: null,
        quiet_hours_end: null,
        created_at: '2025-10-27T13:00:00Z',
        updated_at: '2025-10-27T13:00:00Z',
      },
      {
        id: '2',
        user_id: '123',
        type: 'item_created',
        channel: 'email',
        enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        created_at: '2025-10-27T13:00:00Z',
        updated_at: '2025-10-27T13:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('auth_token', 'test-token');

    vi.mocked(inertia.usePage).mockReturnValue({
      props: {
        auth: {
          user: {
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      },
    } as unknown as Page);

    global.fetch = vi.fn();
  });

  describe('fetchPreferences', () => {
    it('should fetch preferences successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPreferences,
      } as unknown as Response);

      const { result } = renderHook(() => useNotificationPreferences());

      await act(async () => {
        await result.current.fetchPreferences();
      });

      await waitFor(() => {
        expect(result.current.preferences).toEqual(mockPreferences);
      });
    });

    it('should handle fetch error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as unknown as Response);

      const { result } = renderHook(() => useNotificationPreferences());

      await act(async () => {
        await result.current.fetchPreferences();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('updatePreference', () => {
    it('should update preference successfully', async () => {
      const updatedPref = {
        ...mockPreferences.item_created[1],
        enabled: false,
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedPref,
      } as unknown as Response);

      const { result } = renderHook(() => useNotificationPreferences());

      let response;
      await act(async () => {
        response = await result.current.updatePreference(
          'item_created',
          'email',
          false
        );
      });

      expect(response).toEqual(updatedPref);
    });

    it('should update preference with quiet hours', async () => {
      const updatedPref = {
        ...mockPreferences.item_created[1],
        quiet_hours_start: '23:00',
        quiet_hours_end: '07:00',
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedPref,
      } as unknown as Response);

      const { result } = renderHook(() => useNotificationPreferences());

      let response: NotificationPreference | undefined;
      await act(async () => {
        response = await result.current.updatePreference(
          'item_created',
          'email',
          true,
          '23:00',
          '07:00'
        );
      });

      expect(response).toBeDefined();
      expect(response?.quiet_hours_start).toBe('23:00');
      expect(response?.quiet_hours_end).toBe('07:00');
    });

    it('should handle update error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 422,
      } as unknown as Response);

      const { result } = renderHook(() => useNotificationPreferences());

      await expect(
        act(async () => {
          await result.current.updatePreference('item_created', 'email', true);
        })
      ).rejects.toThrow();
    });
  });

  describe('resetPreferences', () => {
    it('should reset preferences to defaults', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferences,
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferences,
        } as unknown as Response);

      const { result } = renderHook(() => useNotificationPreferences());

      await act(async () => {
        await result.current.fetchPreferences();
      });

      await act(async () => {
        await result.current.resetPreferences();
      });

      await waitFor(() => {
        expect(result.current.preferences).toEqual(mockPreferences);
      });
    });

    it('should handle reset error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as unknown as Response);

      const { result } = renderHook(() => useNotificationPreferences());

      await expect(
        act(async () => {
          await result.current.resetPreferences();
        })
      ).rejects.toThrow();
    });
  });

  describe('initialization', () => {
    it('should fetch preferences on mount', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPreferences,
      } as unknown as Response);

      renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/notification-preferences',
          expect.any(Object)
        );
      });
    });

    it('should not fetch if user not authenticated', async () => {
      vi.mocked(inertia.usePage).mockReturnValue({
        props: {
          auth: {
            user: null,
          },
        },
      } as unknown as Page);

      renderHook(() => useNotificationPreferences());

      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });
});
