import '../global.css';
import '@/theme/interop';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Figtree_700Bold } from '@expo-google-fonts/figtree/700Bold';
import { Figtree_800ExtraBold } from '@expo-google-fonts/figtree/800ExtraBold';
import { Geist_400Regular } from '@expo-google-fonts/geist/400Regular';
import { Geist_500Medium } from '@expo-google-fonts/geist/500Medium';
import { Geist_600SemiBold } from '@expo-google-fonts/geist/600SemiBold';
import { Geist_700Bold } from '@expo-google-fonts/geist/700Bold';
import { NotoSansDevanagari_400Regular } from '@expo-google-fonts/noto-sans-devanagari/400Regular';
import { NotoSansDevanagari_600SemiBold } from '@expo-google-fonts/noto-sans-devanagari/600SemiBold';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Three families, per README.md: Figtree for display, Geist for UI, Noto Sans
  // Devanagari for Hindi phrase text only. Imported by subpath so Metro bundles
  // only these eight faces rather than every weight in the packages.
  const [loaded, error] = useFonts({
    Figtree_700Bold,
    Figtree_800ExtraBold,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F7F8FA' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/[step]" options={{ animation: 'fade' }} />
        <Stack.Screen name="triage" />
        {/* The call screen owns the whole viewport — no tab bar, no back gesture. */}
        <Stack.Screen
          name="call"
          options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
        />
        <Stack.Screen name="cost" />
        <Stack.Screen name="insurance" />
        <Stack.Screen name="phrasebook" />
        <Stack.Screen name="provider/[id]/index" />
        <Stack.Screen name="provider/[id]/book" />
      </Stack>
    </SafeAreaProvider>
  );
}
