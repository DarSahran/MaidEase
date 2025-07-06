import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getUser } from '../utils/session';

export default function SplashScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        if (user && user.email) {
          router.replace('/(main)');
        } else {
          router.replace('/(welcome)');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (!loading) return null;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#38E078" />
    </View>
  );
}
