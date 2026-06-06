import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import GlassAlert from '../../ui/GlassAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import { applyAppTheme } from '../../../utils/appTheme';
import SettingsSection from '../SettingsSection';
import SettingsRow from '../SettingsRow';
import ThemePreview from '../ThemePreview';
import Button from '../../ui/Button';
import {
  THEME_PRESETS,
  DEFAULT_THEME_PRESET_ID,
  DEFAULT_GLASS_INTENSITY,
  getThemePresetById
} from '../../../constants/themePresets';

const AppearancePanel = ({ onRegisterSave, onSavingChange }) => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [presetId, setPresetId] = useState(DEFAULT_THEME_PRESET_ID);
  const [glassIntensity, setGlassIntensity] = useState(DEFAULT_GLASS_INTENSITY);
  const [backgroundObjectUrl, setBackgroundObjectUrl] = useState(null);
  const [backgroundName, setBackgroundName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const preset = useMemo(() => getThemePresetById(presetId), [presetId]);

  useEffect(() => {
    const prefs = user?.preferences;
    if (prefs) {
      setPresetId(getThemePresetById(prefs.themePresetId).id);
      const intensity = Number(prefs.glassIntensity);
      setGlassIntensity(
        Number.isFinite(intensity) && intensity >= 0 && intensity <= 100
          ? Math.round(intensity)
          : DEFAULT_GLASS_INTENSITY
      );
    }
  }, [user?.preferences]);

  useEffect(() => {
    return () => {
      if (backgroundObjectUrl) {
        URL.revokeObjectURL(backgroundObjectUrl);
      }
    };
  }, [backgroundObjectUrl]);

  const handleBackgroundSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (backgroundObjectUrl) {
      URL.revokeObjectURL(backgroundObjectUrl);
    }
    const url = URL.createObjectURL(file);
    setBackgroundObjectUrl(url);
    setBackgroundName(file.name);
    e.target.value = '';
  };

  const clearBackground = () => {
    if (backgroundObjectUrl) {
      URL.revokeObjectURL(backgroundObjectUrl);
    }
    setBackgroundObjectUrl(null);
    setBackgroundName('');
  };

  const handleReset = () => {
    setPresetId(DEFAULT_THEME_PRESET_ID);
    setGlassIntensity(DEFAULT_GLASS_INTENSITY);
    clearBackground();
  };

  const handleSave = useCallback(async () => {
    try {
      setError('');
      setSuccess('');
      onSavingChange?.(true);

      const res = await authService.updatePreferences({
        themePresetId: presetId,
        glassIntensity
      });

      const nextPreferences = res.preferences
        ? { ...user?.preferences, ...res.preferences }
        : {
            ...user?.preferences,
            themePresetId: presetId,
            glassIntensity
          };

      if (res.user) {
        updateUser(res.user);
      } else if (res.preferences) {
        updateUser({ preferences: nextPreferences });
      } else {
        updateUser({ preferences: nextPreferences });
      }

      applyAppTheme(nextPreferences);
      setSuccess('Appearance saved. Your theme is applied across the app.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save appearance');
    } finally {
      onSavingChange?.(false);
    }
  }, [glassIntensity, onSavingChange, presetId, updateUser, user?.preferences]);

  useEffect(() => {
    onRegisterSave?.(handleSave);
    return () => onRegisterSave?.(null);
  }, [handleSave, onRegisterSave]);

  return (
    <SettingsSection
      title="Appearance"
      description="Customize colors and glass styling for the app shell, sidebar, and panels."
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

      <div className="settings-appearance">
        <div className="settings-appearance__preview-wrap">
          <p className="settings-appearance__preview-label">Live preview</p>
          <ThemePreview
            preset={preset}
            glassIntensity={glassIntensity}
            backgroundImageUrl={backgroundObjectUrl}
          />
        </div>

        <div className="settings-appearance__controls">
          <SettingsRow label="Color theme" hint="Choose a gradient palette for the app.">
            <div className="settings-preset-grid" role="listbox" aria-label="Color presets">
              {THEME_PRESETS.map((p) => {
                const selected = p.id === presetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`settings-preset-card${selected ? ' settings-preset-card--selected' : ''}`}
                    onClick={() => setPresetId(p.id)}
                    title={p.label}
                  >
                    <span
                      className="settings-preset-card__swatch"
                      style={{ background: p.contentGradient }}
                    />
                    <span className="settings-preset-card__label">{p.label}</span>
                    {selected && (
                      <span className="settings-preset-card__check" aria-hidden>
                        <Check size={14} strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </SettingsRow>

          <SettingsRow
            label="Glass intensity"
            hint={`Frost strength: ${glassIntensity}%`}
            htmlFor="settings-glass-intensity"
          >
            <input
              id="settings-glass-intensity"
              type="range"
              min={0}
              max={100}
              value={glassIntensity}
              onChange={(e) => setGlassIntensity(Number(e.target.value))}
              className="settings-glass-slider"
            />
          </SettingsRow>

          <SettingsRow
            label="Custom background"
            hint="Upload an image for the main content area. Saved to your account in a future update."
          >
            <div className="settings-bg-upload">
              <div
                className="settings-bg-upload__zone"
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {backgroundObjectUrl ? (
                  <img
                    src={backgroundObjectUrl}
                    alt=""
                    className="settings-bg-upload__thumb"
                  />
                ) : (
                  <span className="settings-bg-upload__placeholder">
                    Drop an image or click to browse
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="settings-bg-upload__input"
                onChange={handleBackgroundSelect}
                aria-hidden
                tabIndex={-1}
              />
              <div className="settings-bg-upload__actions">
                <Button variant="secondary" type="button" glass onClick={() => fileInputRef.current?.click()}>
                  Choose image
                </Button>
                {backgroundObjectUrl && (
                  <Button variant="secondary" type="button" glass onClick={clearBackground}>
                    Remove
                  </Button>
                )}
              </div>
              {backgroundName && (
                <p className="settings-bg-upload__filename">{backgroundName}</p>
              )}
            </div>
          </SettingsRow>

          <div className="settings-appearance__reset">
            <Button variant="secondary" type="button" glass onClick={handleReset}>
              Reset to default theme
            </Button>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};

export default AppearancePanel;
