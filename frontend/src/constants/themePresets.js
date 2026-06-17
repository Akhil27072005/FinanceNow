/**
 * Appearance presets — applied globally via appTheme utilities.
 */
import { hexToRgb } from '../utils/accentColor';

export const DEFAULT_THEME_PRESET_ID = 'slateProfessional';
export const DEFAULT_GLASS_INTENSITY = 65;

const LIGHT_GLASS = {
  glassBg: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.9)'
};

const DEPRECATED_PRESET_IDS = new Set([
  'violetDawn',
  'oceanTeal',
  'forestGreen',
  'sunsetCoral',
  'roseBlush',
  'slateSteel',
  'amberGold',
  'mintFresh',
  'berryWine',
  'charcoalNoir'
]);

/** Parse alpha from rgba(...) string */
const parseRgbaAlpha = (rgba) => {
  const match = String(rgba).match(/rgba?\([^)]+,\s*([\d.]+)\s*\)/);
  return match ? parseFloat(match[1]) : 0.75;
};

/** Adjust rgba alpha by delta, clamped 0–1 */
const adjustRgbaAlpha = (rgba, delta) => {
  const match = String(rgba).match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
  if (!match) return rgba;
  const alpha = Math.min(1, Math.max(0, parseFloat(match[4]) + delta));
  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha.toFixed(2)})`;
};

/** Primary shell/content base color for opaque surfaces */
const extractPresetSurfaceHex = (preset) => {
  const sources = [preset.shellBackground, preset.contentGradient];
  for (const gradient of sources) {
    if (!gradient) continue;
    const gradientStr = String(gradient);
    const midMatch = gradientStr.match(/#([0-9a-fA-F]{6})\s+280px/i);
    if (midMatch) return `#${midMatch[1]}`;
    const linearPart = gradientStr.includes('linear-gradient')
      ? gradientStr.slice(gradientStr.lastIndexOf('linear-gradient'))
      : gradientStr;
    const hexes = linearPart.match(/#([0-9a-fA-F]{6})/gi);
    if (hexes?.length) return hexes[Math.min(1, hexes.length - 1)];
  }
  return preset.mode === 'dark' ? '#0f172a' : '#ffffff';
};

const mixRgb = (base, accent, accentWeight) => ({
  r: Math.round(base.r * (1 - accentWeight) + accent.r * accentWeight),
  g: Math.round(base.g * (1 - accentWeight) + accent.g * accentWeight),
  b: Math.round(base.b * (1 - accentWeight) + accent.b * accentWeight)
});

/** Readable filter popover surfaces tinted by active preset */
const filterPopoverSurfacesForPreset = (preset, t) => {
  const isDark = preset.mode === 'dark';
  const base = hexToRgb(extractPresetSurfaceHex(preset));
  const accent = hexToRgb(preset.accent);
  const { r, g, b } = mixRgb(base, accent, isDark ? 0.1 : 0.06);

  if (isDark) {
    const surfaceAlpha = Math.min(0.94, 0.86 + t * 0.08);
    const footerAlpha = Math.min(0.97, surfaceAlpha + 0.05);
    return {
      surface: `rgba(${r}, ${g}, ${b}, ${surfaceAlpha.toFixed(2)})`,
      footer: `rgba(${Math.max(0, r - 4)}, ${Math.max(0, g - 4)}, ${Math.max(0, b - 4)}, ${footerAlpha.toFixed(2)})`
    };
  }

  const surfaceAlpha = Math.min(0.98, 0.9 + t * 0.06);
  const footerAlpha = Math.min(0.99, surfaceAlpha + 0.03);
  return {
    surface: `rgba(${r}, ${g}, ${b}, ${surfaceAlpha.toFixed(2)})`,
    footer: `rgba(${Math.min(255, r + 4)}, ${Math.min(255, g + 4)}, ${Math.min(255, b + 4)}, ${footerAlpha.toFixed(2)})`
  };
};

