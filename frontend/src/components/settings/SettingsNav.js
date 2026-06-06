import React from 'react';
import { SETTINGS_SECTIONS } from '../../constants/settingsSections';

const SettingsNav = ({ activeId, onSelect, variant = 'sidebar' }) => {
  if (variant === 'select') {
    return (
      <div className="settings-nav settings-nav--mobile">
        <label className="settings-nav__mobile-label" htmlFor="settings-section-select">
          Section
        </label>
        <select
          id="settings-section-select"
          className="settings-nav__mobile-select"
          value={activeId}
          onChange={(e) => onSelect(e.target.value)}
        >
          {SETTINGS_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <nav className="settings-nav" aria-label="Settings sections">
      <ul className="settings-nav__list">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeId === section.id;
          return (
            <li key={section.id}>
              <button
                type="button"
                className={`settings-nav__item${isActive ? ' settings-nav__item--active' : ''}`}
                onClick={() => onSelect(section.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={2} aria-hidden />
                <span>{section.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SettingsNav;
