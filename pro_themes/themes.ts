export type ProThemeId =
  | 'royal-gold'
  | 'midnight-luxe'
  | 'sacred-emerald'
  | 'ivory-prestige';

export interface ProTheme {
  id: ProThemeId;
  name: string;
  icon: string;

  colors: {
    gradient: [string, string, string];
    surface: string;
    surfaceSoft: string;
    primary: string;
    secondary: string;
    accent: string;
    accentSoft: string;
    text: string;
    subText: string;
    border: string;
  };

  vector: {
    topShape: string;
    bottomShape: string;
    glow: string;
    line: string;
  };
}

export const PRO_THEMES: ProTheme[] = [
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    icon: '👑',

    colors: {
      gradient: ['#080b12', '#151b2b', '#241b0a'],
      surface: '#111827',
      surfaceSoft: 'rgba(255,255,255,0.055)',
      primary: '#d4af37',
      secondary: '#f5d76e',
      accent: '#d4af37',
      accentSoft: 'rgba(212,175,55,0.18)',
      text: '#ffffff',
      subText: '#a7b0c0',
      border: 'rgba(212,175,55,0.38)',
    },

    vector: {
      topShape: '#d4af37',
      bottomShape: '#8a6d1d',
      glow: '#f5d76e',
      line: '#d4af37',
    },
  },

  {
    id: 'midnight-luxe',
    name: 'Midnight Luxe',
    icon: '🌙',

    colors: {
      gradient: ['#020617', '#0f172a', '#172554'],
      surface: '#0b1220',
      surfaceSoft: 'rgba(148,163,184,0.08)',
      primary: '#cbd5e1',
      secondary: '#f8fafc',
      accent: '#94a3b8',
      accentSoft: 'rgba(148,163,184,0.16)',
      text: '#f8fafc',
      subText: '#94a3b8',
      border: 'rgba(203,213,225,0.30)',
    },

    vector: {
      topShape: '#64748b',
      bottomShape: '#334155',
      glow: '#cbd5e1',
      line: '#94a3b8',
    },
  },

  {
    id: 'sacred-emerald',
    name: 'Sacred Emerald',
    icon: '🕌',

    colors: {
      gradient: ['#022c22', '#064e3b', '#065f46'],
      surface: '#052e26',
      surfaceSoft: 'rgba(255,255,255,0.055)',
      primary: '#c8a951',
      secondary: '#f1d67a',
      accent: '#d4af37',
      accentSoft: 'rgba(212,175,55,0.18)',
      text: '#f8fafc',
      subText: '#a7c7bd',
      border: 'rgba(212,175,55,0.38)',
    },

    vector: {
      topShape: '#d4af37',
      bottomShape: '#0f766e',
      glow: '#f1d67a',
      line: '#d4af37',
    },
  },

  {
    id: 'ivory-prestige',
    name: 'Ivory Prestige',
    icon: '✨',

    colors: {
      gradient: ['#fffdf7', '#f7f0df', '#e9dfc5'],
      surface: '#fffaf0',
      surfaceSoft: 'rgba(120,90,40,0.06)',
      primary: '#b08a3c',
      secondary: '#d4af37',
      accent: '#b08a3c',
      accentSoft: 'rgba(176,138,60,0.14)',
      text: '#2c2418',
      subText: '#75654d',
      border: 'rgba(176,138,60,0.32)',
    },

    vector: {
      topShape: '#d4af37',
      bottomShape: '#c8b58a',
      glow: '#f1d67a',
      line: '#b08a3c',
    },
  },
];

export const DEFAULT_PRO_THEME: ProTheme = PRO_THEMES[0];
