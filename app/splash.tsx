import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getUser } from '../utils/session';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (user && user.email) {
        router.replace('/(main)');
      } else {
        router.replace('/(welcome)');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#38E078" />
    </View>
  );
}
