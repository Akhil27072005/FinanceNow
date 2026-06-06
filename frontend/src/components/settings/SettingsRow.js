import React from 'react';

const SettingsRow = ({ label, hint, children, htmlFor }) => (
  <div className="settings-row">
    <div className="settings-row__label-wrap">
      {htmlFor ? (
        <label className="settings-row__label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : (
        <span className="settings-row__label">{label}</span>
      )}
      {hint && <p className="settings-row__hint">{hint}</p>}
    </div>
    <div className="settings-row__control">{children}</div>
  </div>
);

export default SettingsRow;