export const THEME_PRESETS = [
  // —— Dark themes ——
  {
    id: 'slateProfessional',
    label: 'Slate Professional',
    mode: 'dark',
    accent: '#94a3b8',
    accentSoft: 'rgba(148, 163, 184, 0.18)',
    contentGradient:
      'linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e293b 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(10, 15, 28, 0.96) 0%, rgba(15, 23, 42, 0.94) 50%, rgba(17, 24, 39, 0.92) 100%)',
    shellBackground: 'linear-gradient(90deg, #0a0f1a 0%, #0f172a 280px, #111827 100%)',
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.06)',
    blobPrimary: 'rgba(148, 163, 184, 0.12)',
    blobSecondary: 'rgba(100, 116, 139, 0.08)'
  },
  {
    id: 'deepNavy',
    label: 'Deep Navy',
    mode: 'dark',
    accent: '#3b82f6',
    accentSoft: 'rgba(59, 130, 246, 0.18)',
    contentGradient:
      'linear-gradient(135deg, #081120 0%, #0f172a 50%, #1e3a5f 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(6, 14, 28, 0.96) 0%, rgba(8, 17, 32, 0.94) 50%, rgba(15, 23, 42, 0.92) 100%)',
    shellBackground: 'linear-gradient(90deg, #060d18 0%, #081120 280px, #0f172a 100%)',
    glassBg: 'rgba(255, 255, 255, 0.04)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    blobPrimary: 'rgba(59, 130, 246, 0.14)',
    blobSecondary: 'rgba(30, 58, 95, 0.1)'
  },
  {
    id: 'midnightBlueCyan',
    label: 'Midnight Blue + Cyan',
    mode: 'dark',
    accent: '#38bdf8',
    accentSoft: 'rgba(56, 189, 248, 0.18)',
    contentGradient:
      'radial-gradient(circle at top right, rgba(56, 189, 248, 0.15), transparent 35%), linear-gradient(135deg, #0a0f1f, #111827, #0f172a)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(8, 12, 24, 0.96) 0%, rgba(10, 15, 31, 0.94) 50%, rgba(15, 23, 42, 0.92) 100%)',
    shellBackground: 'linear-gradient(90deg, #060a14 0%, #0a0f1f 280px, #0f172a 100%)',
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.06)',
    blobPrimary: 'rgba(56, 189, 248, 0.08)',
    blobSecondary: 'rgba(56, 189, 248, 0.05)'
  },
  {
    id: 'graphite',
    label: 'Graphite',
    mode: 'dark',
    accent: '#9ca3af',
    accentSoft: 'rgba(156, 163, 175, 0.18)',
    contentGradient:
      'linear-gradient(135deg, #111111, #1c1c1c, #2b2b2b)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(12, 12, 12, 0.96) 0%, rgba(17, 17, 17, 0.94) 50%, rgba(28, 28, 28, 0.92) 100%)',
    shellBackground: 'linear-gradient(90deg, #0a0a0a 0%, #111111 280px, #1c1c1c 100%)',
    glassBg: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.07)',
    blobPrimary: 'rgba(156, 163, 175, 0.1)',
    blobSecondary: 'rgba(107, 114, 128, 0.08)'
  },
  {
    id: 'darkTeal',
    label: 'Dark Teal',
    mode: 'dark',
    accent: '#14b8a6',
    accentSoft: 'rgba(20, 184, 166, 0.18)',
    contentGradient:
      'linear-gradient(135deg, #071a1d, #0f2a2d, #14373a)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(5, 20, 22, 0.96) 0%, rgba(7, 26, 29, 0.94) 50%, rgba(15, 42, 45, 0.92) 100%)',
    shellBackground: 'linear-gradient(90deg, #051214 0%, #071a1d 280px, #0f2a2d 100%)',
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.06)',
    blobPrimary: 'rgba(20, 184, 166, 0.12)',
    blobSecondary: 'rgba(20, 184, 166, 0.06)'
  },
  {
    id: 'financeTerminal',
    label: 'Finance Terminal',
    mode: 'dark',
    accent: '#22c55e',
    accentSoft: 'rgba(34, 197, 94, 0.18)',
    contentGradient:
      'linear-gradient(135deg, #050505, #0d1117, #111827)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(4, 4, 4, 0.97) 0%, rgba(8, 12, 18, 0.95) 50%, rgba(13, 17, 23, 0.93) 100%)',
    shellBackground: 'linear-gradient(90deg, #030303 0%, #050505 280px, #0d1117 100%)',
    glassBg: 'rgba(255, 255, 255, 0.04)',
    glassBorder: 'rgba(255, 255, 255, 0.06)',
    blobPrimary: 'rgba(34, 197, 94, 0.1)',
    blobSecondary: 'rgba(34, 197, 94, 0.05)'
  },
  {
    id: 'indigoCorporate',
    label: 'Indigo Corporate',
    mode: 'dark',
    accent: '#818cf8',
    accentSoft: 'rgba(129, 140, 248, 0.18)',
    contentGradient:
      'linear-gradient(135deg, #131a2d, #1f2942, #2b3554)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(14, 20, 36, 0.96) 0%, rgba(19, 26, 45, 0.94) 50%, rgba(31, 41, 66, 0.92) 100%)',
    shellBackground: 'linear-gradient(90deg, #0e1424 0%, #131a2d 280px, #1f2942 100%)',
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.06)',
    blobPrimary: 'rgba(129, 140, 248, 0.12)',
    blobSecondary: 'rgba(99, 102, 241, 0.08)'
  },
  {
    id: 'emeraldFinance',
    label: 'Emerald Finance',
    mode: 'dark',
    accent: '#10b981',
    accentSoft: 'rgba(16, 185, 129, 0.18)',
    contentGradient:
      'radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), transparent 40%), linear-gradient(135deg, #0b1412, #111827, #0f1f19)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(8, 16, 14, 0.96) 0%, rgba(11, 20, 18, 0.94) 50%, rgba(15, 31, 25, 0.92) 100%)',
    shellBackground: 'linear-gradient(90deg, #070f0d 0%, #0b1412 280px, #111827 100%)',
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.06)',
    blobPrimary: 'rgba(16, 185, 129, 0.08)',
    blobSecondary: 'rgba(16, 185, 129, 0.04)'
  },
  // —— Light themes (new) ——
  {
    id: 'mint',
    label: 'Mint',
    mode: 'light',
    accent: '#10b981',
    accentSoft: 'rgba(16, 185, 129, 0.14)',
    contentGradient:
      'radial-gradient(circle at top left, rgba(16, 185, 129, 0.08), transparent 35%), linear-gradient(135deg, #f8fffb, #edf9f2, #dff0e5)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(237,249,242,0.76) 50%, rgba(223,240,229,0.78) 100%)',
    shellBackground: 'linear-gradient(90deg, #e8f5ee 0%, #edf9f2 280px, #f0faf4 100%)',
    ...LIGHT_GLASS,
    blobPrimary: 'rgba(16, 185, 129, 0.28)',
    blobSecondary: 'rgba(110, 231, 183, 0.2)'
  },
  {
    id: 'sand',
    label: 'Sand',
    mode: 'light',
    accent: '#d4a574',
    accentSoft: 'rgba(212, 165, 116, 0.14)',
    contentGradient:
      'linear-gradient(135deg, #fcfbf8, #f3eee6, #e9e1d7)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(243,238,230,0.76) 50%, rgba(233,225,215,0.78) 100%)',
    shellBackground: 'linear-gradient(90deg, #ebe6df 0%, #f3eee6 280px, #f7f4ef 100%)',
    glassBg: 'rgba(255, 255, 255, 0.78)',
    glassBorder: 'rgba(255, 255, 255, 0.95)',
    blobPrimary: 'rgba(212, 165, 116, 0.28)',
    blobSecondary: 'rgba(180, 140, 100, 0.18)'
  },
  {
    id: 'silver',
    label: 'Silver',
    mode: 'light',
    accent: '#64748b',
    accentSoft: 'rgba(100, 116, 139, 0.14)',
    contentGradient:
      'linear-gradient(135deg, #ffffff, #f4f6f8, #e8ecf1)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.88) 0%, rgba(244,246,248,0.8) 50%, rgba(232,236,241,0.82) 100%)',
    shellBackground: 'linear-gradient(90deg, #e4e8ed 0%, #f4f6f8 280px, #f8fafc 100%)',
    glassBg: 'rgba(255, 255, 255, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.95)',
    blobPrimary: 'rgba(100, 116, 139, 0.22)',
    blobSecondary: 'rgba(148, 163, 184, 0.18)'
  },
  // —— Light themes (kept) ——
  {
    id: 'royalPlum',
    label: 'Royal Plum',
    mode: 'light',
    accent: '#6d28d9',
    accentSoft: 'rgba(109, 40, 217, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #f3f0fa 0%, #ebe4f8 40%, #f5f0ff 70%, #ede9fe 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.8) 0%, rgba(243,237,255,0.75) 50%, rgba(237,233,254,0.78) 100%)',
    shellBackground: 'linear-gradient(90deg, #e8e4f0 0%, #ebe4f8 280px, #f0ecfa 100%)',
    ...LIGHT_GLASS,
    blobPrimary: 'rgba(109, 40, 217, 0.32)',
    blobSecondary: 'rgba(167, 139, 250, 0.25)'
  },
  {
    id: 'midnightBlue',
    label: 'Midnight Blue',
    mode: 'light',
    accent: '#1d4ed8',
    accentSoft: 'rgba(29, 78, 216, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #eff6ff 0%, #dbeafe 35%, #e0e7ff 70%, #ede9fe 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(219,234,254,0.76) 50%, rgba(224,231,255,0.78) 100%)',
    shellBackground: 'linear-gradient(90deg, #dce8f8 0%, #dbeafe 280px, #e8eeff 100%)',
    ...LIGHT_GLASS,
    blobPrimary: 'rgba(29, 78, 216, 0.3)',
    blobSecondary: 'rgba(99, 102, 241, 0.22)'
  },
  {
    id: 'skyCyan',
    label: 'Sky Cyan',
    mode: 'light',
    accent: '#0284c7',
    accentSoft: 'rgba(2, 132, 199, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 35%, #ecfeff 70%, #f0fdfa 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(224,242,254,0.76) 50%, rgba(236,254,255,0.78) 100%)',
    shellBackground: 'linear-gradient(90deg, #d8eef8 0%, #e0f2fe 280px, #ecf8ff 100%)',
    ...LIGHT_GLASS,
    blobPrimary: 'rgba(2, 132, 199, 0.3)',
    blobSecondary: 'rgba(56, 189, 248, 0.22)'
  },
  {
    id: 'lavenderMist',
    label: 'Lavender Mist',
    mode: 'light',
    accent: '#7c3aed',
    accentSoft: 'rgba(124, 58, 237, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #faf5ff 0%, #f3e8ff 35%, #ede9fe 70%, #e0e7ff 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(243,232,255,0.76) 50%, rgba(237,233,254,0.78) 100%)',
    shellBackground: 'linear-gradient(90deg, #ebe4f8 0%, #f3e8ff 280px, #f5f0ff 100%)',
    ...LIGHT_GLASS,
    blobPrimary: 'rgba(124, 58, 237, 0.3)',
    blobSecondary: 'rgba(196, 181, 253, 0.25)'
  },
  {
    id: 'electricIndigo',
    label: 'Electric Indigo',
    mode: 'light',
    accent: '#4338ca',
    accentSoft: 'rgba(67, 56, 202, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #eef2ff 0%, #e0e7ff 35%, #ede9fe 70%, #f5f3ff 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(224,231,255,0.76) 50%, rgba(237,233,254,0.78) 100%)',
    shellBackground: 'linear-gradient(90deg, #dce2f8 0%, #e0e7ff 280px, #eef0ff 100%)',
    ...LIGHT_GLASS,
    blobPrimary: 'rgba(67, 56, 202, 0.32)',
    blobSecondary: 'rgba(129, 140, 248, 0.22)'
  }
];

