import AccountHeader from '@/components/settings/AccountHeader';
import SettingItem from '@/components/settings/SettingItem';
import ToggleItem from '@/components/settings/ToggleItem';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);

  // Load push notification setting on mount
  React.useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('push_notifications_enabled');
      if (saved !== null) setPushNotifications(saved === 'true');
    })();
  }, []);

  // Save push notification setting when changed
  const handleTogglePushNotifications = (val: boolean) => {
    setPushNotifications(val);
    AsyncStorage.setItem('push_notifications_enabled', val ? 'true' : 'false');
  };

  const handleLogout = () => {
    // Go to logout confirmation page (moved to settings folder)
    router.push('/(settings)/logout-confirmation');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#141414" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Account Section */}
        <AccountHeader />

        {/* Bookings & Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bookings & Services</Text>

          <SettingItem
            icon="location-outline"
            title="Real-Time Tracking"
            subtitle="Track your maid in real-time"
            onPress={() => router.push('/(settings)/real-time-tracking')}
          />

          <SettingItem
            icon="time-outline"
            title="Booking History"
            subtitle="View past bookings and filter"
            onPress={() => router.push('/(settings)/booking-history')}
          />

          

          <SettingItem
            icon="calendar-outline"
            title="Booking Flexibility"
            subtitle="Reschedule or cancel your bookings"
            onPress={() => router.push('/(settings)/booking-flexibility')}
          />

        </View>

        {/* Notifications & Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications & Communication</Text>

          <ToggleItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Get updates on bookings, arrivals, and payments"
            value={pushNotifications}
            onToggle={handleTogglePushNotifications}
          />

          <SettingItem
            icon="chatbubble-outline"
            title="In-App Chat/Support"
            subtitle="Chat with support or your maid"
            onPress={() => { }}
          />
        </View>

        {/* Ratings & Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings & Feedback</Text>

          <SettingItem
            icon="star-outline"
            title="Ratings & Reviews"
            subtitle="Manage your submitted ratings and reviews"
            onPress={() => { }}
          />

          <SettingItem
            icon="people-outline"
            title="Top-Rated Maids"
            subtitle="See your top-rated maids and rebook"
            onPress={() => { }}
          />
        </View>

        {/* Payments & Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments & Pricing</Text>

          <SettingItem
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage your payment methods"
            onPress={() => { }}
            showArrow={true}
          />

          <SettingItem
            icon="cash-outline"
            title="Transparent Pricing"
            subtitle="Understand our transparent pricing policies"
            onPress={() => { }}
          />

          <SettingItem
            icon="receipt-outline"
            title="Payment Status"
            subtitle="Check the status of recent payments"
            onPress={() => { }}
          />
        </View>

        {/* Promotions & Loyalty */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promotions & Loyalty</Text>

          <SettingItem
            icon="gift-outline"
            title="Referral Bonuses"
            subtitle="Earn bonuses for referring friends"
            onPress={() => { }}
          />

          <SettingItem
            icon="ticket-outline"
            title="Promo Codes"
            subtitle="Apply promo codes to your bookings"
            onPress={() => { }}
          />
        </View>

        {/* Your Preferences */}
        <View style={styles.preferencesSection}>
          <View style={styles.preferencesContent}>
            <View style={styles.preferencesText}>
              <Text style={styles.preferencesTitle}>Your Preferences</Text>
              <Text style={styles.preferencesSubtitle}>
                Preferred Time: Evenings, Maid Gender: Female, Service Type: Deep Cleaning
              </Text>
            </View>
            <Image
              source={require('@/assets/images/preferences-bg.png')}
              style={styles.preferencesImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Other */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other</Text>

          <SettingItem
            icon="shield-outline"
            title="Privacy Settings"
            onPress={() => { }}
            compact={true}
          />

          <SettingItem
            icon="help-circle-outline"
            title="Help & FAQ"
            onPress={() => { }}
            compact={true}
          />

          <SettingItem
            icon="log-out-outline"
            title="Log Out"
            onPress={handleLogout}
            compact={true}
          />
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>App Version 1.2.3</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#141414',
    textAlign: 'center',
    lineHeight: 23,
  },
  placeholder: {
    width: 48,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#141414',
    lineHeight: 28,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  preferencesSection: {
    padding: 16,
  },
  preferencesContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderRadius: 12,
    gap: 16,
  },
  preferencesText: {
    flex: 1,
    gap: 4,
  },
  preferencesTitle: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#141414',
    lineHeight: 20,
  },
  preferencesSubtitle: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#737373',
    lineHeight: 21,
  },
  preferencesImage: {
    width: 130,
    height: 87,
    borderRadius: 12,
  },
  footer: {
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#737373',
    lineHeight: 21,
    textAlign: 'center',
  },
});
