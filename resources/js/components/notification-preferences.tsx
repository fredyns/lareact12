import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * NotificationPreferences Component
 *
 * Allows users to configure notification preferences including:
 * - Enable/disable notifications by type
 * - Enable/disable notifications by channel (in-app, email)
 * - Set quiet hours for notifications
 */
export function NotificationPreferences() {
    const { preferences, isLoading, error, updatePreference, resetPreferences } =
        useNotificationPreferences();

    const [saving, setSaving] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleToggle = async (
        type: string,
        channel: string,
        enabled: boolean
    ) => {
        setSaving(`${type}-${channel}`);
        try {
            await updatePreference(type, channel, enabled);
            setSuccess(`${type} ${channel} updated`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to update preference:', err);
        } finally {
            setSaving(null);
        }
    };

    const handleReset = async () => {
        if (
            confirm(
                'Are you sure you want to reset all notification preferences to default?'
            )
        ) {
            setSaving('reset');
            try {
                await resetPreferences();
                setSuccess('Preferences reset to default');
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
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                        <h3 className="font-semibold text-red-900 dark:text-red-100">
                            Error loading preferences
                        </h3>
                        <p className="text-sm text-red-800 dark:text-red-200">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const notificationTypes = Object.keys(preferences);

    return (
        <div className="space-y-6">
            {/* Success Message */}
            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
                    <div className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-800 dark:text-green-200">
                            {success}
                        </p>
                    </div>
                </div>
            )}

            {/* Notification Type Cards */}
            {notificationTypes.map((type) => (
                <Card key={type}>
                    <CardHeader>
                        <CardTitle className="capitalize">
                            {type.replace(/_/g, ' ')}
                        </CardTitle>
                        <CardDescription>
                            Manage preferences for {type.replace(/_/g, ' ')}{' '}
                            notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Channel Toggles */}
                        {preferences[type]?.map((pref) => (
                            <div key={`${type}-${pref.channel}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id={`${type}-${pref.channel}`}
                                            checked={pref.enabled}
                                            onCheckedChange={(checked) =>
                                                handleToggle(
                                                    type,
                                                    pref.channel,
                                                    checked
                                                )
                                            }
                                            disabled={
                                                saving ===
                                                `${type}-${pref.channel}`
                                            }
                                        />
                                        <Label
                                            htmlFor={`${type}-${pref.channel}`}
                                            className="capitalize cursor-pointer"
                                        >
                                            {pref.channel} notifications
                                        </Label>
                                    </div>
                                    {saving ===
                                        `${type}-${pref.channel}` && (
                                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            {/* Reset Button */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={saving === 'reset'}
                    className="gap-2"
                >
                    {saving === 'reset' && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Reset to Defaults
                </Button>
            </div>
        </div>
    );
}
