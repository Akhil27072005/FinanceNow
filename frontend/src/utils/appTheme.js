import {
  DEFAULT_THEME_PRESET_ID,
  DEFAULT_GLASS_INTENSITY,
  getThemePresetById,
  glassIntensityToGlassVars
} from '../constants/themePresets';
import { accentToCssVars, accentToChartPalette, rgbaFromHex } from './accentColor';

export const DEFAULT_APPEARANCE = {
  themePresetId: DEFAULT_THEME_PRESET_ID,
  glassIntensity: DEFAULT_GLASS_INTENSITY
};

const THEME_VAR_KEYS = [
  '--app-content-gradient',
  '--app-sidebar-gradient',
  '--app-blob-primary',
  '--app-blob-secondary',
  '--app-accent',
  '--app-accent-soft',
  '--app-accent-ring',
  '--app-accent-border',
  '--app-accent-shadow',
  '--app-accent-shadow-md',
  '--glass-bg',
  '--glass-bg-strong',
  '--glass-blur',
  '--glass-saturate',
  '--accent-rgb',
  '--accent-text',
  '--accent-bright',
  '--info',
  '--info-hover',
  '--info-focus-ring',
  '--info-shadow',
  '--info-shadow-hover',
  '--accent-glass-border',
  '--accent-glass-bg',
  '--accent-glass-bg-hover',
  '--accent-glass-shadow',
  '--accent-glass-shadow-hover',
  '--picker-accent-soft',
  '--picker-accent-mid',
  '--picker-accent-strong',
  '--picker-glass-shadow',
  '--picker-hover-shadow',
  '--picker-hover-bg',
  '--picker-today-bg',
  '--filter-popover-bg',
  '--filter-btn-bg',
  '--filter-btn-bg-active',
  '--filter-control-border',
  '--filter-footer-border',
  '--glass-accent-ring'
];

/**
 * Normalize appearance fields from user.preferences.
 */
export const normalizeAppearancePreferences = (preferences) => {
  const preset = getThemePresetById(preferences?.themePresetId);
  const intensity = Number(preferences?.glassIntensity);

  return {
    themePresetId: preset.id,
    glassIntensity:
      Number.isFinite(intensity) && intensity >= 0 && intensity <= 100
        ? Math.round(intensity)
        : DEFAULT_GLASS_INTENSITY
  };
};

/**
 * Build CSS custom properties for the active theme preset + glass intensity.
 */
export const appearanceToCssVars = (preferences) => {
  const appearance = normalizeAppearancePreferences(preferences);
  const preset = getThemePresetById(appearance.themePresetId);
  const glassVars = glassIntensityToGlassVars(appearance.glassIntensity);
  const accentVars = accentToCssVars(preset.accent, preset.accentSoft);

  return {
    '--app-content-gradient': preset.contentGradient,
    '--app-sidebar-gradient': preset.sidebarGradient,
    '--app-blob-primary': preset.blobPrimary,
    '--app-blob-secondary': preset.blobSecondary,
    ...accentVars,
    ...glassVars
  };
};

/** Reports / chart colors for the active theme preset */
export const getThemeChartColors = (preferences) => {
  const preset = getThemePresetById(normalizeAppearancePreferences(preferences).themePresetId);
  return accentToChartPalette(preset.accent);
};

export const getThemeExpenseChartColor = (preferences) => {
  const preset = getThemePresetById(normalizeAppearancePreferences(preferences).themePresetId);
  const accentVars = accentToCssVars(preset.accent, preset.accentSoft);
  return accentVars['--accent-bright'];
};

export const getThemeExpenseChartGradient = (preferences) => {
  const preset = getThemePresetById(normalizeAppearancePreferences(preferences).themePresetId);
  return rgbaFromHex(preset.accent, 0.35);
};

/**
 * Apply theme to the document root (single source of truth for app-wide theming).
 */
export const applyAppTheme = (preferences) => {
  const root = document.documentElement;
  const vars = appearanceToCssVars(preferences);
  const appearance = normalizeAppearancePreferences(preferences);

  THEME_VAR_KEYS.forEach((key) => {
    root.style.removeProperty(key);
  });

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.dataset.themePreset = appearance.themePresetId;
};

/**
 * Restore default Violet Dawn appearance (e.g. on logout).
 */
export const resetAppTheme = () => {
  applyAppTheme(DEFAULT_APPEARANCE);
};
