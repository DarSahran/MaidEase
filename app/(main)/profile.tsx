import { Ionicons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [previousFeedback, setPreviousFeedback] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddressModalVisible, setEditAddressModalVisible] = useState(false);
  const [editAddress, setEditAddress] = useState<any>(null);
  const [editAddrLabel, setEditAddrLabel] = useState('');
  const [editAddrHouse, setEditAddrHouse] = useState('');
  const [editAddrStreet, setEditAddrStreet] = useState('');
  const [editAddrCity, setEditAddrCity] = useState('');
  const [editAddrState, setEditAddrState] = useState('');
  const [editAddrPincode, setEditAddrPincode] = useState('');
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrHouse, setNewAddrHouse] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [localAvatarPath, setLocalAvatarPath] = useState<string | null>(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(0);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      // Get device info
      const info = `${Device.brand || ''} ${Device.modelName || ''} (${Device.osName || ''} ${Device.osVersion || ''})`;
      setDeviceInfo(info);
      const localUser = await getUser();
      if (!localUser || !localUser.id) {
        setLoading(false);
        return;
      }
      // Fetch user profile from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, mobile, last_login, last_login_city, profile_pic_url')
        .eq('id', localUser.id)
        .single();
      if (userError) {
        // No log for error
      } else {
        console.log('successfully logged in', userData?.first_name || 'User');
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
      // Loyalty logic (sync with loyalty-details.tsx)
      let tier = '';
      let nextTier = undefined;
      let badge = null;
      let toNext = 0;
      let tierMin = 0;
      let tierDisplayMax = 0;
      let bookingsInTier = 0;
      let bookingsCount = bookingData ? bookingData.length : 0;
      if (bookingsCount < 5) {
        tier = 'No Tier';
        nextTier = 'Bronze';
        badge = null;
        toNext = 5 - bookingsCount;
        tierMin = 0;
        tierDisplayMax = 4;
        bookingsInTier = bookingsCount;
      } else if (bookingsCount < 20) {
        tier = 'Bronze';
        nextTier = 'Silver';
        badge = require('../../assets/card-logos/bronze_badge.png');
        toNext = 20 - bookingsCount;
        tierMin = 5;
        tierDisplayMax = 19;
        bookingsInTier = bookingsCount - tierMin + 1;
      } else if (bookingsCount < 40) {
        tier = 'Silver';
        nextTier = 'Gold';
        badge = require('../../assets/card-logos/silver_badge.png');
        toNext = 40 - bookingsCount;
        tierMin = 20;
        tierDisplayMax = 39;
        bookingsInTier = bookingsCount - tierMin + 1;
      } else {
        tier = 'Gold';
        nextTier = undefined;
        badge = require('../../assets/card-logos/gold_badge.png');
        toNext = 0;
        tierMin = 40;
        tierDisplayMax = 40;
        bookingsInTier = bookingsCount - tierMin + 1;
        if (bookingsInTier < 1) bookingsInTier = 1;
      }
      if (bookingsInTier < 0) bookingsInTier = 0;
      if (bookingsCount > tierDisplayMax) bookingsInTier = tierDisplayMax - tierMin + 1;
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
      setLoyalty({ tier, nextTier, badge, toNext, tierMin, tierDisplayMax, bookingsInTier, bookingsCount });
      setUser(userData);
      console.log('fetched profile successful');
      setAddresses(addrData || []);
      setBookings(bookingData || []);
      setRecommendations(recs);
      // Set last login string with city if available
      if (userData?.last_login) {
        const dateObj = new Date(userData.last_login);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('default', { month: 'short' });
        const formatted = `${day}-${month}`;
        setLastLogin(`${formatted}${userData.last_login_city ? ' (' + userData.last_login_city + ')' : ''}`);
      } else {
        setLastLogin('N/A');
      }
      // Fetch previous feedback
      if (localUser && localUser.id) {
        const { data: feedbackData } = await supabase
          .from('user_feedback')
          .select('id, rating, comment')
          .eq('user_id', localUser.id)
          .single();
        if (feedbackData) {
          setPreviousFeedback(feedbackData);
          setFeedback(feedbackData.rating);
          setFeedbackComment(feedbackData.comment || '');
          setFeedbackSubmitted(true);
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  // Helper to upload profile image
  const handleProfileImageUpload = async () => {
    if (!user?.id) return;
    try {
      setUploadingProfilePic(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
      });
      if (result.canceled || !result.assets || !result.assets[0]?.base64 || !result.assets[0]?.uri) {
        Alert.alert('Image picking cancelled');
        setUploadingProfilePic(false);
        return;
      }
      let ext = 'png';
      const uri = result.assets[0].uri;
      const match = uri.match(/\.([a-zA-Z0-9]+)$/);
      if (match && match[1]) {
        ext = match[1].toLowerCase();
        if (ext === 'jpg') ext = 'jpeg';
      }
      const base64 = result.assets[0].base64;
      // Save inside user folder
      const filename = `${user.id}/profile_${user.id}.${ext}`;
      function base64ToUint8Array(base64: string) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      }
      const fileData = base64ToUint8Array(base64);
      // Remove previous image (optional, since upsert will overwrite)
      await supabase.storage.from('user-profile-pic').remove([filename]);
      // Upload new image (upsert)
      const { error: uploadError } = await supabase.storage
        .from('user-profile-pic')
        .upload(filename, fileData, {
          contentType: `image/${ext}`,
          upsert: true,
        });
      if (uploadError) {
        Alert.alert('Upload error', uploadError.message);
        setUploadingProfilePic(false);
        return;
      }
      // Get public URL
      const { data } = await supabase.storage
        .from('user-profile-pic')
        .getPublicUrl(filename);
      if (!data?.publicUrl) {
        Alert.alert('Failed to get public URL');
        setUploadingProfilePic(false);
        return;
      }
      // Save URL to user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_pic_url: data.publicUrl })
        .eq('id', user.id);
      if (updateError) {
        Alert.alert('Failed to save profile image', updateError.message);
        setUploadingProfilePic(false);
        return;
      }
      setUser({ ...user, profile_pic_url: data.publicUrl });
      // No downloadProfileImage call needed
      // No deleteLocalAvatar needed
      Alert.alert('Profile image updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message || String(err));
    } finally {
      setUploadingProfilePic(false);
    }
  };

  // Helper to get a signed URL for a private profile image
  const getProfileImageSignedUrl = async (profilePicUrl: string) => {
    if (!profilePicUrl) return null;
    // Extract the bucket path from the public URL
    // Example: https://<project>.supabase.co/storage/v1/object/public/user-profile-pic/<bucketPath>
    const match = profilePicUrl.match(/user-profile-pic\/(.*)$/);
    const bucketPath = match ? match[1] : null;
    if (!bucketPath) return null;
    // Use supabase-js client to get a signed URL (valid for 60 seconds)
    const { data, error } = await supabase.storage.from('user-profile-pic').createSignedUrl(bucketPath, 60);
    if (error) {
      console.log('Error getting signed URL:', error.message);
      return null;
    }
    return data.signedUrl;
  };

  // State for signed avatar URL
  const [signedAvatarUrl, setSignedAvatarUrl] = useState<string | null>(null);

  // Fetch and cache avatar signed URL on user/profile_pic_url change
  useEffect(() => {
    let isMounted = true;
    if (user?.profile_pic_url && user?.id) {
      getProfileImageSignedUrl(user.profile_pic_url).then(url => {
        if (isMounted) setSignedAvatarUrl(url);
      });
    } else {
      setSignedAvatarUrl(null);
    }
    return () => { isMounted = false; };
  }, [user?.profile_pic_url, user?.id]);

  // In the profile header, use the signed URL if available
  const avatarSource = signedAvatarUrl
    ? { uri: signedAvatarUrl }
    : require('../../assets/images/profile-avatar.png');

  // Delete local avatar file (no-op, kept for API compatibility)
  const deleteLocalAvatar = async () => {
    setLocalAvatarPath(null);
  };

  // On logout, delete local avatar
  // Call deleteLocalAvatar() in your logout logic

  // Share referral
  const handleShare = async () => {
    try {
      const referralName = encodeURIComponent(`${user?.first_name || ''}${user?.last_name ? '-' + user.last_name : ''}`.replace(/\s+/g, ''));
      const referralLink = `https://maidease.com/signup?ref=${referralName}`;
      await Share.share({
        message: `Join MaidEase and get ₹100 wallet credit! Use my referral link: ${referralLink}`
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

  // Open address edit modal
  const openEditAddressModal = (addr: any) => {
    setEditAddress(addr);
    setEditAddrLabel(addr.label || '');
    setEditAddrHouse(addr.house_number || '');
    setEditAddrStreet(addr.street || '');
    setEditAddrCity(addr.city || '');
    setEditAddrState(addr.state || '');
    setEditAddrPincode(addr.pincode || '');
    setEditAddressModalVisible(true);
  };

  const handleSaveAddress = async () => {
    if (!editAddress) return;
    if (!editAddrLabel.trim() || !editAddrHouse.trim() || !editAddrStreet.trim() || !editAddrCity.trim() || !editAddrState.trim() || !editAddrPincode.trim()) {
      Alert.alert('All address fields are required.');
      return;
    }
    const { error } = await supabase
      .from('user_addresses')
      .update({
        label: editAddrLabel,
        house_number: editAddrHouse,
        street: editAddrStreet,
        city: editAddrCity,
        state: editAddrState,
        pincode: editAddrPincode,
      })
      .eq('id', editAddress.id);
    if (error) {
      Alert.alert('Failed to update address', error.message);
    } else {
      setAddresses(addresses.map(a => a.id === editAddress.id ? {
        ...a,
        label: editAddrLabel,
        house_number: editAddrHouse,
        street: editAddrStreet,
        city: editAddrCity,
        state: editAddrState,
        pincode: editAddrPincode,
      } : a));
      setEditAddressModalVisible(false);
      setEditAddress(null);
      Alert.alert('Address updated successfully!');
    }
  };

  const openAddAddressModal = () => {
    setNewAddrLabel('');
    setNewAddrHouse('');
    setNewAddrStreet('');
    setNewAddrCity('');
    setNewAddrState('');
    setNewAddrPincode('');
    setAddAddressModalVisible(true);
  };

  const handleAddAddress = async () => {
    if (!newAddrLabel.trim() || !newAddrHouse.trim() || !newAddrStreet.trim() || !newAddrCity.trim() || !newAddrState.trim() || !newAddrPincode.trim()) {
      Alert.alert('All address fields are required.');
      return;
    }
    // Prevent duplicate labels
    if (addresses.some(a => a.label.toLowerCase() === newAddrLabel.trim().toLowerCase())) {
      Alert.alert('This label already exists. Please use a unique label.');
      return;
    }
    const localUser = await getUser();
    const { data, error } = await supabase
      .from('user_addresses')
      .insert({
        user_id: localUser.id,
        label: newAddrLabel,
        house_number: newAddrHouse,
        street: newAddrStreet,
        city: newAddrCity,
        state: newAddrState,
        pincode: newAddrPincode,
      })
      .select()
      .single();
    if (error) {
      Alert.alert('Failed to add address', error.message);
    } else {
      setAddresses([...addresses, data]);
      setAddAddressModalVisible(false);
      Alert.alert('Address added successfully!');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback) {
      Alert.alert('Please select a rating.');
      return;
    }
    setFeedbackLoading(true);
    const localUser = await getUser();
    if (!localUser || !localUser.id) {
      setFeedbackLoading(false);
      Alert.alert('User not found.');
      return;
    }
    // Upsert feedback (insert or update)
    const { error } = await supabase
      .from('user_feedback')
      .upsert({ user_id: localUser.id, rating: feedback, comment: feedbackComment }, { onConflict: 'user_id' });
    setFeedbackLoading(false);
    if (error) {
      Alert.alert('Failed to submit feedback', error.message);
    } else {
      setFeedbackSubmitted(true);
      setPreviousFeedback({ rating: feedback, comment: feedbackComment });
      Alert.alert('Thank you for your feedback!');
    }
  };

  // Move loading check after all hooks
  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#52946B" /></View>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFA' }}>
      <ScrollView style={{ backgroundColor: '#F7FAFA' }} contentContainerStyle={{ flexGrow: 1, padding: 0 }}>
        {/* App Name Centered at Top */}
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0D1A12', letterSpacing: 1 }}>MaidEase</Text>
        </View>
        <View style={{ position: 'relative' }}>
          {/* Edit Profile Button */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F2ED', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, margin: 8 }}
            onPress={openEditModal}
          >
            <Ionicons name="create-outline" size={20} color="#52946B" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          {/* User Info */}
          <View style={[styles.profileHeaderCard]}> 
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={handleProfileImageUpload} disabled={uploadingProfilePic}>
                <Image source={avatarSource} style={styles.avatar} onError={() => {
                  console.log('Remote avatar failed, falling back to default avatar.');
                  setLocalAvatarPath(null);
                }} />
                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 12, padding: 2 }}>
                  <Ionicons name="camera" size={20} color="#52946B" />
                </View>
                {uploadingProfilePic && <Text style={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center', color: '#52946B', fontSize: 12 }}>Uploading...</Text>}
              </TouchableOpacity>
            </View>
            <Text style={[styles.userName, { marginTop: 6 }]}>{user?.first_name || 'N/A'} {user?.last_name || ''}</Text>
            <Text style={styles.emailText}>{user?.email || 'N/A'}</Text>
            <Text style={styles.userPhone}>{user?.mobile || 'N/A'}</Text>
            <View style={styles.divider} />
          </View>
        </View>

        {/* Edit Profile Modal */}
        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#52946B" />
              </TouchableOpacity>
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <Image source={avatarSource} style={[styles.avatar, { width: 80, height: 80, borderRadius: 40, borderWidth: 2, marginBottom: 0 }]} />
              </View>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={editFirstName}
                onChangeText={setEditFirstName}
              />
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={editLastName}
                onChangeText={setEditLastName}
              />
              <Text style={styles.inputLabel}>Email</Text>
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

        {/* Edit Address Modal */}
        <Modal visible={editAddressModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setEditAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color="#52946B" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Address</Text>
              <Text style={styles.inputLabel}>Label</Text>
              <TextInput
                style={styles.input}
                placeholder="Label (e.g. Home, Work)"
                value={editAddrLabel}
                onChangeText={setEditAddrLabel}
              />
              <Text style={styles.inputLabel}>House Number</Text>
              <TextInput
                style={styles.input}
                placeholder="House Number"
                value={editAddrHouse}
                onChangeText={setEditAddrHouse}
              />
              <Text style={styles.inputLabel}>Street</Text>
              <TextInput
                style={styles.input}
                placeholder="Street"
                value={editAddrStreet}
                onChangeText={setEditAddrStreet}
              />
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={editAddrCity}
                onChangeText={setEditAddrCity}
              />
              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                value={editAddrState}
                onChangeText={setEditAddrState}
              />
              <Text style={styles.inputLabel}>Pincode</Text>
              <TextInput
                style={styles.input}
                placeholder="Pincode"
                value={editAddrPincode}
                onChangeText={setEditAddrPincode}
                keyboardType="numeric"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditAddressModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Address Modal */}
        <Modal visible={addAddressModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setAddAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color="#52946B" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <Text style={styles.inputLabel}>Label</Text>
              <TextInput
                style={styles.input}
                placeholder="Label (e.g. Home, Work)"
                value={newAddrLabel}
                onChangeText={setNewAddrLabel}
              />
              <Text style={styles.inputLabel}>House Number</Text>
              <TextInput
                style={styles.input}
                placeholder="House Number"
                value={newAddrHouse}
                onChangeText={setNewAddrHouse}
              />
              <Text style={styles.inputLabel}>Street</Text>
              <TextInput
                style={styles.input}
                placeholder="Street"
                value={newAddrStreet}
                onChangeText={setNewAddrStreet}
              />
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={newAddrCity}
                onChangeText={setNewAddrCity}
              />
              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                value={newAddrState}
                onChangeText={setNewAddrState}
              />
              <Text style={styles.inputLabel}>Pincode</Text>
              <TextInput
                style={styles.input}
                placeholder="Pincode"
                value={newAddrPincode}
                onChangeText={setNewAddrPincode}
                keyboardType="numeric"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setAddAddressModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
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
              <TouchableOpacity onPress={() => openEditAddressModal(addr)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="create-outline" size={20} color="#52946B" />
                <Text style={styles.editButtonText}>Edit</Text>
                <Text accessibilityElementsHidden accessibilityLabel="Edit Address" style={{ position: 'absolute', left: -9999, width: 1, height: 1 }}>Edit Address</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.addAddressButton, { marginTop: 8 }]} onPress={openAddAddressModal}> 
            <Text style={styles.addAddressText}>+ Add New Address</Text> 
          </TouchableOpacity>
        </View>

        {/* Loyalty Summary */}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Loyalty Summary</Text></View>
        <TouchableOpacity style={[styles.card, styles.loyaltyButton]} activeOpacity={0.9} onPress={() => router.push('/(settings)/loyalty-details')}>
          <View style={styles.loyaltyRow}>
            <View style={styles.loyaltyIconBox}>
              <Ionicons name="star" size={24} color="#088729" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={styles.loyaltyTier}>{loyalty.tier === 'No Tier' ? 'No Loyalty Tier Yet' : `${loyalty.tier} Member`}</Text>
                {loyalty.badge && (
                  <Image source={loyalty.badge} style={{ width: 24, height: 24, marginLeft: 8, resizeMode: 'contain' }} />
                )}
              </View>
              {loyalty.nextTier ? (
                <Text style={styles.loyaltyPoints}>
                  {loyalty.toNext} more booking{loyalty.toNext === 1 ? '' : 's'} to reach {loyalty.nextTier}
                </Text>
              ) : (
                <Text style={styles.loyaltyPoints}>You are at the highest tier!</Text>
              )}
              <Text style={styles.bookingsDone}>{loyalty.bookingsInTier}/{loyalty.tierDisplayMax - loyalty.tierMin + 1} bookings in this tier</Text>
            </View>
          </View>
          <Text style={{ color: '#52946B', fontSize: 13, fontWeight: '600', textAlign: 'right', marginTop: 4 }}>Click here to check details</Text>
        </TouchableOpacity>

        {/* Referral to Friend */}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Refer a Friend</Text></View>
        <View style={[styles.card, { alignItems: 'center', marginBottom: 16, paddingTop: 24, paddingBottom: 24 }]}> 
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0D1A12', marginBottom: 8, textAlign: 'center' }}>
            Invite your friends and earn rewards!
          </Text>
          <Text style={{ color: '#737373', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
            Share your referral link below. You and your friend both get ₹100 wallet credit when they complete their first booking!
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFA', borderRadius: 8, borderWidth: 1, borderColor: '#D4E3D9', paddingHorizontal: 10, paddingVertical: 8, marginBottom: 12, width: '100%' }}>
            <Text style={{ flex: 1, color: '#0D1A12', fontSize: 13 }} numberOfLines={1} ellipsizeMode="middle">
              {`https://maidease.com/signup?ref=${encodeURIComponent(`${user?.first_name || ''}${user?.last_name ? '-' + user.last_name : ''}`.replace(/\s+/g, ''))}`}
            </Text>
            <TouchableOpacity onPress={() => {navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(`https://maidease.com/signup?ref=${encodeURIComponent(`${user?.first_name || ''}${user?.last_name ? '-' + user.lastName : ''}`.replace(/\s+/g, ''))}`) : Alert.alert('Copied!')}} style={{ marginLeft: 8, padding: 4 }}>
              <Ionicons name="copy-outline" size={20} color="#52946B" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ backgroundColor: '#38E078', borderRadius: 8, padding: 10, alignItems: 'center', width: '100%' }} onPress={handleShare}>
            <Text style={{ color: '#0D1A12', fontWeight: '700', fontSize: 15 }}>Share Referral Link</Text>
          </TouchableOpacity>
        </View>

        {/* Last Login */}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Last Login</Text></View>
        <View style={[styles.card, { marginBottom: 10 }]}> 
          <Text style={{ color: '#0D1A12', fontWeight: '600' }}>Last Login: {lastLogin}</Text>
          <Text style={{ color: '#737373', fontSize: 12 }}>Device: {deviceInfo || 'Unknown'}</Text>
        </View>

        {/* Feedback Widget */}
        {!feedbackSubmitted && !previousFeedback && (
          <>
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
              <TextInput
                style={[styles.input, { minHeight: 40, marginBottom: 8 }]}
                placeholder="Add a comment (optional)"
                value={feedbackComment}
                onChangeText={setFeedbackComment}
                multiline
              />
              <TouchableOpacity
                style={{ backgroundColor: feedbackLoading ? '#E8F2ED' : '#38E078', borderRadius: 8, padding: 8, alignItems: 'center', opacity: feedbackLoading ? 0.6 : 1 }}
                onPress={handleSubmitFeedback}
                disabled={feedbackLoading}
              >
                <Text style={{ color: '#0D1A12', fontWeight: '700' }}>{feedbackLoading ? 'Submitting...' : 'Submit Feedback'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  bookingsDone: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#737373',
    lineHeight: 20,
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
  inputLabel: {
    fontSize: 15,
    color: '#52946B',
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 8,
    marginLeft: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: '#E8F2ED',
    borderRadius: 16,
    padding: 4,
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
