import { useColorScheme } from 'react-native';
import { lightColors, darkColors, Colors } from '@/lib/theme';

export function useTheme(): Colors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}
