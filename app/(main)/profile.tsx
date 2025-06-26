import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ProgressBar from '../../components/settings/ProgressBar';
import { supabase } from '../../constants/supabase';
import { getUser } from '../../utils/session';

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyalty, setLoyalty] = useState<any>({ tier: '', pointsToNext: 0, progress: 0 });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [lastLogin, setLastLogin] = useState<string>('');
  const [feedback, setFeedback] = useState<number>(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const localUser = await getUser();
      if (!localUser || !localUser.id) {
        setLoading(false);
        return;
      }
      // Fetch user profile from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, mobile')
        .eq('id', localUser.id)
        .single();
      if (userError) {
        console.log('Supabase user fetch error:', userError); // Debug log
      } else {
        console.log('Successfully fetched details of', userData?.first_name || 'User');
      }
      // Fetch addresses
      const { data: addrData } = await supabase
        .from('user_addresses')
        .select('id, label, house_number, street, city, state, pincode')
        .eq('user_id', localUser.id);
      // Fetch bookings
      const { data: bookingData } = await supabase
        .from('booking_history')
        .select('*')
        .eq('user_id', localUser.id);
      // Recommendations: find most booked service
      let recs: any[] = [];
      if (bookingData && bookingData.length > 0) {
        const freq: Record<string, number> = {};
        bookingData.forEach(b => {
          if (b.service_type) freq[b.service_type] = (freq[b.service_type] || 0) + 1;
        });
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
          // Find the name for the most booked service
          const homeServices = [
            { id: 'brooming', name: 'Brooming' },
            { id: 'mopping', name: 'Mopping' },
            { id: 'dusting', name: 'Dusting' },
            { id: 'kitchen', name: 'Kitchen Cleaning' },
            { id: 'bathroom', name: 'Bathroom Cleaning' },
            { id: 'babysitting', name: 'Babysitting' },
            { id: 'washing-clothes', name: 'Washing Clothes' },
            { id: 'washing-utensils', name: 'Washing Utensils' },
          ];
          const serviceId = sorted[0][0];
          const serviceName = homeServices.find(s => s.id === serviceId)?.name || serviceId;
          recs = [{ id: 1, service: serviceName, reason: `You book this service most often (${sorted[0][1]} times)` }];
        }
      }
      setLoyalty({ tier: 'Silver', pointsToNext: 35, progress: 0.7 });
      setUser(userData);
      setAddresses(addrData || []);
      setBookings(bookingData || []);
      setRecommendations(recs);
      setLastLogin('N/A');
      setLoading(false);
    }
    fetchProfile();
  }, []);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#52946B" /></View>;
  }

  const avatarSource = require('../../assets/images/profile-avatar.png');

  // Share referral
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join MaidEasy! Use my referral code: ${user?.id}`
      });
    } catch (error) {}
  };

  const openEditModal = () => {
    setEditFirstName(user?.first_name || '');
    setEditLastName(user?.last_name || '');
    setEditEmail(user?.email || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
      Alert.alert('All fields are required.');
      return;
    }
    const { error } = await supabase
      .from('users')
      .update({ first_name: editFirstName, last_name: editLastName, email: editEmail })
      .eq('id', user.id);
    if (error) {
      Alert.alert('Failed to update profile', error.message);
    } else {
      setUser({ ...user, first_name: editFirstName, last_name: editLastName, email: editEmail });
      setEditModalVisible(false);
      Alert.alert('Profile updated successfully!');
    }
  };

  return (
    <ScrollView style={{ backgroundColor: '#F7FAFA' }} contentContainerStyle={{ flexGrow: 1, padding: 0 }}>
      {/* User Info */}
      <View style={[styles.profileHeaderCard]}> 
        <View style={styles.avatarSection}>
          <Image source={avatarSource} style={styles.avatar} />
        </View>
        <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
          <Ionicons name="create-outline" size={20} color="#52946B" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <Text style={[styles.userName, { marginTop: 6 }]}>{user?.first_name || 'N/A'} {user?.last_name || ''}</Text>
        <Text style={styles.emailText}>{user?.email || 'N/A'}</Text>
        <Text style={styles.userPhone}>{user?.mobile || 'N/A'}</Text>
        <View style={styles.divider} />
      </View>
      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={editFirstName}
              onChangeText={setEditFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={editLastName}
              onChangeText={setEditLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recommendations */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recommended for You</Text></View>
      <View style={styles.card}>
        {recommendations.length === 0 && <Text style={{ textAlign: 'center', color: '#737373' }}>No recommendations yet.</Text>}
        {recommendations.map((rec) => (
          <View key={rec.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingVertical: 8 }}>
            <Ionicons name="sparkles-outline" size={24} color="#52946B" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#0D1A12' }}>{rec.service}</Text>
              <Text style={{ color: '#737373', fontSize: 13, marginTop: 2 }}>Most booked service</Text>
            </View>
            <View style={styles.badge}><Text style={styles.badgeText}>{rec.reason.match(/\d+/)?.[0] || ''}x</Text></View>
          </View>
        ))}
      </View>

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
              {/* Hidden accessibility label for screen readers only */}
              <Text accessibilityElementsHidden accessibilityLabel="Edit Address" style={{ position: 'absolute', left: -9999, width: 1, height: 1 }}>Edit Address</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={[styles.addAddressButton, { marginTop: 8 }]}> 
          <Text style={styles.addAddressText}>+ Add New Address</Text> 
        </TouchableOpacity>
      </View>

      {/* Loyalty Summary */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Loyalty Summary</Text></View>
      <TouchableOpacity style={[styles.card, styles.loyaltyButton]} activeOpacity={0.9}>
        <View style={styles.loyaltyRow}>
          <View style={styles.loyaltyIconBox}><Ionicons name="star" size={24} color="#088729" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.loyaltyTier}>{loyalty.tier}</Text>
            <Text style={styles.loyaltyPoints}>{loyalty.pointsToNext} more points to reach Gold</Text>
            <ProgressBar bookingsCount={Math.round(loyalty.progress * 10)} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Referral to Friend */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Refer a Friend</Text></View>
      <View style={[styles.card, { alignItems: 'center', marginBottom: 16 }]}> 
        <QRCode value={user?.id?.toString() || 'user'} size={120} backgroundColor="white" color="#52946B" />
        <Text style={{ color: '#737373', fontSize: 12, marginTop: 4 }}>Scan to refer or check-in</Text>
        <TouchableOpacity style={{ marginTop: 10, backgroundColor: '#38E078', borderRadius: 8, padding: 8, alignItems: 'center' }} onPress={handleShare}>
          <Text style={{ color: '#0D1A12', fontWeight: '700' }}>Share Referral</Text>
        </TouchableOpacity>
      </View>

      {/* Last Login */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Last Login</Text></View>
      <View style={[styles.card, { marginBottom: 10 }]}> 
        <Text style={{ color: '#0D1A12', fontWeight: '600' }}>Last Login: {lastLogin}</Text>
        <Text style={{ color: '#737373', fontSize: 12 }}>Device: iPhone 15 Pro (simulated)</Text>
      </View>

      {/* Feedback Widget */}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Feedback</Text></View>
      <View style={[styles.card, { marginBottom: 10 }]}> 
        <Text style={{ color: '#0D1A12', fontWeight: '600', marginBottom: 4 }}>Rate your experience</Text>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setFeedback(star)}>
              <Ionicons name="star" size={24} color={feedback >= star ? "#FFD700" : "#C0C0C0"} style={{ marginRight: 4 }} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={{ backgroundColor: '#38E078', borderRadius: 8, padding: 8, alignItems: 'center' }} onPress={() => alert('Thank you for your feedback!')}>
          <Text style={{ color: '#0D1A12', fontWeight: '700' }}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
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
  profileHeaderCard: {
    backgroundColor: '#eaf7f0',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 18,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#38E078',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#d0e6db',
    marginTop: 18,
    marginBottom: 4,
    borderRadius: 1,
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
  emailText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#52946L',
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
  badge: {
    backgroundColor: '#38E078',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 32,
  },
  badgeText: {
    color: '#0D1A12',
    fontWeight: '700',
    fontSize: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 12,
    marginTop: 4,
    backgroundColor: '#E8F2ED',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editButtonText: {
    color: '#52946B',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '85%',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D1A12',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F7FAFA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0D1A12',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4E3D9',
  },
  cancelButton: {
    backgroundColor: '#E8F2ED',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#52946B',
    fontWeight: '700',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#38E078',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: '#0D1A12',
    fontWeight: '700',
    fontSize: 15,
  },
});