export const DARK_THEME_PRESETS = THEME_PRESETS.filter((p) => p.mode === 'dark');
export const LIGHT_THEME_PRESETS = THEME_PRESETS.filter((p) => p.mode === 'light');

export const getThemePresetById = (id) => {
  const resolved =
    !id || DEPRECATED_PRESET_IDS.has(id) || !THEME_PRESETS.some((p) => p.id === id)
      ? DEFAULT_THEME_PRESET_ID
      : id;
  return THEME_PRESETS.find((p) => p.id === resolved) || THEME_PRESETS[0];
};

/**
 * Map glass intensity 0–100 + preset to app shell glass CSS variables.
 */
export const glassVarsForPreset = (preset, intensity) => {
  const t = Math.min(100, Math.max(0, intensity)) / 100;
  const isDark = preset.mode === 'dark';
  const baseBgAlpha = parseRgbaAlpha(preset.glassBg);
  const baseBorderAlpha = parseRgbaAlpha(preset.glassBorder);

  let blur;
  let bgAlpha;
  let bgAlphaStrong;
  let borderAlpha;
  const saturate = isDark ? 1.05 + t * 0.15 : 1.05 + t * 0.2;

  if (isDark) {
    blur = 16 + t * 12;
    const opacityNudge = (t - 0.5) * 0.025;
    bgAlpha = Math.min(0.07, Math.max(0.02, baseBgAlpha + opacityNudge - 0.015));
    bgAlphaStrong = Math.min(0.09, bgAlpha + 0.02);
    borderAlpha = Math.min(0.09, Math.max(0.03, baseBorderAlpha + opacityNudge * 0.4 - 0.02));
  } else {
    blur = 8 + t * 20;
    const opacityNudge = (t - 0.5) * 0.15;
    bgAlpha = Math.min(0.95, Math.max(0.5, baseBgAlpha + opacityNudge));
    bgAlphaStrong = Math.min(0.98, bgAlpha + 0.08);
    borderAlpha = Math.min(1, Math.max(0.7, baseBorderAlpha + opacityNudge * 0.3));
  }

  const glassBg = adjustRgbaAlpha(preset.glassBg, bgAlpha - baseBgAlpha);
  const glassBorder = adjustRgbaAlpha(preset.glassBorder, borderAlpha - baseBorderAlpha);
  const glassBgStrong = adjustRgbaAlpha(glassBg, bgAlphaStrong - bgAlpha);
  const { surface: filterPopoverSurfaceBg, footer: filterPopoverFooterBg } =
    filterPopoverSurfacesForPreset(preset, t);
  const pickerChipBg = isDark ? glassBgStrong : adjustRgbaAlpha(glassBg, -0.12);
  const tileBg = isDark ? 'rgba(255, 255, 255, 0.02)' : adjustRgbaAlpha(preset.glassBg, -0.2);
  const tileBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : adjustRgbaAlpha(preset.glassBorder, -0.1);
  const subtleBg = isDark ? 'rgba(255, 255, 255, 0.025)' : adjustRgbaAlpha(preset.glassBg, -0.28);

  const glassShadow = isDark
    ? `0 8px 32px rgba(0, 0, 0, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2)`
    : `0 8px 32px rgba(var(--accent-rgb), 0.06), 0 4px 16px rgba(18, 18, 18, 0.04)`;

  return {
    '--glass-blur': `${blur}px`,
    '--glass-bg': glassBg,
    '--glass-bg-strong': glassBgStrong,
    '--glass-border': glassBorder,
    '--glass-saturate': String(saturate.toFixed(2)),
    '--glass-tile-bg': tileBg,
    '--glass-tile-border': tileBorder,
    '--glass-panel-subtle-bg': subtleBg,
    '--glass-shadow': glassShadow,
    '--picker-popover-bg': glassBg,
    '--picker-popover-border': glassBorder,
    '--picker-glass-bg': glassBgStrong,
    '--picker-glass-border': glassBorder,
    '--picker-chip-bg': pickerChipBg,
    '--picker-chip-border': glassBorder,
    '--filter-popover-surface-bg': filterPopoverSurfaceBg,
    '--filter-popover-footer-bg': filterPopoverFooterBg
  };
};

/** @deprecated Use glassVarsForPreset */
export const glassIntensityToGlassVars = (intensity) =>
  glassVarsForPreset(getThemePresetById(DEFAULT_THEME_PRESET_ID), intensity);

/** Map preset + glass intensity to settings preview CSS values */
export const glassIntensityToPreviewVars = (preset, intensity) => {
  const glass = glassVarsForPreset(preset, intensity);
  return {
    '--preview-glass-blur': glass['--glass-blur'],
    '--preview-glass-bg': glass['--glass-bg'],
    '--preview-glass-border': glass['--glass-border'],
    '--preview-glass-saturate': glass['--glass-saturate']
  };
};
