import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, Colors } from '@/lib/theme';

type ThemeContextType = {
  colors: Colors;
  isDark: boolean;
  setScheme: (scheme: 'dark' | 'light') => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme(): Colors {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx.colors;
  // Fallback if no provider (shouldn't happen)
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

export function useThemeControl() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error('useThemeControl must be used within ThemeProvider');
  return ctx;
}
