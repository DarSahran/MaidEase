import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BookingCard from '../../components/dashboard/BookingCard';
import HomeSnapshot from '../../components/dashboard/HomeSnapshot';
import QuickActions from '../../components/dashboard/QuickActions';
import SearchBar from '../../components/dashboard/SearchBar';
import ServiceCard from '../../components/dashboard/ServiceCard';


// Replace the services array with valid Ionicons names
const services = [
  { id: 'brooming', name: 'Brooming', icon: 'brush-outline' }, // was 'broom'
  { id: 'mopping', name: 'Mopping', icon: 'water-outline' },
  { id: 'dusting', name: 'Dusting', icon: 'sparkles-outline' },
  { id: 'kitchen', name: 'Kitchen Cleaning', icon: 'restaurant-outline' },
  { id: 'bathroom', name: 'Bathroom Cleaning', icon: 'home-outline' }, // was 'toilet'
  { id: 'babysitting', name: 'Babysitting', icon: 'happy-outline' },
  { id: 'washing-clothes', name: 'Washing Clothes', icon: 'shirt-outline' },
  { id: 'washing-utensils', name: 'Washing Utensils', icon: 'download-outline' },
];

export default function DashboardScreen() {
  const router = useRouter();

  const handleServicePress = (serviceId: string) => {
    router.push(`/(main)/service/${serviceId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>MaidEasy</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#0D1C0D" />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>👋 Good Morning, Rohan!</Text>
          <Text style={styles.subtitle}>Let's make your day a little cleaner.</Text>
        </View>

        {/* Search Bar */}
        <SearchBar />

        {/* Quick Actions */}
        <QuickActions />

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FCF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
    padding: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
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
});
