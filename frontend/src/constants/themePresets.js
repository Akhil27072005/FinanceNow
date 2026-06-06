/**
 * Appearance presets — applied globally via appTheme utilities.
 */
export const DEFAULT_THEME_PRESET_ID = 'violetDawn';
export const DEFAULT_GLASS_INTENSITY = 65;

export const THEME_PRESETS = [
  {
    id: 'violetDawn',
    label: 'Violet Dawn',
    accent: '#500cb0',
    accentSoft: 'rgba(80, 12, 176, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #f0f2f8 0%, #e8ecf4 35%, #f5f0fa 70%, #eef2ff 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(245,241,255,0.76) 45%, rgba(235,240,252,0.78) 100%)',
    blobPrimary: 'rgba(80, 12, 176, 0.35)',
    blobSecondary: 'rgba(249, 115, 22, 0.28)'
  },
  {
    id: 'royalPlum',
    label: 'Royal Plum',
    accent: '#6d28d9',
    accentSoft: 'rgba(109, 40, 217, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #f3f0fa 0%, #ebe4f8 40%, #f5f0ff 70%, #ede9fe 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.8) 0%, rgba(243,237,255,0.75) 50%, rgba(237,233,254,0.78) 100%)',
    blobPrimary: 'rgba(109, 40, 217, 0.32)',
    blobSecondary: 'rgba(167, 139, 250, 0.25)'
  },
  {
    id: 'oceanTeal',
    label: 'Ocean Teal',
    accent: '#0e7490',
    accentSoft: 'rgba(14, 116, 144, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #f0f9fb 0%, #e0f2f1 35%, #ecfeff 70%, #e0f2fe 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(224,242,254,0.76) 50%, rgba(236,254,255,0.78) 100%)',
    blobPrimary: 'rgba(14, 116, 144, 0.3)',
    blobSecondary: 'rgba(45, 212, 191, 0.22)'
  },
  {
    id: 'forestGreen',
    label: 'Forest Green',
    accent: '#047857',
    accentSoft: 'rgba(4, 120, 87, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 35%, #f0fdfa 70%, #d1fae5 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(236,253,245,0.76) 50%, rgba(240,253,244,0.78) 100%)',
    blobPrimary: 'rgba(4, 120, 87, 0.28)',
    blobSecondary: 'rgba(52, 211, 153, 0.22)'
  },
  {
    id: 'sunsetCoral',
    label: 'Sunset Coral',
    accent: '#ea580c',
    accentSoft: 'rgba(234, 88, 12, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #fff7ed 0%, #ffedd5 35%, #fef3c7 70%, #fce7f3 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(255,237,213,0.76) 50%, rgba(254,243,199,0.78) 100%)',
    blobPrimary: 'rgba(234, 88, 12, 0.3)',
    blobSecondary: 'rgba(244, 63, 94, 0.22)'
  },
  {
    id: 'roseBlush',
    label: 'Rose Blush',
    accent: '#be123c',
    accentSoft: 'rgba(190, 18, 60, 0.12)',
    contentGradient:
      'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 35%, #fdf2f8 70%, #fce7f3 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(255,228,230,0.76) 50%, rgba(253,242,248,0.78) 100%)',
    blobPrimary: 'rgba(190, 18, 60, 0.28)',
    blobSecondary: 'rgba(251, 113, 133, 0.22)'
  },
  {
    id: 'midnightBlue',
    label: 'Midnight Blue',
    accent: '#1d4ed8',
    accentSoft: 'rgba(29, 78, 216, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #eff6ff 0%, #dbeafe 35%, #e0e7ff 70%, #ede9fe 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(219,234,254,0.76) 50%, rgba(224,231,255,0.78) 100%)',
    blobPrimary: 'rgba(29, 78, 216, 0.3)',
    blobSecondary: 'rgba(99, 102, 241, 0.22)'
  },
  {
    id: 'slateSteel',
    label: 'Slate Steel',
    accent: '#475569',
    accentSoft: 'rgba(71, 85, 105, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 35%, #e2e8f0 70%, #f1f5f9 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.85) 0%, rgba(241,245,249,0.78) 50%, rgba(226,232,240,0.8) 100%)',
    blobPrimary: 'rgba(71, 85, 105, 0.22)',
    blobSecondary: 'rgba(148, 163, 184, 0.2)'
  },
  {
    id: 'amberGold',
    label: 'Amber Gold',
    accent: '#b45309',
    accentSoft: 'rgba(180, 83, 9, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #fffbeb 0%, #fef3c7 35%, #fff7ed 70%, #ffedd5 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(254,243,199,0.76) 50%, rgba(255,237,213,0.78) 100%)',
    blobPrimary: 'rgba(180, 83, 9, 0.28)',
    blobSecondary: 'rgba(245, 158, 11, 0.22)'
  },
  {
    id: 'lavenderMist',
    label: 'Lavender Mist',
    accent: '#7c3aed',
    accentSoft: 'rgba(124, 58, 237, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #faf5ff 0%, #f3e8ff 35%, #ede9fe 70%, #e0e7ff 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(243,232,255,0.76) 50%, rgba(237,233,254,0.78) 100%)',
    blobPrimary: 'rgba(124, 58, 237, 0.3)',
    blobSecondary: 'rgba(196, 181, 253, 0.25)'
  },
  {
    id: 'mintFresh',
    label: 'Mint Fresh',
    accent: '#059669',
    accentSoft: 'rgba(5, 150, 105, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 35%, #f0fdfa 70%, #ccfbf1 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(209,250,229,0.76) 50%, rgba(240,253,250,0.78) 100%)',
    blobPrimary: 'rgba(5, 150, 105, 0.28)',
    blobSecondary: 'rgba(110, 231, 183, 0.22)'
  },
  {
    id: 'berryWine',
    label: 'Berry Wine',
    accent: '#9f1239',
    accentSoft: 'rgba(159, 18, 57, 0.12)',
    contentGradient:
      'linear-gradient(145deg, #fdf2f8 0%, #fce7f3 35%, #ffe4e6 70%, #fae8ff 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(252,231,243,0.76) 50%, rgba(250,232,255,0.78) 100%)',
    blobPrimary: 'rgba(159, 18, 57, 0.28)',
    blobSecondary: 'rgba(192, 132, 252, 0.2)'
  },
  {
    id: 'skyCyan',
    label: 'Sky Cyan',
    accent: '#0284c7',
    accentSoft: 'rgba(2, 132, 199, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 35%, #ecfeff 70%, #f0fdfa 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(224,242,254,0.76) 50%, rgba(236,254,255,0.78) 100%)',
    blobPrimary: 'rgba(2, 132, 199, 0.3)',
    blobSecondary: 'rgba(56, 189, 248, 0.22)'
  },
  {
    id: 'charcoalNoir',
    label: 'Charcoal Noir',
    accent: '#374151',
    accentSoft: 'rgba(55, 65, 81, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #f9fafb 0%, #f3f4f6 35%, #e5e7eb 70%, #f3f4f6 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.88) 0%, rgba(243,244,246,0.8) 50%, rgba(229,231,235,0.82) 100%)',
    blobPrimary: 'rgba(55, 65, 81, 0.2)',
    blobSecondary: 'rgba(107, 114, 128, 0.18)'
  },
  {
    id: 'electricIndigo',
    label: 'Electric Indigo',
    accent: '#4338ca',
    accentSoft: 'rgba(67, 56, 202, 0.14)',
    contentGradient:
      'linear-gradient(145deg, #eef2ff 0%, #e0e7ff 35%, #ede9fe 70%, #f5f3ff 100%)',
    sidebarGradient:
      'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(224,231,255,0.76) 50%, rgba(237,233,254,0.78) 100%)',
    blobPrimary: 'rgba(67, 56, 202, 0.32)',
    blobSecondary: 'rgba(129, 140, 248, 0.22)'
  }
];

export const getThemePresetById = (id) =>
  THEME_PRESETS.find((p) => p.id === id) || THEME_PRESETS[0];

/** Map glass intensity 0–100 to app shell glass CSS variables */
export const glassIntensityToGlassVars = (intensity) => {
  const t = Math.min(100, Math.max(0, intensity)) / 100;
  const blur = 8 + t * 20;
  const bgAlpha = 0.35 + t * 0.3;
  const bgAlphaStrong = 0.45 + t * 0.35;
  const saturate = 1.05 + t * 0.2;
  return {
    '--glass-blur': `${blur}px`,
    '--glass-bg': `rgba(255, 255, 255, ${bgAlpha.toFixed(2)})`,
    '--glass-bg-strong': `rgba(255, 255, 255, ${bgAlphaStrong.toFixed(2)})`,
    '--glass-saturate': String(saturate.toFixed(2))
  };
};

/** Map glass intensity 0–100 to settings preview CSS values */
export const glassIntensityToPreviewVars = (intensity) => {
  const glass = glassIntensityToGlassVars(intensity);
  return {
    '--preview-glass-blur': glass['--glass-blur'],
    '--preview-glass-bg': glass['--glass-bg'],
    '--preview-glass-saturate': glass['--glass-saturate']
  };
};
