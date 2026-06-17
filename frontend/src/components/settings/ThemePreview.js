import React, { useMemo } from 'react';
import { glassIntensityToPreviewVars } from '../../constants/themePresets';

const ThemePreview = ({ preset, glassIntensity, backgroundImageUrl }) => {
  const isDark = preset.mode === 'dark';

  const previewStyle = useMemo(() => {
    const glassVars = glassIntensityToPreviewVars(preset, glassIntensity);
    return {
      ...glassVars,
      '--preview-accent': preset.accent,
      '--preview-accent-soft': preset.accentSoft,
      '--preview-content-gradient': preset.contentGradient,
      '--preview-sidebar-gradient': preset.sidebarGradient,
      '--preview-blob-primary': preset.blobPrimary,
      '--preview-blob-secondary': preset.blobSecondary,
      ...(backgroundImageUrl
        ? {
            '--preview-bg-image': `url(${backgroundImageUrl})`
          }
        : {})
    };
  }, [preset, glassIntensity, backgroundImageUrl]);

  return (
    <div
      className={`settings-theme-preview${backgroundImageUrl ? ' settings-theme-preview--custom-bg' : ''}${isDark ? ' settings-theme-preview--dark' : ''}`}
      style={previewStyle}
      aria-label="Theme preview"
    >
      <div className="settings-theme-preview__backdrop" aria-hidden />
      <div className="settings-theme-preview__layout">
        <aside className="settings-theme-preview__sidebar" aria-hidden>
          <div className="settings-theme-preview__sidebar-logo" />
          <div className="settings-theme-preview__sidebar-item settings-theme-preview__sidebar-item--active" />
          <div className="settings-theme-preview__sidebar-item" />
          <div className="settings-theme-preview__sidebar-item" />
        </aside>
        <main className="settings-theme-preview__main">
          <div className="settings-theme-preview__card">
            <div className="settings-theme-preview__card-line settings-theme-preview__card-line--short" />
            <div className="settings-theme-preview__card-line" />
            <div className="settings-theme-preview__card-line settings-theme-preview__card-line--muted" />
            <button type="button" className="settings-theme-preview__btn" tabIndex={-1}>
              Sample action
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ThemePreview;
