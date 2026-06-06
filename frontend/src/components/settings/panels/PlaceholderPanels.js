import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SettingsSection from '../SettingsSection';
import SettingsRow from '../SettingsRow';
import ConfirmationModal from '../../ui/ConfirmationModal';

export const DataPanel = () => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState('delete');

  const openConfirm = (kind) => {
    setConfirmKind(kind);
    setConfirmOpen(true);
  };

  const confirmMessage =
    confirmKind === 'account'
      ? 'Account deletion is not available yet. Your data has not been changed.'
      : 'Bulk data deletion is not available yet. Your data has not been changed.';

  return (
    <SettingsSection
      title="Data & privacy"
      description="Export your data or manage account removal."
      badge="Not saved yet"
    >
      <div className="settings-link-list">
        <button
          type="button"
          className="settings-link-row"
          onClick={() => navigate('/reports')}
        >
          <span className="settings-link-row__title">Export & reports</span>
          <span className="settings-link-row__desc">Open Reports to export transactions and charts</span>
        </button>
        <button
          type="button"
          className="settings-link-row"
          onClick={() => openConfirm('data')}
        >
          <span className="settings-link-row__title">Delete all financial data</span>
          <span className="settings-link-row__desc">Remove transactions, budgets, and related records</span>
        </button>
        <button
          type="button"
          className="settings-link-row settings-link-row--danger"
          onClick={() => openConfirm('account')}
        >
          <span className="settings-link-row__title">Delete account</span>
          <span className="settings-link-row__desc">Permanently delete your account and all data</span>
        </button>
      </div>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        title="Not available yet"
        message={confirmMessage}
        confirmText="OK"
        cancelText="Close"
        variant="primary"
      />
    </SettingsSection>
  );
};

export const AboutPanel = () => (
  <SettingsSection
    title="About"
    description="FinanceNow — personal finance tracking with glass UI."
  >
    <SettingsRow label="Application">
      <span className="settings-field-value">FinanceNow</span>
    </SettingsRow>
    <SettingsRow label="Version">
      <span className="settings-field-value">0.1.0</span>
    </SettingsRow>
    <div className="settings-about-links">
      <button type="button" className="settings-about-links__item">
        Privacy policy
      </button>
      <button type="button" className="settings-about-links__item">
        Terms of service
      </button>
      <button type="button" className="settings-about-links__item">
        Support
      </button>
    </div>
  </SettingsSection>
);
