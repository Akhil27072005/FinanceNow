import React, { useState, useMemo, useRef, useCallback } from 'react';
import SettingsNav from '../components/settings/SettingsNav';
import SettingsSaveBar from '../components/settings/SettingsSaveBar';
import ProfilePanel from '../components/settings/panels/ProfilePanel';
import AppearancePanel from '../components/settings/panels/AppearancePanel';
import SecurityPanel from '../components/settings/panels/SecurityPanel';
import RegionalPanel from '../components/settings/panels/RegionalPanel';
import NotificationsPanel from '../components/settings/panels/NotificationsPanel';
import { DataPanel, AboutPanel } from '../components/settings/panels/PlaceholderPanels';
import { PLACEHOLDER_SECTION_IDS } from '../constants/settingsSections';
import '../styles/settings.css';
import '../styles/modal-glass.css';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const profileSaveRef = useRef(null);
  const regionalSaveRef = useRef(null);
  const notificationsSaveRef = useRef(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [regionalSaving, setRegionalSaving] = useState(false);
  const [notificationsSaving, setNotificationsSaving] = useState(false);

  const handleProfileSave = useCallback(async () => {
    if (profileSaveRef.current) await profileSaveRef.current();
  }, []);

  const handleRegionalSave = useCallback(async () => {
    if (regionalSaveRef.current) await regionalSaveRef.current();
  }, []);

  const handleNotificationsSave = useCallback(async () => {
    if (notificationsSaveRef.current) await notificationsSaveRef.current();
  }, []);

  const panel = useMemo(() => {
    switch (activeSection) {
      case 'profile':
        return (
          <ProfilePanel
            onRegisterSave={(fn) => {
              profileSaveRef.current = fn;
            }}
            onSavingChange={setProfileSaving}
          />
        );
      case 'appearance':
        return <AppearancePanel />;
      case 'regional':
        return (
          <RegionalPanel
            onRegisterSave={(fn) => {
              regionalSaveRef.current = fn;
            }}
            onSavingChange={setRegionalSaving}
          />
        );
      case 'notifications':
        return (
          <NotificationsPanel
            onRegisterSave={(fn) => {
              notificationsSaveRef.current = fn;
            }}
            onSavingChange={setNotificationsSaving}
          />
        );
      case 'data':
        return <DataPanel />;
      case 'security':
        return <SecurityPanel />;
      case 'about':
        return <AboutPanel />;
      default:
        return (
          <ProfilePanel
            onRegisterSave={(fn) => {
              profileSaveRef.current = fn;
            }}
            onSavingChange={setProfileSaving}
          />
        );
    }
  }, [activeSection]);

  const showPlaceholderSave = PLACEHOLDER_SECTION_IDS.has(activeSection);

  let saveBar = null;
  if (activeSection === 'profile') {
    saveBar = (
      <SettingsSaveBar
        visible
        onSave={handleProfileSave}
        saving={profileSaving}
        hint="Save your display name."
      />
    );
  } else if (activeSection === 'regional') {
    saveBar = (
      <SettingsSaveBar
        visible
        onSave={handleRegionalSave}
        saving={regionalSaving}
        hint="Save your currency, date format, and timezone."
      />
    );
  } else if (activeSection === 'notifications') {
    saveBar = (
      <SettingsSaveBar
        visible
        onSave={handleNotificationsSave}
        saving={notificationsSaving}
        hint="Save your notification preferences."
      />
    );
  } else if (showPlaceholderSave) {
    saveBar = (
      <SettingsSaveBar
        visible
        disabled
        hint="Saving preferences will be available in a future update."
      />
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <h1 className="settings-page__title">Settings</h1>
        <p className="settings-page__subtitle">
          Manage your account and preferences
        </p>
      </header>

      <div className="settings-page__layout">
        <div className="glass-panel settings-page__nav-panel settings-page__nav-panel--desktop">
          <SettingsNav activeId={activeSection} onSelect={setActiveSection} />
        </div>

        <div className="glass-panel settings-page__content-panel">
          <SettingsNav
            activeId={activeSection}
            onSelect={setActiveSection}
            variant="select"
          />
          <div className="settings-page__content-inner">{panel}</div>
          {saveBar}
        </div>
      </div>
    </div>
  );
};

export default Settings;
