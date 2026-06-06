import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import GlassAlert from '../../ui/GlassAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import SettingsSection from '../SettingsSection';
import SettingsRow from '../SettingsRow';
import Button from '../../ui/Button';

const SecurityPanel = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const isLocal = user?.authProvider === 'local';

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setError('');
      await logout();
      navigate('/login');
    } catch {
      setError('Failed to log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      setLoggingOutAll(true);
      setError('');
      setSuccess('');
      await authService.logoutAllSessions();
      setSuccess('Signed out on all other devices. This device remains signed in.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign out on other devices');
    } finally {
      setLoggingOutAll(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <SettingsSection
      title="Security"
      description="Manage how you sign in and control active sessions."
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

      <SettingsRow label="Sessions" hint="Control where your account stays signed in.">
        <div className="settings-security-sessions">
          <p className="settings-field-value settings-field-value--block">
            You&apos;re signed in on this device.
          </p>
          <Button
            variant="secondary"
            type="button"
            glass
            onClick={handleLogoutAll}
            loading={loggingOutAll}
          >
            Sign out on all other devices
          </Button>
        </div>
      </SettingsRow>

      {isLocal ? (
        <div className="settings-security-password">
          <h3 className="settings-subheading">Change password</h3>
          <Form className="settings-security-password__form" onSubmit={handleChangePassword}>
            <Form.Group className="mb-3">
              <Form.Label>Current password</Form.Label>
              <Form.Control
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm new password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </Form.Group>
            <Button variant="primary" type="submit" glass loading={changingPassword}>
              Update password
            </Button>
          </Form>
        </div>
      ) : (
        <SettingsRow
          label="Password"
          hint="Your account uses Google sign-in. Password is managed by Google."
        >
          <p className="settings-field-value settings-field-value--block">
            Not applicable for Google accounts.
          </p>
        </SettingsRow>
      )}

      <div className="settings-security-logout">
        <SettingsRow label="Sign out" hint="End your session on this device.">
          <Button variant="danger" glass onClick={handleLogout} loading={loggingOut}>
            Log out
          </Button>
        </SettingsRow>
      </div>
    </SettingsSection>
  );
};

export default SecurityPanel;
