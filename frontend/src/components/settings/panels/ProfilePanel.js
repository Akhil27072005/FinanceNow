import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import GlassAlert from '../../ui/GlassAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import SettingsSection from '../SettingsSection';
import SettingsRow from '../SettingsRow';
import { useUserFormatters } from '../../../hooks/useUserFormatters';

const authProviderLabel = (provider) => {
  if (provider === 'google') return 'Google';
  if (provider === 'local') return 'Email & password';
  return provider || 'Unknown';
};

const ProfilePanel = ({ onRegisterSave, onSavingChange }) => {
  const { user, updateUser } = useAuth();
  const { formatDate } = useUserFormatters();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const initials = useMemo(() => {
    const source = name?.trim() || user?.email || '?';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return source.charAt(0).toUpperCase();
  }, [name, user?.email]);

  const memberSince = user?.createdAt ? formatDate(user.createdAt) : null;

  const handleSave = useCallback(async () => {
    try {
      setError('');
      setSuccess('');
      onSavingChange?.(true);
      const res = await authService.updateProfile({ name: name.trim() });
      if (res.user) {
        updateUser(res.user);
      }
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      onSavingChange?.(false);
    }
  }, [name, onSavingChange, updateUser]);

  useEffect(() => {
    onRegisterSave?.(handleSave);
    return () => onRegisterSave?.(null);
  }, [handleSave, onRegisterSave]);

  return (
    <SettingsSection
      title="Profile"
      description="Update your display name. Email and sign-in method are managed by your account provider."
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

      <div className="settings-profile">
        <div className="settings-profile__avatar" aria-hidden>
          {initials}
        </div>
        <div className="settings-profile__fields">
          <SettingsRow label="Display name" htmlFor="settings-profile-name">
            <Form.Control
              id="settings-profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="settings-field-input"
            />
          </SettingsRow>
          <SettingsRow label="Email">
            <span className="settings-field-value">{user?.email || '—'}</span>
          </SettingsRow>
          <SettingsRow label="Sign-in method">
            <span className="settings-profile__provider-badge">
              {authProviderLabel(user?.authProvider)}
            </span>
          </SettingsRow>
          {memberSince && (
            <SettingsRow label="Member since">
              <span className="settings-field-value">{memberSince}</span>
            </SettingsRow>
          )}
        </div>
      </div>
    </SettingsSection>
  );
};

export default ProfilePanel;
