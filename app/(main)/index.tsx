import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import CustomRefreshAnimation from '../../components/CustomRefreshAnimation';
import BookingCard from '../../components/dashboard/BookingCard';
import HomeSnapshot from '../../components/dashboard/HomeSnapshot';
import QuickActions from '../../components/dashboard/QuickActions';
import SearchBar from '../../components/dashboard/SearchBar';
import ServiceCard from '../../components/dashboard/ServiceCard';
import UpdatesCarousel from '../../components/dashboard/UpdatesCarousel';
import { getUser } from '../../utils/session';

// Replace the services array with valid Ionicons names
const services = [
  { id: 'brooming', name: 'Brooming', icon: 'brush-outline' as const },
  { id: 'mopping', name: 'Mopping', icon: 'water-outline' as const },
  { id: 'dusting', name: 'Dusting', icon: 'sparkles-outline' as const },
  { id: 'kitchen', name: 'Kitchen Cleaning', icon: 'restaurant-outline' as const },
  { id: 'bathroom', name: 'Bathroom Cleaning', icon: 'home-outline' as const },
  { id: 'babysitting', name: 'Babysitting', icon: 'happy-outline' as const },
  { id: 'washing-clothes', name: 'Washing Clothes', icon: 'shirt-outline' as const },
  { id: 'washing-utensils', name: 'Washing Utensils', icon: 'download-outline' as const },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCustomRefresh, setShowCustomRefresh] = useState(false);

  const fetchUser = useCallback(async () => {
    const u = await getUser();
    setUser(u);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Updates.reloadAsync(); // This will reload the entire app, like pressing 'r' in terminal
    } catch (e) {
      console.warn('App reload failed:', e);
    }
    setRefreshing(false);
  }, []);

  // Keyboard 'r' to refresh (dev/terminal, web only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.addEventListener) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'r' || e.key === 'R') {
          handleRefresh();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleRefresh]);

  const handleServicePress = (serviceId: string) => {
    router.push({ pathname: '../(service)/[serviceId]', params: { serviceId } });
  };

  return (
    <SafeAreaViewContext style={{ flex: 1, backgroundColor: '#F7FCF7' }}>
      <SafeAreaView style={styles.container}>
        {/* Custom Refresh Animation Overlay */}
        {showCustomRefresh && (
          <View style={styles.refreshOverlay}>
            <CustomRefreshAnimation />
          </View>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#1AE51A"]} />
          }
        >
          {/* Header */}
          <View style={styles.headerWrapper}>
            <View style={styles.headerCenteredRow}>
              <Text style={styles.appName}>MaidEase</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/(settings)/settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#0D1C0D" />
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>
              {(() => {
                const hour = new Date().getHours();
                let greeting = 'Good Morning';
                if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
                else if (hour >= 17 || hour < 4) greeting = 'Good Evening';
                const capitalize = (str: string) =>
                  str.charAt(0).toUpperCase() + str.slice(1);
                return `👋 ${greeting}, ${user && user.first_name ? capitalize(user.first_name) : ''}!`;
              })()}
            </Text>
            <Text style={styles.subtitle}>Let's make your day a little cleaner.</Text>
          </View>



          {/* Search Bar */}
          <SearchBar />

          {/* Quick Actions */}
          <QuickActions />

          {/* Updates Carousel */}
          <UpdatesCarousel />

          {/* Current Booking */}
          <BookingCard />

          {/* Services Grid */}
          <View style={styles.servicesSection}>
            <View style={styles.servicesGrid}>
              {services.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPress={() => handleServicePress(service.id)}
                />
              ))}
            </View>

            {/* More Services Button */}
            <TouchableOpacity style={styles.moreServicesButton}>
              <Text style={styles.moreServicesText}>+ More Services</Text>
            </TouchableOpacity>
          </View>

          {/* Home Snapshot */}
          <HomeSnapshot />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FCF7',
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#F7FCF7',
  },
  headerCenteredRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  appName: {
    fontSize: 18,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#0D1C0D',
    textAlign: 'center',
    flex: 1,
  },
  settingsButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: 0,
  },
  greetingSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0D1A12',
    lineHeight: 35,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '400',
    color: '#0D1C0D',
    lineHeight: 24,
    marginTop: 4,
  },
  servicesSection: {
    padding: 10,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  moreServicesButton: {
    backgroundColor: '#1AE51A',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  moreServicesText: {
    color: '#0D1C0D',
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '700',
    lineHeight: 21,
  },
  refreshOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
