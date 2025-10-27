import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import * as inertia from '@inertiajs/react';
import type { Page } from '@inertiajs/core';

/**
 * useNotifications Hook Tests
 *
 * Unit tests for notification management hook
 */

// Mock dependencies
vi.mock('@inertiajs/react');
vi.mock('@/echo', () => ({
  default: {
    private: vi.fn(() => ({
      listen: vi.fn(),
      stopListening: vi.fn(),
    })),
    leaveChannel: vi.fn(),
  },
}));

describe('useNotifications', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'item_created',
      data: { title: 'New Item', body: 'Item created' },
      read_at: null,
      created_at: '2025-10-27T13:00:00Z',
      updated_at: '2025-10-27T13:00:00Z',
    },
    {
      id: '2',
      type: 'item_updated',
      data: { title: 'Item Updated', body: 'Item updated' },
      read_at: '2025-10-27T13:05:00Z',
      created_at: '2025-10-27T13:00:00Z',
      updated_at: '2025-10-27T13:05:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('auth_token', 'test-token');

    // Mock usePage
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

    // Mock fetch
    global.fetch = vi.fn();
  });

  describe('fetchNotifications', () => {
    it('should fetch notifications successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockNotifications }),
      } as unknown as Response);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      await waitFor(() => {
        expect(result.current.notifications).toEqual(mockNotifications);
      });
    });

    it('should handle fetch error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as unknown as Response);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('fetchUnreadCount', () => {
    it('should fetch unread count', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unread: 5, total: 10 }),
      } as unknown as Response);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchUnreadCount();
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(5);
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockNotifications }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as unknown as Response);

      const { result } = renderHook(() => useNotifications());

      // Set initial notifications
      await act(async () => {
        await result.current.fetchNotifications();
      });

      // Mark as read
      await act(async () => {
        await result.current.markAsRead('1');
      });

      await waitFor(() => {
        const notification = result.current.notifications.find((n) => n.id === '1');
        expect(notification?.read_at).toBeTruthy();
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockNotifications }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as unknown as Response);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
        expect(result.current.notifications.every((n) => n.read_at)).toBe(true);
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockNotifications }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as unknown as Response);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const initialCount = result.current.notifications.length;

      await act(async () => {
        await result.current.deleteNotification('1');
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBe(initialCount - 1);
        expect(result.current.notifications.find((n) => n.id === '1')).toBeUndefined();
      });
    });
  });

  describe('initialization', () => {
    it('should fetch notifications on mount', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockNotifications }),
      } as unknown as Response);

      renderHook(() => useNotifications());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/notifications',
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

      renderHook(() => useNotifications());

      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });
});
