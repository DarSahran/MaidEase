// app/_layout.tsx
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { getUser } from '../utils/session';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getUser();
        setIsAuthenticated(!!user);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoading) {
    // Show a splash or loading indicator while checking auth
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(welcome)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(main)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
