import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Appearance, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ProgressBar from '../../components/settings/ProgressBar';
import { supabase } from '../../constants/supabase';
import { getUser } from '../../utils/session';

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyalty, setLoyalty] = useState<any>({ tier: '', pointsToNext: 0, progress: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [lastLogin, setLastLogin] = useState<string>('2025-06-24 10:30');
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  // Personalized greeting
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const localUser = await getUser();
      if (!localUser || !localUser.id) {
        setLoading(false);
        return;
      }
      // Fetch user profile from Supabase
      const { data: userData } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, mobile, avatar_url')
        .eq('id', localUser.id)
        .single();
      // Fetch addresses
      const { data: addrData } = await supabase
        .from('user_addresses')
        .select('id, label, house_number, street, city, state, pincode')
        .eq('user_id', localUser.id);
      // Fetch recent bookings (simulate)
      setRecentBookings([
        { id: 1, service: 'Brooming', date: '2025-06-20', status: 'Completed' },
        { id: 2, service: 'Mopping', date: '2025-06-18', status: 'Completed' },
        { id: 3, service: 'Kitchen', date: '2025-06-15', status: 'Cancelled' },
      ]);
      // Fetch notifications (simulate)
      setNotifications([
        { id: 1, message: 'Your maid is on the way!', date: '2025-06-20' },
      ]);
      // Fetch recommendations (simulate)
      setRecommendations([
        { id: 1, service: 'Dusting', reason: 'You booked Brooming recently' },
      ]);
      // Badges (simulate)
      setBadges(['First Booking', 'Loyal Customer']);
      setLoyalty({ tier: 'Silver', pointsToNext: 35, progress: 0.7 });
      setUser(userData);
      setAddresses(addrData || []);
      setLoading(false);
    }
    fetchProfile();
    // Listen for color scheme changes
    const sub = Appearance.addChangeListener(({ colorScheme }) => setColorScheme(colorScheme));
    return () => sub.remove();
  }, []);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#52946B" /></View>;
  }

  // Avatar fallback
  const avatarSource = user?.avatar_url && user.avatar_url.startsWith('http')
    ? { uri: user.avatar_url }
    : require('../../assets/images/profile-avatar.png');

  return (
    <ScrollView style={{ backgroundColor: colorScheme === 'dark' ? '#181A1B' : '#F7FAFA' }} contentContainerStyle={{ flexGrow: 1, padding: 0 }}>
      {/* User Info at Top */}
      <View style={[styles.card, { alignItems: 'center', marginTop: 18, marginBottom: 10 }]}> 
        <Image source={avatarSource} style={[styles.avatar, { borderWidth: 2, borderColor: '#38E078' }]} />
        <Text style={[styles.userName, { marginTop: 6 }]}>{user?.first_name} {user?.last_name}</Text>
        <Text style={styles.userPhone}>{user?.mobile}</Text>
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recent Activity</Text></View>
      <View style={styles.card}>
        {recentBookings.length === 0 && <Text style={{ textAlign: 'center', color: '#737373' }}>No recent bookings.</Text>}
        {recentBookings.map((b) => (
          <View key={b.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="calendar-outline" size={20} color="#52946B" style={{ marginRight: 8 }} />
            <Text style={{ flex: 1 }}>{b.service} - {b.date}</Text>
            <Text style={{ color: b.status === 'Completed' ? '#088729' : '#B8860B', fontWeight: '600', marginRight: 8 }}>{b.status}</Text>
            <TouchableOpacity onPress={() => {/* quick rebook logic */}}>
              <Ionicons name="repeat-outline" size={20} color="#52946B" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Service Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recommended for You</Text></View>
      )}
      {recommendations.length > 0 && (
        <View style={styles.card}>
          {recommendations.map((rec) => (
            <View key={rec.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="sparkles-outline" size={20} color="#52946B" style={{ marginRight: 8 }} />
              <Text style={{ flex: 1 }}>{rec.service}</Text>
              <Text style={{ color: '#737373', fontSize: 12 }}>{rec.reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Address Book */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Address Book</Text></View>
      <View style={styles.card}>
        {addresses.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#737373', marginBottom: 8 }}>No addresses saved.</Text>
        )}
        {addresses.map((addr, idx) => (
          <View key={addr.id || idx} style={styles.addressRow}>
            <View style={styles.addressIconBox}>
              <Ionicons name={idx === 0 ? 'home-outline' : 'business-outline'} size={24} color="#0D1A12" />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>{addr.label}</Text>
              <Text style={styles.addressText}>{`${addr.house_number}, ${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#52946B" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={[styles.addAddressButton, { marginTop: 8 }]}> <Text style={styles.addAddressText}>+ Add New Address</Text> </TouchableOpacity>
      </View>

      {/* Loyalty Summary as a Button */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Loyalty Summary</Text></View>
      <TouchableOpacity style={[styles.card, styles.loyaltyButton]} activeOpacity={0.9} onPress={() => { /* Placeholder for your custom button logic */ }}>
        <View style={styles.loyaltyRow}>
          <View style={styles.loyaltyIconBox}><Ionicons name="star" size={24} color="#088729" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.loyaltyTier}>{loyalty.tier}</Text>
            <Text style={styles.loyaltyPoints}>{loyalty.pointsToNext} more points to reach Gold</Text>
            <ProgressBar bookingsCount={6} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Profile QR Code */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your QR Code</Text></View>
      <View style={[styles.card, { alignItems: 'center', marginBottom: 16 }]}> 
        <QRCode value={user?.id?.toString() || 'user'} size={120} backgroundColor="white" color="#52946B" />
        <Text style={{ color: '#737373', fontSize: 12, marginTop: 4 }}>Scan to refer or check-in</Text>
      </View>

      {/* Security Section */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Security</Text></View>
      <View style={[styles.card, { marginBottom: 10 }]}> 
        <Text style={{ color: '#0D1A12', fontWeight: '600' }}>Last Login: {lastLogin}</Text>
        <Text style={{ color: '#737373', fontSize: 12 }}>Device: iPhone 15 Pro (simulated)</Text>
        <TouchableOpacity style={{ marginTop: 8, alignSelf: 'flex-start' }}>
          <Text style={{ color: '#52946B', fontWeight: '700' }}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Widget */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Feedback</Text></View>
      <View style={[styles.card, { marginBottom: 10 }]}> 
        <Text style={{ color: '#0D1A12', fontWeight: '600', marginBottom: 4 }}>Rate your experience</Text>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons key={star} name="star" size={24} color="#FFD700" style={{ marginRight: 4 }} />
          ))}
        </View>
        <TouchableOpacity style={{ backgroundColor: '#38E078', borderRadius: 8, padding: 8, alignItems: 'center' }}>
          <Text style={{ color: '#0D1A12', fontWeight: '700' }}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Dark Mode Toggle */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Appearance</Text></View>
      <TouchableOpacity style={[styles.card, { backgroundColor: '#E8F2ED', alignItems: 'center', marginBottom: 20 }]} onPress={() => {
        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
      }}>
        <Ionicons name={colorScheme === 'dark' ? 'moon' : 'sunny'} size={22} color="#52946B" style={{ marginRight: 8 }} />
        <Text style={{ color: '#0D1A12', fontWeight: '600' }}>Switch to {colorScheme === 'dark' ? 'Light' : 'Dark'} Mode</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: '#F7FAFA',
  },
  headerRowCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#F7FAFA',
  },
  headerTitleBox: { flex: 1, paddingRight: 48, alignItems: 'center' },
  headerTitle: {
    textAlign: 'center',
    color: '#0D1A12',
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 23,
  },
  headerTitleCentered: {
    textAlign: 'center',
    color: '#0D1A12',
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    marginBottom: 8,
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0D1A12',
    lineHeight: 28,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#52946B',
    lineHeight: 24,
    textAlign: 'center',
  },
  editText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#52946L',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 4,
  },
  emailSection: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  emailText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#52946B',
    lineHeight: 21,
    textAlign: 'center',
  },
  sectionHeader: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#0D1A12',
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 28,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFA',
    minHeight: 72,
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  addressIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#E8F2ED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addressInfo: { flex: 1 },
  addressLabel: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#0D1A12',
    lineHeight: 24,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#52946B',
    lineHeight: 21,
  },
  addAddressButton: {
    backgroundColor: '#38E078',
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addAddressText: {
    color: '#0D1A12',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 21,
  },
  loyaltyButton: {
    backgroundColor: '#E8F2ED',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    alignItems: 'stretch',
  },
  loyaltyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 16,
  },
  loyaltyIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F2ED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  loyaltyTier: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#0D1A12',
    lineHeight: 24,
  },
  loyaltyPoints: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#0D1A12',
    lineHeight: 24,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
});
