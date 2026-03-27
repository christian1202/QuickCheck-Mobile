// QuickCheck Design System — "The Serene Steward" (Sanctuary Blue)
// Tonal Architecture color tokens extracted from Stitch mockups

export const LightColors = {
  // Primary
  primary: '#022448',
  primaryContainer: '#1e3a5f',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#8aa4cf',
  primaryFixed: '#d5e3ff',
  primaryFixedDim: '#adc8f5',
  onPrimaryFixed: '#001c3b',
  onPrimaryFixedVariant: '#2d486d',

  // Secondary (Green / Success)
  secondary: '#006d37',
  secondaryContainer: '#6bfe9c',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#00743a',
  secondaryFixed: '#6bfe9c',
  secondaryFixedDim: '#4ae183',
  onSecondaryFixed: '#00210c',
  onSecondaryFixedVariant: '#005228',

  // Tertiary (Amber / Warning)
  tertiary: '#361f00',
  tertiaryContainer: '#533200',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#e49000',
  tertiaryFixed: '#ffddb9',
  tertiaryFixedDim: '#ffb961',
  onTertiaryFixed: '#2b1700',
  onTertiaryFixedVariant: '#663e00',

  // Error
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // Surface Hierarchy (Tonal layering — treat as stacked sheets)
  surface: '#f8f9ff',
  surfaceBright: '#f8f9ff',
  surfaceDim: '#ccdbf3',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e6eeff',
  surfaceContainerHigh: '#dce9ff',
  surfaceContainerHighest: '#d5e3fc',
  surfaceVariant: '#d5e3fc',
  surfaceTint: '#455f87',

  // Background
  background: '#f8f9ff',
  onBackground: '#0d1c2e',

  // On Surface
  onSurface: '#0d1c2e',
  onSurfaceVariant: '#43474e',

  // Outline
  outline: '#74777f',
  outlineVariant: '#c4c6cf',

  // Inverse
  inverseSurface: '#233144',
  inverseOnSurface: '#eaf1ff',
  inversePrimary: '#adc8f5',

  // Utility
  white: '#ffffff',
  transparent: 'transparent',
  scrim: 'rgba(13,28,46,0.4)',
}

export const DarkColors: typeof LightColors = {
  // Dark mode inversions
  primary: '#adc8f5',
  primaryContainer: '#2d486d',
  onPrimary: '#0a2e52',
  onPrimaryContainer: '#d5e3ff',
  primaryFixed: '#d5e3ff',
  primaryFixedDim: '#adc8f5',
  onPrimaryFixed: '#001c3b',
  onPrimaryFixedVariant: '#2d486d',

  secondary: '#4ae183',
  secondaryContainer: '#005228',
  onSecondary: '#003919',
  onSecondaryContainer: '#6bfe9c',
  secondaryFixed: '#6bfe9c',
  secondaryFixedDim: '#4ae183',
  onSecondaryFixed: '#00210c',
  onSecondaryFixedVariant: '#005228',

  tertiary: '#ffb961',
  tertiaryContainer: '#663e00',
  onTertiary: '#4b2800',
  onTertiaryContainer: '#ffddb9',
  tertiaryFixed: '#ffddb9',
  tertiaryFixedDim: '#ffb961',
  onTertiaryFixed: '#2b1700',
  onTertiaryFixedVariant: '#663e00',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  surface: '#0d1c2e',
  surfaceBright: '#283848',
  surfaceDim: '#0d1c2e',
  surfaceContainerLowest: '#060f1c',
  surfaceContainerLow: '#141e2e',
  surfaceContainer: '#1a2940',
  surfaceContainerHigh: '#223350',
  surfaceContainerHighest: '#2a3d5c',
  surfaceVariant: '#43474e',
  surfaceTint: '#adc8f5',

  background: '#0d1c2e',
  onBackground: '#dce9ff',

  onSurface: '#dce9ff',
  onSurfaceVariant: '#c4c6cf',

  outline: '#8e9099',
  outlineVariant: '#43474e',

  inverseSurface: '#dce9ff',
  inverseOnSurface: '#233144',
  inversePrimary: '#455f87',

  white: '#ffffff',
  transparent: 'transparent',
  scrim: 'rgba(0,0,0,0.6)',
};

export type ThemeColors = typeof LightColors;
