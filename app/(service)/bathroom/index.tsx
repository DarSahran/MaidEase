import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getUser } from '../../../utils/session';

export default function BathroomService() {
  const router = useRouter();

  // Location states
  type LocationMethod = 'account' | 'current';
  const [locationMethod, setLocationMethod] = useState<LocationMethod>('account');
  const [address, setAddress] = useState({
    houseNumber: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Date and time states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Bathroom Areas state
  const bathroomAreaOptions = [
    { key: 'shower', label: 'Shower' },
    { key: 'toilet', label: 'Toilet' },
    { key: 'sink', label: 'Sink' },
    { key: 'floor', label: 'Floor' },
    { key: 'mirror', label: 'Mirror' },
    { key: 'all', label: 'All' }
  ];
  const [selectedBathroomAreas, setSelectedBathroomAreas] = useState<Record<string, boolean>>({});
  const handleBathroomAreaToggle = (key: string) => {
    if (key === 'all') {
      const newValue = !selectedBathroomAreas['all'];
      const updated: Record<string, boolean> = {};
      bathroomAreaOptions.forEach(opt => { updated[opt.key] = newValue; });
      setSelectedBathroomAreas(updated);
    } else {
      const updated = { ...selectedBathroomAreas, [key]: !selectedBathroomAreas[key] };
      updated['all'] = bathroomAreaOptions.filter(a => a.key !== 'all').every(a => updated[a.key]);
      setSelectedBathroomAreas(updated);
    }
  };

  // Severity state
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | null>(null);
  const [severityDropdownOpen, setSeverityDropdownOpen] = useState(false);

  // Disinfectant toggle
  const [needDisinfectant, setNeedDisinfectant] = useState(false);
  const [disinfectantInput, setDisinfectantInput] = useState('');
  const disinfectantOptions = [
    { name: 'Lysol', logo: require('../../../assets/card-logos/lysol.jpg') },
    { name: 'Dettol', logo: require('../../../assets/card-logos/dettol.png') },
    { name: 'Harpic', logo: require('../../../assets/card-logos/harpic.png') },
    { name: 'Savlon', logo: require('../../../assets/card-logos/savlon.jpeg') },
  ];
  const [disinfectantDropdownOpen, setDisinfectantDropdownOpen] = useState(false);

  // Notes states
  const [notes, setNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(20);

  // Time slots
  const timeSlots = [
    '6 AM', '7 AM', '8 AM', '9 AM', '10 AM',
    '11 AM', '12 PM', '1 PM', '2 PM', '3 PM',
    '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'
  ];

  // Store the last fetched account address for display
  const [accountAddress, setAccountAddress] = useState<{ houseNumber: string; street: string; city: string; state: string; pincode: string } | null>(null);

  // User addresses state
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedUserAddressId, setSelectedUserAddressId] = useState<string | null>(null);
  const [newAddressLabel, setNewAddressLabel] = useState('');

  // Selected address for booking (from all addresses)
  const [selectedSavedAddressType, setSelectedSavedAddressType] = useState<'main' | 'user_address' | null>('main');
  const [selectedSavedUserAddressId, setSelectedSavedUserAddressId] = useState<string | null>(null);

  // Dropdown modal state
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Material provider state
  const [materialProvider, setMaterialProvider] = useState<'maid' | 'user'>('maid');

  // Load saved address on component mount
  useEffect(() => {
    fetchAccountAddress();
  }, []);

  useEffect(() => {
    if (locationMethod === 'account') {
      fetchAccountAddress();
    }
  }, [locationMethod]);

  // Fetch all user addresses on mount (for both modes)
  useEffect(() => {
    fetchUserAddresses();
  }, []);

  // Supabase client setup
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  const fetchAccountAddress = async () => {
    setLoadingLocation(true);
    try {
      const user = await getUser();
      if (user && user.id) {
        // Fetch user details from Supabase using user.id
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase environment variables are missing.');
        }
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data, error } = await supabase
          .from('users')
          .select('apartment, street, city, state, pincode')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        const accAddr = {
          houseNumber: data?.apartment || '',
          street: data?.street || '',
          city: data?.city || '',
          state: data?.state || '',
          pincode: data?.pincode || ''
        };
        setAccountAddress(accAddr);
        setAddress(accAddr);
      } else {
        setAccountAddress(null);
        setAddress({ houseNumber: '', street: '', city: '', state: '', pincode: '' });
      }
    } catch (error) {
      setAccountAddress(null);
      setAddress({ houseNumber: '', street: '', city: '', state: '', pincode: '' });
      Alert.alert('Error', 'Could not fetch account address.');
    }
    setLoadingLocation(false);
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    // Read OpenCage API key from .env (process.env.EXPO_PUBLIC_OPENCAGE_API_KEY or process.env.NEXT_PUBLIC_OPENCAGE_API_KEY)
    const OPENCAGE_API_KEY = process.env.EXPO_PUBLIC_OPENCAGE_API_KEY || process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
    if (!OPENCAGE_API_KEY) {
      Alert.alert('Error', 'OpenCage API key is missing. Please set your API key in your .env file.');
      setLoadingLocation(false);
      return;
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get current location.');
        setLoadingLocation(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude, longitude } = location.coords;
      // Reverse geocoding to get address details
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
        );
        const data = await response.json();
        if (data.results && data.results[0]) {
          const result = data.results[0].components;
          const houseNumber = result.house_number || '';
          const street = result.road || result.suburb || '';
          const city = result.city || result.town || result.village || '';
          const state = result.state || '';
          const pincode = result.postcode || '';
          if (street || city || state || pincode) {
            setAddress({ houseNumber, street, city, state, pincode });
          } else {
            setAddress({
              houseNumber: '',
              street: `Lat: ${latitude}, Lng: ${longitude}`,
              city: '',
              state: '',
              pincode: ''
            });
            Alert.alert('Notice', 'No address found for your location. Coordinates have been filled in the street field.');
          }
        } else {
          setAddress({
            houseNumber: '',
            street: `Lat: ${latitude}, Lng: ${longitude}`,
            city: '',
            state: '',
            pincode: ''
          });
          Alert.alert('Notice', 'No address found for your location. Coordinates have been filled in the street field.');
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        Alert.alert('Error', 'Could not get address details from location.');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get current location.');
    }
    setLoadingLocation(false);
  };

  const handleLocationMethodChange = (method: LocationMethod) => {
    setLocationMethod(method);
    if (method === 'account') {
      fetchAccountAddress();
    } else if (method === 'current') {
      getCurrentLocation();
    }
  };

  // Generate 7 days from today, skip today if after 8 PM
  const getNext7Days = () => {
    const days = [];
    const now = new Date();
    let start = new Date(now);
    if (now.getHours() >= 20) {
      // If after 8 PM, start from tomorrow
      start.setDate(start.getDate() + 1);
    }
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const isFormValid = () => {
    return (
      selectedDate &&
      selectedTime &&
      Object.values(selectedBathroomAreas).some(Boolean) &&
      severity &&
      materialProvider
    );
  };

  // Fetch all user addresses from user_addresses table
  const fetchUserAddresses = async () => {
    try {
      const user = await getUser();
      if (user && user.id) {
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase environment variables are missing.');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data, error } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setUserAddresses(data || []);
      }
    } catch (error) {
      setUserAddresses([]);
    }
  };

  useEffect(() => {
    if (locationMethod === 'current') {
      fetchUserAddresses();
    }
  }, [locationMethod]);

  const handleContinue = () => {
    if (!isFormValid()) {
      Alert.alert('Incomplete Form', 'Please select all required fields.');
      return;
    }

    // Determine the correct address object to use
    let selectedAddress = address;
    if (locationMethod === 'account') {
      if (selectedSavedAddressType === 'main' && accountAddress) {
        selectedAddress = accountAddress;
      } else if (selectedSavedAddressType === 'user_address' && selectedSavedUserAddressId) {
        const addr = userAddresses.find(a => a.id === selectedSavedUserAddressId);
        if (addr) {
          selectedAddress = {
            houseNumber: addr.house_number || '',
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || ''
          };
        }
      }
    }

    // Format date as ISO string and pass time slot as selected
    const bookingData = {
      service: 'Bathroom',
      service_type: 'bathroom',
      address: selectedAddress,
      date: selectedDate ? selectedDate.toISOString() : '',
      time: selectedTime,
      // Add bathroomSize, stainsLevel, fixtures for confirmation
      bathroomSize: selectedBathroomAreas['all'] ? 'All' : Object.keys(selectedBathroomAreas).filter(k => selectedBathroomAreas[k]).join(', '),
      stainsLevel: severity || '',
      fixtures: needDisinfectant && disinfectantInput ? [disinfectantInput] : [],
      materialProvider,
      notes,
      locationMethod,
      estimatedCost,
      duration_minutes: 45 // default duration for bathroom
    };

    // Navigate to order summary (update route to bathroom_confirmation)
    router.push({
      pathname: '/(confirmation)/bathroom_confirmation',
      params: { bookingData: JSON.stringify(bookingData) }
    });
  };

  useEffect(() => {
    let base = 70;
    // Count selected areas (ignore 'all' key)
    const areaKeys = Object.keys(selectedBathroomAreas).filter(k => k !== 'all' && selectedBathroomAreas[k]);
    let areaCount = areaKeys.length;
    // If 'all' is selected, cap area price
    let areaPrice = 0;
    if (selectedBathroomAreas['all']) {
      areaPrice = 50;
    } else {
      areaPrice = areaCount * 10;
    }
    // Severity multiplier
    let multiplier = 1;
    if (severity === 'Moderate') multiplier = 1.3;
    if (severity === 'Severe') multiplier = 1.6;
    // Disinfectant fee
    let disinfectantFee = needDisinfectant ? 15 : 0;
    // Calculate total
    let total = Math.round((base + areaPrice + disinfectantFee) * multiplier);
    // Minimum and maximum bounds
    if (total < 20) total = 20;
    if (total > 120) total = 120;
    setEstimatedCost(total);
  }, [selectedBathroomAreas, severity, needDisinfectant]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#121714" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Book Your Bathroom Cleaning Service</Text>
          </View>
        </View>
        <View style={styles.content}>
          {/* Location Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          {/* Location Method Selection */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <TouchableOpacity
              style={[styles.locationOption, locationMethod === 'account' && styles.locationOptionSelected, { flex: 1 }]}
              onPress={() => handleLocationMethodChange('account')}
            >
              <Text style={styles.locationOptionText}>Saved Address</Text>
              <View style={[styles.radioButton, locationMethod === 'account' && styles.radioButtonSelected]}>
                {locationMethod === 'account' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.locationOption, locationMethod === 'current' && styles.locationOptionSelected, { flex: 1 }]}
              onPress={() => handleLocationMethodChange('current')}
            >
              <Text style={styles.locationOptionText}>Add New Location</Text>
              <View style={[styles.radioButton, locationMethod === 'current' && styles.radioButtonSelected]}>
                {locationMethod === 'current' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          </View>
          {/* Show all saved addresses as a custom dropdown if using Saved Address */}
          {locationMethod === 'account' && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Select Address:</Text>
              <Pressable
                style={{
                  backgroundColor: '#F2F5F2',
                  borderRadius: 8,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: '#DEE3E0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 2
                }}
                onPress={() => setDropdownVisible(true)}
              >
                <Text style={{ flex: 1 }} numberOfLines={2}>
                  {selectedSavedAddressType === 'main' && accountAddress
                    ? `Home: ${accountAddress.houseNumber ? accountAddress.houseNumber + ', ' : ''}${accountAddress.street}, ${accountAddress.city}, ${accountAddress.state} - ${accountAddress.pincode}`
                    : userAddresses.length > 0 && selectedSavedUserAddressId
                      ? (() => {
                          const addr = userAddresses.find(a => a.id === selectedSavedUserAddressId);
                          return addr ? `${addr.label || 'Other'}: ${addr.house_number ? addr.house_number + ', ' : ''}${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}` : 'Select Address';
                        })()
                      : 'Select Address'}
                </Text>
                <Ionicons name={dropdownVisible ? 'chevron-up' : 'chevron-down'} size={20} color="#121714" />
              </Pressable>
              <Modal
                visible={dropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
              >
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setDropdownVisible(false)}>
                  <View style={{
                    position: 'absolute',
                    top: 120,
                    left: 20,
                    right: 20,
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 8,
                    elevation: 5
                  }}>
                    {/* Main address (Home) */}
                    {accountAddress && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: selectedSavedAddressType === 'main' ? '#38E078' : 'white',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 4
                        }}
                        onPress={() => {
                          setSelectedSavedAddressType('main');
                          setSelectedSavedUserAddressId(null);
                          setDropdownVisible(false);
                        }}
                      >
                        <Text style={{ fontWeight: 'bold', color: selectedSavedAddressType === 'main' ? '#121714' : '#121714' }}>Home</Text>
                        <Text style={{ color: selectedSavedAddressType === 'main' ? '#121714' : '#121714' }}>{accountAddress.houseNumber ? `${accountAddress.houseNumber}, ` : ''}{accountAddress.street}, {accountAddress.city}, {accountAddress.state} - {accountAddress.pincode}</Text>
                      </TouchableOpacity>
                    )}
                    {/* All user_addresses */}
                    {userAddresses.length > 0 && userAddresses.map(addr => (
                      <TouchableOpacity
                        key={addr.id}
                        style={{
                          backgroundColor: selectedSavedAddressType === 'user_address' && selectedSavedUserAddressId === addr.id ? '#38E078' : 'white',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 4
                        }}
                        onPress={() => {
                          setSelectedSavedAddressType('user_address');
                          setSelectedSavedUserAddressId(addr.id);
                          setDropdownVisible(false);
                        }}
                      >
                        <Text style={{ fontWeight: 'bold', color: selectedSavedAddressType === 'user_address' && selectedSavedUserAddressId === addr.id ? '#121714' : '#121714' }}>{addr.label || 'Other'}</Text>
                        <Text style={{ color: selectedSavedAddressType === 'user_address' && selectedSavedUserAddressId === addr.id ? '#121714' : '#121714' }}>{addr.house_number ? `${addr.house_number}, ` : ''}{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </View>
          )}
          {/* Address Fields for Add New Location */}
          {locationMethod === 'current' && (
            <>
              <View style={styles.addressRow}>
                <TextInput
                  style={styles.addressInput}
                  placeholder="Label (e.g. Home, Work)"
                  value={newAddressLabel}
                  onChangeText={setNewAddressLabel}
                  editable={true}
                />
              </View>
              <View style={styles.addressRow}>
                <TextInput
                  style={styles.addressInput}
                  placeholder="House Number"
                  value={address.houseNumber}
                  onChangeText={(text) => setAddress({ ...address, houseNumber: text })}
                  editable={true}
                />
              </View>
              <View style={styles.addressRow}>
                <TextInput
                  style={styles.addressInput}
                  placeholder="Street"
                  value={address.street}
                  onChangeText={(text) => setAddress({ ...address, street: text })}
                  editable={true}
                />
              </View>
              <View style={styles.addressRowDouble}>
                <TextInput
                  style={[styles.addressInput, styles.halfInput]}
                  placeholder="City"
                  value={address.city}
                  onChangeText={(text) => setAddress({ ...address, city: text })}
                  editable={true}
                />
                <TextInput
                  style={[styles.addressInput, styles.halfInput]}
                  placeholder="State"
                  value={address.state}
                  onChangeText={(text) => setAddress({ ...address, state: text })}
                  editable={true}
                />
              </View>
              <View style={styles.addressRow}>
                <TextInput
                  style={styles.addressInput}
                  placeholder="Pincode"
                  value={address.pincode}
                  onChangeText={(text) => setAddress({ ...address, pincode: text })}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={true}
                />
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#38E078',
                  borderRadius: 12,
                  padding: 14,
                  alignItems: 'center',
                  marginBottom: 10
                }}
                onPress={async () => {
                  try {
                    if (!newAddressLabel.trim()) {
                      Alert.alert('Error', 'Please enter a label for the address.');
                      return;
                    }
                    // Check for duplicate label (case-insensitive)
                    const labelExists = userAddresses.some(addr => (addr.label || '').trim().toLowerCase() === newAddressLabel.trim().toLowerCase());
                    if (labelExists) {
                      Alert.alert('Error', 'This label already exists. Please use a unique tag.');
                      return;
                    }
                    setLoadingLocation(true);
                    const user = await getUser();
                    if (user && user.id) {
                      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
                      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                      if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase environment variables are missing.');
                      const supabase = createClient(supabaseUrl, supabaseAnonKey);
                      const { data, error } = await supabase
                        .from('user_addresses')
                        .insert([
                          {
                            user_id: user.id,
                            house_number: address.houseNumber,
                            street: address.street,
                            city: address.city,
                            state: address.state,
                            pincode: address.pincode,
                            label: newAddressLabel.trim()
                          }
                        ])
                        .select();
                      if (error) throw error;
                      Alert.alert('Success', 'New address saved!');
                      setNewAddressLabel('');
                      setAddress({ houseNumber: '', street: '', city: '', state: '', pincode: '' });
                      fetchUserAddresses();
                      // Auto-select the new address for booking
                      if (data && data[0] && data[0].id) {
                        setSelectedSavedAddressType('user_address');
                        setSelectedSavedUserAddressId(data[0].id);
                        setLocationMethod('account');
                      }
                    }
                  } catch (err) {
                    Alert.alert('Error', 'Failed to save new address.');
                  } finally {
                    setLoadingLocation(false);
                  }
                }}
              >
                <Text style={{ color: '#121714', fontWeight: 'bold' }}>Save Address</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Date Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Date</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
            {getNext7Days().map((date, idx) => {
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    {
                      width: 56,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: isSelected ? '#38E078' : '#F2F5F2',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#38E078' : '#DEE3E0',
                      marginHorizontal: 2,
                      opacity: 1,
                    },
                  ]}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: isSelected ? '#fff' : '#698273', fontWeight: 'bold', fontSize: 15, textAlign: 'center' }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                  <Text style={{ color: isSelected ? '#fff' : '#121714', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>{date.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Time Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Time</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
            {(selectedDate && selectedDate.getDay() === 0
              ? timeSlots.slice(0, timeSlots.indexOf('4 PM') + 1)
              : timeSlots
            ).map((time) => {
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    {
                      minWidth: 64,
                      maxWidth: 72,
                      height: 40,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginVertical: 4,
                      backgroundColor: isSelected ? '#38E078' : '#F2F5F2',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#38E078' : '#DEE3E0',
                    },
                  ]}
                  onPress={() => setSelectedTime(isSelected ? null : time)}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: isSelected ? '#fff' : '#121714', fontWeight: isSelected ? 'bold' : '500', fontSize: 15, textAlign: 'center' }}>{time}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bathroom Areas Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bathroom Areas</Text>
          </View>
          <View style={styles.applianceList}>
            {bathroomAreaOptions.map((area) => (
              <TouchableOpacity
                key={area.key}
                style={styles.applianceOption}
                onPress={() => handleBathroomAreaToggle(area.key)}
              >
                <View style={[
                  styles.checkbox,
                  selectedBathroomAreas[area.key] && styles.checkboxSelected
                ]}>
                  {selectedBathroomAreas[area.key] && (
                    <Ionicons name="checkmark" size={16} color="#121714" />
                  )}
                </View>
                <Text style={styles.applianceOptionText}>{area.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Severity Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Severity</Text>
          </View>
          <View style={styles.dropdownRow}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setSeverityDropdownOpen(!severityDropdownOpen)}
            >
              <Text style={styles.dropdownText}>{severity || 'Select'}</Text>
              <Ionicons name={severityDropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#638770" />
            </TouchableOpacity>
            {severityDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {(['Mild', 'Moderate', 'Severe'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={styles.dropdownMenuItem}
                    onPress={() => {
                      setSeverity(level);
                      setSeverityDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownMenuItemText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Need Disinfectant Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.switchRow}>
              <Text style={styles.sectionTitle}>Need Disinfectant?</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.toggleSwitch, needDisinfectant ? styles.toggleSwitchActive : styles.toggleSwitchInactive]}
                onPress={() => {
                  setNeedDisinfectant(!needDisinfectant);
                  if (needDisinfectant) setDisinfectantInput('');
                }}
              >
                <View style={[styles.toggleThumb, needDisinfectant ? styles.toggleThumbActive : styles.toggleThumbInactive]} />
              </TouchableOpacity>
            </View>
          </View>

          {needDisinfectant && (
            <View style={{ marginBottom: 16 }}>
              <Pressable
                style={{
                  backgroundColor: '#F2F5F2',
                  borderRadius: 8,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: '#DEE3E0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 2
                }}
                onPress={() => setDisinfectantDropdownOpen(!disinfectantDropdownOpen)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  {disinfectantInput ? (
                    <>
                      <Image source={disinfectantOptions.find(opt => opt.name === disinfectantInput)?.logo} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }} />
                      <Text numberOfLines={1} style={{ flex: 1 }}>{disinfectantInput}</Text>
                    </>
                  ) : (
                    <Text style={{ flex: 1 }} numberOfLines={1}>Select Disinfectant</Text>
                  )}
                </View>
                <Ionicons name={disinfectantDropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#121714" />
              </Pressable>
              {disinfectantDropdownOpen && (
                <View style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  padding: 8,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: '#DEE3E0',
                  marginTop: 2
                }}>
                  {disinfectantOptions.map(opt => (
                    <TouchableOpacity
                      key={opt.name}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 2, backgroundColor: disinfectantInput === opt.name ? '#E6F9ED' : 'white' }}
                      onPress={() => {
                        setDisinfectantInput(opt.name);
                        setDisinfectantDropdownOpen(false);
                      }}
                    >
                      <View style={{ width: 28, height: 28, marginRight: 10 }}>
                        <View style={{ width: 28, height: 28, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F2F5F2' }}>
                          <Image source={opt.logo} style={{ width: 28, height: 28, resizeMode: 'cover' }} />
                        </View>
                      </View>
                      <Text style={{ fontSize: 16, color: '#121714' }}>{opt.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Notes Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>

          <TextInput
            style={styles.notesInput}
            placeholder="Add any special instructions..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Estimated Cost */}
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Estimated Cost</Text>
            <Text style={styles.costValue}>₹{estimatedCost}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isFormValid() ? styles.continueButtonActive : styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!isFormValid()}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
    paddingRight: 48,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#121714',
    lineHeight: 23,
  },
  content: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#121714',
    lineHeight: 23,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE3E0',
    marginBottom: 12,
  },
  locationOptionSelected: {
    borderColor: '#121714',
  },
  locationOptionText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#121714',
    lineHeight: 21,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DEE3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#121714',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#121714',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  addressRow: {
    marginBottom: 12,
  },
  addressRowDouble: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 16,
  },
  addressInput: {
    height: 56,
    backgroundColor: '#F2F5F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#121714',
    lineHeight: 24,
  },
  halfInput: {
    flex: 1,
  },
  calendarContainer: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#121714',
    lineHeight: 20,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  weekDayText: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#121714',
    width: 48,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  dayButtonSelected: {
    backgroundColor: '#38E078',
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#121714',
    lineHeight: 21,
  },
  dayTextSelected: {
    color: '#121714',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  timeSlot: {
    height: 36,
    paddingHorizontal: 16,
    backgroundColor: '#F0F5F2',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#38E078',
  },
  timeSlotText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#121714',
    lineHeight: 21,
  },
  timeSlotTextSelected: {
    color: '#121714',
  },
  roomsList: {
    paddingHorizontal: 16,
  },
  roomOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  roomOptionText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#121714',
    lineHeight: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#DEE3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#38E078',
    borderColor: '#38E078',
  },
  broomToggle: {
    flexDirection: 'row',
    backgroundColor: '#F2F5F2',
    borderRadius: 20,
    padding: 4,
    marginHorizontal: 16,
  },
  broomOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  broomOptionSelected: {
    backgroundColor: '#38E078',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  broomOptionText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#698273',
    lineHeight: 21,
  },
  broomOptionTextSelected: {
    color: '#121714',
  },
  notesInput: {
    minHeight: 144,
    backgroundColor: '#F0F5F2',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    color: '#121714',
    marginHorizontal: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  costLabel: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#121714',
    lineHeight: 24,
  },
  costValue: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#121714',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  continueButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#38E078',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#121714',
    lineHeight: 24,
  },
  kitchenSizeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#F2F5F2',
    borderWidth: 1,
    borderColor: '#DEE3E0',
  },
  kitchenSizeOptionSelected: {
    backgroundColor: '#38E078',
    borderColor: '#38E078',
  },
  kitchenSizeOptionText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#121714',
  },
  kitchenSizeOptionTextSelected: {
    color: '#fff',
  },
  applianceList: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  applianceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  applianceOptionText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#121714',
    marginLeft: 8,
  },
  dropdownRow: {
    marginBottom: 16,
  },
  dropdown: {
    height: 56,
    backgroundColor: '#F2F5F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DEE3E0',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#121714',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 64,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownMenuItemText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#121714',
  },
  materialToggle: {
    flexDirection: 'row',
    backgroundColor: '#F2F5F2',
    borderRadius: 20,
    padding: 4,
    marginHorizontal: 16,
  },
  materialOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  materialOptionSelected: {
    backgroundColor: '#38E078',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  materialOptionText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#698273',
    lineHeight: 21,
  },
  materialOptionTextSelected: {
    color: '#121714',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#A0A0A0',
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
  toggleLabelActive: {
    color: '#121714',
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    padding: 3,
    marginHorizontal: 6,
  },
  toggleSwitchActive: {
    backgroundColor: '#38E078',
  },
  toggleSwitchInactive: {
    backgroundColor: '#ccc',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 3,
    top: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    transitionProperty: 'left',
    transitionDuration: '0.2s',
  },
  toggleThumbActive: {
    left: 23,
  },
  toggleThumbInactive: {
    left: 3,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  switchLabel: {
    fontSize: 16,
    color: '#121714',
    fontWeight: '400',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});
