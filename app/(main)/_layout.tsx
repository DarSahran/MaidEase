import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { getUser } from '../../utils/session'; // Adjust path if needed

interface User {
  id: string;
  first_name?: string;
  email?: string;
}

export default function MainLayout({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const u = await getUser();
        setUser(u);
        if (!u) {
          router.replace('/(welcome)');
        }
      } catch {
        setUser(null);
        router.replace('/(auth)/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (showWelcome && user) {
      setShowWelcome(false);
    }
  }, [user, showWelcome]);

  if (isLoading || !user) return null;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FAFAFA',
            borderTopColor: '#EBF2EB',
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: 12,
            height: 80,
          },
          tabBarActiveTintColor: '#0D1A12',
          tabBarInactiveTintColor: '#698273',
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'System',
            fontWeight: '500',
            lineHeight: 18,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: 'Bookings',
            tabBarIcon: ({ color }) => (
              <Ionicons name="calendar-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
