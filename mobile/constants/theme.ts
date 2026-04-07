/**
 * LOVESHEET Design System — Mobile
 * Ported from App.css CSS variables → JS theme object
 */

import { Platform } from 'react-native';

// ── Colors ──
export const Colors = {
  light: {
    // Primary — Warm Orange
    primary: '#F97316',
    primaryHover: '#EA580C',
    primaryLight: '#FFF7ED',
    primaryLighter: '#FFEDD5',
    primaryDark: '#C2410C',

    // Accent — Amber
    accent: '#F59E0B',
    accentLight: '#FEF3C7',

    // Backgrounds
    bg: '#FFFBF5',
    surface: '#FFFFFF',
    surface2: '#FEF7EE',
    surfaceHover: '#FFF2E0',

    // Borders
    border: '#FDE8D0',
    borderSubtle: '#FEF0E0',

    // Text
    text: '#1C1917',
    textSecondary: '#78716C',
    textTertiary: '#A8A29E',
    textOnPrimary: '#FFFFFF',

    // Semantic
    success: '#16A34A',
    successLight: '#DCFCE7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Tab bar
    tint: '#F97316',
    icon: '#A8A29E',
    tabIconDefault: '#A8A29E',
    tabIconSelected: '#F97316',

    // Subject Colors
    subjectMath: '#F97316',
    subjectMedicine: '#EF4444',
    subjectCS: '#8B5CF6',
    subjectEconomics: '#10B981',
    subjectEnglish: '#3B82F6',
    subjectPhysics: '#F59E0B',
    subjectLaw: '#6366F1',
    subjectChemistry: '#EC4899',
  },
  dark: {
    primary: '#F97316',
    primaryHover: '#EA580C',
    primaryLight: '#431407',
    primaryLighter: '#7C2D12',
    primaryDark: '#FB923C',

    accent: '#F59E0B',
    accentLight: '#78350F',

    bg: '#1C1917',
    surface: '#292524',
    surface2: '#44403C',
    surfaceHover: '#57534E',

    border: '#57534E',
    borderSubtle: '#44403C',

    text: '#FAFAF9',
    textSecondary: '#A8A29E',
    textTertiary: '#78716C',
    textOnPrimary: '#FFFFFF',

    success: '#22C55E',
    successLight: '#14532D',
    error: '#EF4444',
    errorLight: '#7F1D1D',
    warning: '#F59E0B',
    warningLight: '#78350F',
    info: '#60A5FA',
    infoLight: '#1E3A5F',

    tint: '#F97316',
    icon: '#78716C',
    tabIconDefault: '#78716C',
    tabIconSelected: '#F97316',

    subjectMath: '#FB923C',
    subjectMedicine: '#F87171',
    subjectCS: '#A78BFA',
    subjectEconomics: '#34D399',
    subjectEnglish: '#60A5FA',
    subjectPhysics: '#FBBF24',
    subjectLaw: '#818CF8',
    subjectChemistry: '#F472B6',
  },
};

// ── Spacing ──
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// ── Border Radius ──
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 100,
};

// ── Shadows ──
export const Shadows = {
  sm: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  warm: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
};

// ── Typography ──
export const FontSize = {
  display: 32,
  h1: 24,
  h2: 20,
  h3: 17,
  bodyLg: 16,
  body: 15,
  bodySm: 14,
  label: 13,
  micro: 11,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    mono: 'monospace',
  },
});

// ── Subject Color Helper ──
export function getSubjectColor(subject: string, scheme: 'light' | 'dark' = 'light'): string {
  const colors = Colors[scheme];
  const map: Record<string, string> = {
    'Mathematics': colors.subjectMath,
    'Medicine': colors.subjectMedicine,
    'Computer Science': colors.subjectCS,
    'Economics': colors.subjectEconomics,
    'English': colors.subjectEnglish,
    'Physics': colors.subjectPhysics,
    'Law': colors.subjectLaw,
    'Chemistry': colors.subjectChemistry,
  };
  return map[subject] || colors.primary;
}
