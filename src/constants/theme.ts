import { Platform } from 'react-native';

// Lumina AI Camera — warm minimalist design tokens.
// Keeps the legacy key names used across the app so every screen inherits the
// same sunlit cream / charcoal / butter palette.
export const colors = {
  // ── Surfaces ──
  canvas: '#FBF9F6',
  canvasWarm: '#F5F3F0',
  paper: '#FFFFFF',
  surface: '#FBF9F6',
  surfaceLowest: '#FFFFFF',
  surfaceLow: '#F5F3F0',
  surfaceContainer: '#EFEEEB',
  surfaceHigh: '#EAE8E5',
  surfaceHighest: '#E4E2DF',

  // ── Ink ──
  ink: '#181612',
  muted: '#4B463F',
  subtle: '#7C766E',
  onSurfaceVariant: '#4B463F',

  // ── Lines ──
  line: 'rgba(45, 42, 38, 0.08)',
  outline: '#7C766E',
  outlineVariant: '#CDC5BC',

  // ── Brand ──
  primary: '#181612',
  primaryLight: '#2D2A26',
  primarySoft: 'rgba(45, 42, 38, 0.06)',
  mistBlue: '#D7C598',
  mistBlueLight: '#F5F3F0',
  secondary: '#735B0E',
  butter: '#F6E3B4',
  butterWarm: '#FDF6E6',
  slate: '#4B463F',
  secondaryContainer: '#FEDD84',
  secondaryFixed: '#FFE08E',
  secondaryFixedDim: '#E3C36E',
  onSecondaryContainer: '#786013',
  tertiary: '#6B5D38',

  // ── Accents & decorative ──
  paleMist: '#F5F3F0',
  paleButter: '#FDF6E6',
  dark: '#14120F',
  whiteWarm: '#FFFFFF',
};

export const glass = {
  lightBg: 'rgba(251, 249, 246, 0.86)',
  lightBorder: 'rgba(255, 255, 255, 0.90)',

  cardBg: 'rgba(255, 255, 255, 0.80)',
  cardBorder: 'rgba(255, 255, 255, 0.92)',
  cardSubtleBorder: 'rgba(45, 42, 38, 0.06)',

  primaryBg: 'rgba(24, 22, 18, 0.06)',
  primaryBorder: 'rgba(24, 22, 18, 0.10)',

  butterBg: 'rgba(254, 221, 132, 0.30)',
  butterBorder: 'rgba(255, 255, 255, 0.88)',

  darkBg: 'rgba(45, 42, 38, 0.78)',
  darkBorder: 'rgba(255, 255, 255, 0.16)',

  pillBg: 'rgba(251, 249, 246, 0.88)',
  pillBorder: 'rgba(255, 255, 255, 0.92)',

  pressedBg: 'rgba(245, 243, 240, 0.96)',
};

export const shadows = {
  glassSm: {
    shadowColor: '#2D2A26',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  glassMd: {
    shadowColor: '#2D2A26',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  glassLg: {
    shadowColor: '#2D2A26',
    shadowOpacity: 0.10,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  glassPrimaryGlow: {
    shadowColor: '#2D2A26',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  glassDark: {
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

const sans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'sans-serif',
}) as string;

export const fonts = {
  display: sans,
  body: sans,
};

export const radii = { sm: 12, md: 16, lg: 24, xl: 32, full: 9999 };

export const typography = {
  headlineLg: { fontSize: 30, lineHeight: 38, fontWeight: '600' as const, letterSpacing: -0.6 },
  headlineMd: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const, letterSpacing: -0.36 },
  headlineSm: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const, letterSpacing: -0.2 },
  titleLg: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const, letterSpacing: -0.09 },
  titleMd: { fontSize: 16, lineHeight: 22, fontWeight: '500' as const },
  bodyLg: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyMd: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySm: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const, letterSpacing: 0.12 },
  labelLg: { fontSize: 13, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.26 },
  labelMd: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 0.44 },
  labelSm: { fontSize: 10, lineHeight: 12, fontWeight: '600' as const, letterSpacing: 0.6 },
  hud: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const, letterSpacing: 0.88 },
};
