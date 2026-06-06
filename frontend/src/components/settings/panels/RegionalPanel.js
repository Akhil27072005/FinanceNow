import React, { useState, useEffect, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import GlassAlert from '../../ui/GlassAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import SettingsSection from '../SettingsSection';
import SettingsRow from '../SettingsRow';
import Select from '../../ui/Select';

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' }
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'UTC', label: 'UTC' }
];

const DEFAULT_PREFS = {
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Kolkata'
};

const RegionalPanel = ({ onRegisterSave, onSavingChange }) => {
  const { user, updateUser } = useAuth();
  const [currency, setCurrency] = useState(DEFAULT_PREFS.currency);
  const [dateFormat, setDateFormat] = useState(DEFAULT_PREFS.dateFormat);
  const [timezone, setTimezone] = useState(DEFAULT_PREFS.timezone);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const prefs = user?.preferences;
    if (prefs) {
      setCurrency(prefs.currency || DEFAULT_PREFS.currency);
      setDateFormat(prefs.dateFormat || DEFAULT_PREFS.dateFormat);
      setTimezone(prefs.timezone || DEFAULT_PREFS.timezone);
    }
  }, [user?.preferences]);

  const handleSave = useCallback(async () => {
    try {
      setError('');
      setSuccess('');
      onSavingChange?.(true);
      const res = await authService.updatePreferences({
        currency,
        dateFormat,
        timezone
      });
      if (res.user) {
        updateUser(res.user);
      } else if (res.preferences) {
        updateUser({ preferences: { ...user?.preferences, ...res.preferences } });
      }
      setSuccess('Regional preferences saved.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      onSavingChange?.(false);
    }
  }, [currency, dateFormat, timezone, onSavingChange, updateUser, user?.preferences]);

  useEffect(() => {
    onRegisterSave?.(handleSave);
    return () => onRegisterSave?.(null);
  }, [handleSave, onRegisterSave]);

  return (
    <SettingsSection
      title="Regional & display"
      description="Currency, dates, and timezone preferences for how amounts and dates appear."
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

      <SettingsRow label="Currency">
        <Select
          glass
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          options={CURRENCY_OPTIONS}
        />
      </SettingsRow>
      <SettingsRow label="Date format">
        <div className="settings-radio-group">
          <Form.Check
            type="radio"
            id="date-format-dmy"
            name="dateFormat"
            className="settings-radio"
            label="DD/MM/YYYY"
            checked={dateFormat === 'DD/MM/YYYY'}
            onChange={() => setDateFormat('DD/MM/YYYY')}
          />
          <Form.Check
            type="radio"
            id="date-format-mdy"
            name="dateFormat"
            className="settings-radio"
            label="MM/DD/YYYY"
            checked={dateFormat === 'MM/DD/YYYY'}
            onChange={() => setDateFormat('MM/DD/YYYY')}
          />
        </div>
      </SettingsRow>
      <SettingsRow label="Timezone">
        <Select
          glass
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          options={TIMEZONE_OPTIONS}
        />
      </SettingsRow>
    </SettingsSection>
  );
};

export default RegionalPanel;
