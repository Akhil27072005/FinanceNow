/**
 * Derive theme accent CSS variables from a preset accent hex.
 */

const HEX_SHORT = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
const HEX_FULL = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') {
    return { r: 80, g: 12, b: 176 };
  }

  let normalized = hex.trim();
  const short = normalized.match(HEX_SHORT);
  if (short) {
    normalized = `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  }

  const full = normalized.match(HEX_FULL);
  if (!full) {
    return { r: 80, g: 12, b: 176 };
  }

  return {
    r: parseInt(full[1], 16),
    g: parseInt(full[2], 16),
    b: parseInt(full[3], 16)
  };
};

export const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b].map((c) => Math.min(255, Math.max(0, Math.round(c))).toString(16).padStart(2, '0')).join('')}`;

export const darkenHex = (hex, amount = 0.12) => {
  const { r, g, b } = hexToRgb(hex);
  const scale = (c) => Math.round(c * (1 - amount));
  return rgbToHex({ r: scale(r), g: scale(g), b: scale(b) });
};

export const lightenHex = (hex, amount = 0.18) => {
  const { r, g, b } = hexToRgb(hex);
  const scale = (c) => Math.min(255, Math.round(c + (255 - c) * amount));
  return rgbToHex({ r: scale(r), g: scale(g), b: scale(b) });
};

export const rgbaFromHex = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Build accent-related CSS custom properties for global theming.
 * @param {string} accent
 * @param {string} [accentSoft]
 * @param {'light'|'dark'} [mode]
 */
export const accentToCssVars = (accent, accentSoft, mode = 'light') => {
  const isDark = mode === 'dark';
  const { r, g, b } = hexToRgb(accent);
  const rgb = `${r}, ${g}, ${b}`;
  const soft = accentSoft || rgbaFromHex(accent, isDark ? 0.18 : 0.14);

  const accentText = isDark ? lightenHex(accent, 0.2) : darkenHex(accent, 0.08);
  const pickerHoverBg = isDark
    ? `linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, ${rgbaFromHex(accent, 0.12)} 48%, ${rgbaFromHex(accent, 0.08)} 100%)`
    : `linear-gradient(145deg, rgba(255, 255, 255, 0.78) 0%, ${rgbaFromHex(accent, 0.1)} 48%, ${rgbaFromHex(accent, 0.07)} 100%)`;
  const filterPopoverBg = isDark
    ? `linear-gradient(165deg, rgba(15, 23, 42, 0.92) 0%, rgba(17, 24, 39, 0.9) 48%, ${rgbaFromHex(accent, 0.08)} 100%)`
    : `linear-gradient(165deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.94) 48%, ${rgbaFromHex(accent, 0.07)} 100%)`;
  const filterBtnBg = isDark
    ? `linear-gradient(145deg, ${rgbaFromHex(accent, 0.16)} 0%, rgba(255, 255, 255, 0.04) 100%)`
    : `linear-gradient(145deg, ${rgbaFromHex(accent, 0.1)} 0%, rgba(255, 255, 255, 0.35) 100%)`;
  const filterBtnBgActive = isDark
    ? `linear-gradient(145deg, ${rgbaFromHex(accent, 0.22)} 0%, rgba(255, 255, 255, 0.06) 100%)`
    : `linear-gradient(145deg, ${rgbaFromHex(accent, 0.14)} 0%, rgba(255, 255, 255, 0.35) 100%)`;
  const pickerGlassShadow = isDark
    ? `0 8px 32px rgba(0, 0, 0, 0.35), 0 4px 16px ${rgbaFromHex(accent, 0.08)}`
    : `0 8px 32px ${rgbaFromHex(accent, 0.06)}, 0 4px 16px rgba(18, 18, 18, 0.04)`;
  const pickerHoverShadow = isDark
    ? `0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 10px ${rgbaFromHex(accent, 0.1)}`
    : `0 4px 16px ${rgbaFromHex(accent, 0.07)}, 0 2px 10px rgba(249, 115, 22, 0.05)`;

  return {
    '--accent-rgb': rgb,
    '--accent-text': accentText,
    '--accent-bright': lightenHex(accent, 0.16),
    '--info': accent,
    '--info-hover': isDark ? lightenHex(accent, 0.08) : darkenHex(accent, 0.1),
    '--info-focus-ring': rgbaFromHex(accent, isDark ? 0.25 : 0.15),
    '--info-shadow': rgbaFromHex(accent, isDark ? 0.3 : 0.2),
    '--info-shadow-hover': rgbaFromHex(accent, isDark ? 0.4 : 0.3),
    '--app-accent': accent,
    '--app-accent-soft': soft,
    '--app-accent-ring': rgbaFromHex(accent, isDark ? 0.2 : 0.12),
    '--app-accent-border': rgbaFromHex(accent, isDark ? 0.55 : 0.45),
    '--app-accent-shadow': rgbaFromHex(accent, isDark ? 0.15 : 0.08),
    '--app-accent-shadow-md': rgbaFromHex(accent, isDark ? 0.28 : 0.18),
    '--accent-glass-border': rgbaFromHex(accent, isDark ? 0.55 : 0.45),
    '--accent-glass-bg': rgbaFromHex(accent, 0.88),
    '--accent-glass-bg-hover': rgbaFromHex(accent, 0.95),
    '--accent-glass-shadow': rgbaFromHex(accent, isDark ? 0.35 : 0.25),
    '--accent-glass-shadow-hover': rgbaFromHex(accent, isDark ? 0.4 : 0.3),
    '--picker-accent-soft': rgbaFromHex(accent, isDark ? 0.14 : 0.1),
    '--picker-accent-mid': rgbaFromHex(accent, isDark ? 0.24 : 0.18),
    '--picker-accent-strong': rgbaFromHex(accent, 0.82),
    '--picker-glass-shadow': pickerGlassShadow,
    '--picker-hover-shadow': pickerHoverShadow,
    '--picker-hover-bg': pickerHoverBg,
    '--picker-today-bg': rgbaFromHex(accent, isDark ? 0.18 : 0.12),
    '--filter-popover-bg': filterPopoverBg,
    '--filter-btn-bg': filterBtnBg,
    '--filter-btn-bg-active': filterBtnBgActive,
    '--filter-control-border': rgbaFromHex(accent, isDark ? 0.38 : 0.28),
    '--filter-footer-border': rgbaFromHex(accent, isDark ? 0.3 : 0.22),
    '--glass-accent-ring': rgbaFromHex(accent, isDark ? 0.2 : 0.12)
  };
};

/**
 * Chart palette derived from the active accent (reports, donuts, etc.).
 */
export const accentToChartPalette = (accent) => {
  const bright = lightenHex(accent, 0.16);
  const light = lightenHex(accent, 0.38);
  const lighter = lightenHex(accent, 0.52);
  const deep = darkenHex(accent, 0.08);
  const mid = lightenHex(accent, 0.08);

  return [bright, light, lighter, mid, lightenHex(accent, 0.24), lightenHex(accent, 0.45), deep, lightenHex(accent, 0.48)];
};
