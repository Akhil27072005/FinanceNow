import React, { useState, useEffect, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import GlassAlert from '../../ui/GlassAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import SettingsSection from '../SettingsSection';
import SettingsRow from '../SettingsRow';

const DEFAULT_NOTIFICATION_PREFS = {
  subscriptionReminderDays: 7,
  emailReminders: false,
  overdueAlerts: true
};

const NotificationsPanel = ({ onRegisterSave, onSavingChange }) => {
  const { user, updateUser } = useAuth();
  const [reminderDays, setReminderDays] = useState(DEFAULT_NOTIFICATION_PREFS.subscriptionReminderDays);
  const [emailReminders, setEmailReminders] = useState(DEFAULT_NOTIFICATION_PREFS.emailReminders);
  const [overdueAlerts, setOverdueAlerts] = useState(DEFAULT_NOTIFICATION_PREFS.overdueAlerts);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const prefs = user?.preferences;
    if (prefs) {
      setReminderDays(prefs.subscriptionReminderDays ?? DEFAULT_NOTIFICATION_PREFS.subscriptionReminderDays);
      setEmailReminders(Boolean(prefs.emailReminders));
      setOverdueAlerts(prefs.overdueAlerts !== false);
    }
  }, [user?.preferences]);

  const handleSave = useCallback(async () => {
    try {
      setError('');
      setSuccess('');
      onSavingChange?.(true);
      const res = await authService.updatePreferences({
        subscriptionReminderDays: reminderDays,
        emailReminders,
        overdueAlerts
      });
      if (res.user) {
        updateUser(res.user);
      } else if (res.preferences) {
        updateUser({ preferences: res.preferences });
      }
      setSuccess('Notification preferences saved.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save notification preferences');
    } finally {
      onSavingChange?.(false);
    }
  }, [reminderDays, emailReminders, overdueAlerts, onSavingChange, updateUser]);

  useEffect(() => {
    onRegisterSave?.(handleSave);
    return () => onRegisterSave?.(null);
  }, [handleSave, onRegisterSave]);

  return (
    <SettingsSection
      title="Notifications"
      description="Subscription reminders align with badges on your subscriptions page. Email delivery is not enabled yet."
    >
      {error && (
        <GlassAlert variant="danger" onClose={() => setError('')} className="mb-3">
          {error}
        </GlassAlert>
      )}
      {success && (
        <GlassAlert variant="success" onClose={() => setSuccess('')} className="mb-3">
          {success}
        </GlassAlert>
      )}

      <SettingsRow
        label="Subscription reminder window"
        hint="Days before the next payment date to highlight upcoming subscriptions."
        htmlFor="settings-reminder-days"
      >
        <input
          id="settings-reminder-days"
          type="number"
          min={1}
          max={30}
          value={reminderDays}
          onChange={(e) => setReminderDays(Number(e.target.value) || 7)}
          className="settings-field-input settings-number-input"
        />
      </SettingsRow>
      <SettingsRow
        label="Email reminders"
        hint="Saved for when email notifications are enabled — no emails are sent yet."
      >
        <Form.Check
          type="switch"
          id="settings-email-reminders"
          className="settings-switch"
          label="Send email before subscription due dates"
          checked={emailReminders}
          onChange={(e) => setEmailReminders(e.target.checked)}
        />
      </SettingsRow>
      <SettingsRow label="Overdue alerts" hint="Show overdue badges on active subscriptions.">
        <Form.Check
          type="switch"
          id="settings-overdue-alerts"
          className="settings-switch"
          label="Highlight overdue subscriptions"
          checked={overdueAlerts}
          onChange={(e) => setOverdueAlerts(e.target.checked)}
        />
      </SettingsRow>
    </SettingsSection>
  );
};

export default NotificationsPanel;
