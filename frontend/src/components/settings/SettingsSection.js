import React from 'react';

const SettingsSection = ({ title, description, badge, children, footer }) => (
  <div className="settings-section">
    <header className="settings-section__header">
      <div>
        <h2 className="settings-section__title">{title}</h2>
        {description && <p className="settings-section__desc">{description}</p>}
      </div>
      {badge && <span className="settings-badge">{badge}</span>}
    </header>
    <div className="settings-section__body">{children}</div>
    {footer && <footer className="settings-section__footer">{footer}</footer>}
  </div>
);

export default SettingsSection;
