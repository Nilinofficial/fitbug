import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,

} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { useEffect } from 'react';
import { AppThemeProvider, useAppTheme } from "@/theme/ThemeProvider";

SplashScreen.preventAutoHideAsync();

function ThemedApp() {
  const { scheme } = useAppTheme();

  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

export default function TabLayout() {
const [loaded] = useFonts({
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
});

  useEffect(() => {
  if (loaded) {
    SplashScreen.hideAsync();
  }
}, [loaded]);


  if (!loaded) {
    return null;
  }

  return (
    <AppThemeProvider>
      <ThemedApp />
    </AppThemeProvider>
  );
}
