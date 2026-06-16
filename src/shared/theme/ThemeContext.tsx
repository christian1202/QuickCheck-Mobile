// ThemeContext — system-follow default + manual override (per context doc 5F)
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useColorScheme as useSystemColorScheme, Appearance } from 'react-native';
import { LightColors, DarkColors, type ThemeColors } from './colors';
import { TextStyles, FontFamily, FontSize, LetterSpacing } from './typography';
import { Spacing, BorderRadius, Shadows } from './spacing';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  typography: typeof TextStyles;
  fonts: typeof FontFamily;
  sizes: typeof FontSize;
  spacing: typeof Spacing;
  radius: typeof BorderRadius;
  shadows: typeof Shadows;
  letterSpacing: typeof LetterSpacing;
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useSystemColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const resolvedMode = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemScheme]);

  const isDark = resolvedMode === 'dark';

  const theme: Theme = useMemo(() => ({
    mode: resolvedMode,
    colors: isDark ? DarkColors : LightColors,
    typography: TextStyles,
    fonts: FontFamily,
    sizes: FontSize,
    spacing: Spacing,
    radius: BorderRadius,
    shadows: Shadows,
    letterSpacing: LetterSpacing,
  }), [resolvedMode, isDark]);

  const value = useMemo(() => ({
    theme,
    themeMode,
    setThemeMode,
    isDark,
  }), [theme, themeMode, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Shorthand hooks
export const useColors = () => useTheme().theme.colors;
export const useIsDark = () => useTheme().isDark;
