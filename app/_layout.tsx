// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Welcome flow */}
      <Stack.Screen name="(welcome)" options={{ gestureEnabled: false }} />
      {/* Authentication flow */}
      <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
      {/* Main app tabs
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} /> */}
    </Stack>
  );
}
