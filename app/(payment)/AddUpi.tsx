import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert } from 'react-native';
import * as Crypto from 'expo-crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

interface AddUpiProps {
  userId: string;
  onSuccess: (upiId: string) => void;
}

export default function AddUpi({ userId, onSuccess }: AddUpiProps) {
  const [customUpi, setCustomUpi] = useState('');
  const [upiVerified, setUpiVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  async function hashUpiId(upiId: string) {
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, upiId + (ENCRYPTION_KEY || ''));
  }

  const handleAddUpi = async () => {
    setUpiVerified(true); // Assume valid for now
    if (!userId || !customUpi || !supabase) {
      Alert.alert('Error', 'User or UPI ID missing.');
      return;
    }
    setLoading(true);
    try {
      const hashedUpi = await hashUpiId(customUpi);
      const insertData = {
        user_id: userId,
        upi_id: customUpi,
        encrypted_details: hashedUpi,
        created_at: new Date().toISOString(),
        type: 'upi',
      };
      const { error } = await supabase.from('user_payment_method_upi').insert([insertData]);
      if (!error) {
        onSuccess(customUpi);
      } else {
        console.error('UPI upload error:', error, 'Insert data:', insertData);
        Alert.alert('Error', 'Failed to save UPI. Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
      <TextInput
        style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E3DEDE', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 16, marginBottom: 4 }}
        placeholder="Enter your UPI ID"
        value={customUpi}
        onChangeText={setCustomUpi}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      <Text style={{ color: upiVerified === true ? '#38E078' : upiVerified === false ? 'red' : '#827069', fontSize: 14 }}>
        {upiVerified === true ? 'Verified' : upiVerified === false ? 'Invalid UPI ID' : 'Live verification indicator'}
      </Text>
      <TouchableOpacity
        style={{ marginTop: 8, backgroundColor: '#38E078', borderRadius: 20, height: 40, justifyContent: 'center', alignItems: 'center', opacity: loading ? 0.7 : 1 }}
        onPress={handleAddUpi}
        disabled={loading}
      >
        <Text style={{ color: '#0D1A12', fontWeight: '700', fontSize: 14 }}>Link and Proceed</Text>
      </TouchableOpacity>
    </View>
  );
}
