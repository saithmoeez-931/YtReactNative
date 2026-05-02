import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  background: '#f3f7f6',
  surface: '#ffffff',
  surfaceMuted: '#e6f0ee',
  primary: '#0f766e',
  primarySoft: '#d7f3ee',
  secondary: '#14532d',
  secondarySoft: '#dcfce7',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#d6e4df',
  danger: '#b42318',
  dangerSoft: '#fde7e6',
  warning: '#b54708',
  warningSoft: '#fff0d5',
  success: '#16a34a',
  successSoft: '#dcfce7',
  accent: '#1f2937',
};

export const theme = {
  navigation: {
    dark: false,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.secondary,
    },
  },
};

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: '#ffffff',
    primaryContainer: colors.primarySoft,
    onPrimaryContainer: colors.primary,
    secondary: colors.secondary,
    onSecondary: '#ffffff',
    secondaryContainer: colors.secondarySoft,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceMuted,
    onSurface: colors.text,
    onSurfaceVariant: colors.textMuted,
    outline: colors.border,
    error: colors.danger,
    onError: '#ffffff',
    errorContainer: colors.dangerSoft,
  },
};
