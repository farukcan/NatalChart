import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeContext } from '@/hooks/useTheme';
import { lightColors, darkColors } from '@/lib/theme';

const THEME_KEY = 'user_theme_preference';

export default function RootLayout() {
  useFrameworkReady();
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<'dark' | 'light' | null>(null);

  const isDark =
    override !== null ? override === 'dark' : systemScheme === 'dark';

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'dark' || val === 'light') {
        setOverride(val);
        if (Platform.OS !== 'web') {
          Appearance.setColorScheme(val);
        }
      }
    });
  }, []);

  const setScheme = useCallback((scheme: 'dark' | 'light') => {
    setOverride(scheme);
    AsyncStorage.setItem(THEME_KEY, scheme);
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(scheme);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{ colors: isDark ? darkColors : lightColors, isDark, setScheme }}
    >
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}
