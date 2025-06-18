// app/(welcome)/_layout.tsx
import { Stack } from 'expo-router';

export default function WelcomeLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
