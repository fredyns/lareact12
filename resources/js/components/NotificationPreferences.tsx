import React, { useState } from 'react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Bell, Mail, Clock, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * NotificationPreferences Component
 *
 * Allows users to manage their notification preferences:
 * - Enable/disable notifications per type and channel
 * - Configure quiet hours
 * - Reset to defaults
 *
 * @returns {React.ReactElement} Preferences management component
 */
export function NotificationPreferences() {
  const { preferences, isLoading, error, updatePreference, resetPreferences } =
    useNotificationPreferences();
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggle = async (
    type: string,
    channel: 'in-app' | 'email',
    currentEnabled: boolean
  ) => {
    try {
      setSaving(`${type}-${channel}`);
      await updatePreference(type, channel, !currentEnabled);
      setSuccess(`${channel} notifications for ${type} updated`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update preference:', err);
    } finally {
      setSaving(null);
    }
  };

  const handleQuietHoursChange = async (
    type: string,
    channel: 'in-app' | 'email',
    startTime: string | null,
    endTime: string | null
  ) => {
    try {
      setSaving(`${type}-${channel}-quiet`);
      const pref = preferences[type]?.find((p) => p.channel === channel);
      if (pref) {
        await updatePreference(type, channel, pref.enabled, startTime, endTime);
        setSuccess('Quiet hours updated');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update quiet hours:', err);
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all preferences to defaults?')) {
      try {
        setSaving('reset');
        await resetPreferences();
        setSuccess('Preferences reset to defaults');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Failed to reset preferences:', err);
      } finally {
        setSaving(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Loading preferences...</div>
      </div>
    );
  }

  const notificationTypes = Object.keys(preferences);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notification Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage how and when you receive notifications
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={saving === 'reset'}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCcw size={18} />
          Reset to Defaults
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-800 dark:text-green-200">
          <CheckCircle size={20} />
          <p>{success}</p>
        </div>
      )}

      {/* Preferences Grid */}
      <div className="space-y-6">
        {notificationTypes.map((type) => (
          <div
            key={type}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4"
          >
            {/* Type Header */}
            <div className="flex items-center gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
              <Bell size={20} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {type.replace(/_/g, ' ')}
              </h3>
            </div>

            {/* Channels */}
            <div className="space-y-4">
              {preferences[type]?.map((pref) => (
                <div key={pref.id} className="space-y-3">
                  {/* Channel Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pref.channel === 'email' ? (
                        <Mail size={18} className="text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Bell size={18} className="text-gray-600 dark:text-gray-400" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {pref.channel} Notifications
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleToggle(type, pref.channel, pref.enabled)
                      }
                      disabled={saving === `${type}-${pref.channel}`}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pref.enabled
                          ? 'bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pref.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Quiet Hours */}
                  {pref.enabled && (
                    <div className="ml-8 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Clock size={16} />
                        Quiet Hours
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={pref.quiet_hours_start || ''}
                            onChange={(e) =>
                              handleQuietHoursChange(
                                type,
                                pref.channel,
                                e.target.value || null,
                                pref.quiet_hours_end
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={pref.quiet_hours_end || ''}
                            onChange={(e) =>
                              handleQuietHoursChange(
                                type,
                                pref.channel,
                                pref.quiet_hours_start,
                                e.target.value || null
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Notifications will be suppressed during these hours
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {notificationTypes.length === 0 && (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No notification preferences available
          </p>
        </div>
      )}
    </div>
  );
}
