import React from 'react';
import Button from '../ui/Button';

const SettingsSaveBar = ({
  visible = true,
  onSave,
  saving = false,
  saveLabel = 'Save changes',
  hint = 'Saving preferences will be available in a future update.',
  disabled = false
}) => {
  if (!visible) return null;

  const isActionable = Boolean(onSave);

  return (
    <div className="settings-save-bar">
      <p className="settings-save-bar__hint">{hint}</p>
      <Button
        variant="primary"
        type="button"
        glass
        onClick={onSave}
        loading={saving}
        disabled={disabled || !isActionable}
        title={disabled && !isActionable ? 'Not available yet' : undefined}
      >
        {saveLabel}
      </Button>
    </div>
  );
};

export default SettingsSaveBar;
