import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getCurrentUserIdFromUsersTable } from '../../utils/session'; // adjust path if needed

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Card brand recognition
function getCardBrand(number: string) {
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  if (/^(60|6521|6522|652[89]|653[0-9]|508)/.test(number)) return 'rupay';
  return '';
}

function getCardLogoPng(brand: string) {
  switch (brand) {
    case 'visa':
      return require('../../assets/card-logos/visa.png');
    case 'mastercard':
      return require('../../assets/card-logos/mastercard.png');
    case 'rupay':
      return require('../../assets/card-logos/rupay.png');
    default:
      return null;
  }
}

export default function AddCardScreen() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  // Format card number as 1234 5678 9012 3456
  const formatCardNumber = (input: string) => {
    return input.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleAddCard = async () => {
    // Remove spaces for validation
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    if (!rawCardNumber || !name || !expiryMonth || !expiryYear || !cvv) {
      Alert.alert('Missing Fields', 'Please fill all card details.');
      return;
    }
    if (rawCardNumber.length < 13 || rawCardNumber.length > 19) {
      Alert.alert('Invalid Card', 'Card number must be 13-19 digits.');
      return;
    }
    if (!/^[0-9]{2}$/.test(expiryMonth) || !/^[0-9]{2}$/.test(expiryYear)) {
      Alert.alert('Invalid Expiry', 'Expiry must be in MM/YY format.');
      return;
    }
    if (!/^[0-9]{3,4}$/.test(cvv)) {
      Alert.alert('Invalid CVV', 'CVV must be 3 or 4 digits.');
      return;
    }
    if (!supabase || !ENCRYPTION_KEY) {
      Alert.alert('Error', 'Supabase or encryption key not configured');
      return;
    }
    setLoading(true);
    try {
      // Always use custom users table ID
      const userId = await getCurrentUserIdFromUsersTable();
      if (!userId) {
        Alert.alert('Error', 'User not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      const expiry = `${expiryMonth}/${expiryYear}`;
      const cardDetails = JSON.stringify({ number: rawCardNumber, expiry, name, cvv });
      // Use expo-crypto to hash the card details with the key (not reversible encryption)
      const encrypted = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        cardDetails + ENCRYPTION_KEY
      );
      const last4 = rawCardNumber.slice(-4);
      const brand = getCardBrand(rawCardNumber);
      if (saveCard) {
        const { error } = await supabase
          .from('user_payment_methods_cards')
          .insert([
            {
              user_id: userId,
              type: 'card',
              encrypted_details: encrypted,
              last4,
              brand
            }
          ]);
        if (!error) {
          Alert.alert('Success', 'Card saved successfully!');
          router.back();
        } else {
          Alert.alert('Error', 'Failed to save card.');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'An error occurred.');
    }
    setLoading(false);
  };

  const cardBrand = getCardBrand(cardNumber.replace(/\s/g, ''));
  const cardLogo = getCardLogoPng(cardBrand);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#171212" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Add New Card</Text>
          </View>
        </View>
        {/* Card Number */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>Card Number</Text>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput
              style={[styles.input, { paddingRight: 48 }]}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#B0A9A4"
              keyboardType="number-pad"
              maxLength={19}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              returnKeyType="next"
            />
            {cardLogo && (
              <View style={styles.cardLogoContainer}>
                <Image source={cardLogo} style={styles.cardLogo} resizeMode="contain" />
              </View>
            )}
          </View>
        </View>
        {/* Name */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>Name on Card</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#B0A9A4"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>
        {/* Expiry and CVV */}
        <View style={{ flexDirection: 'row', gap: 16, marginHorizontal: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Expiry (MM/YY)</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 4 }]}
                placeholder="MM"
                placeholderTextColor="#B0A9A4"
                keyboardType="number-pad"
                maxLength={2}
                value={expiryMonth}
                onChangeText={setExpiryMonth}
                returnKeyType="next"
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 4 }]}
                placeholder="YY"
                placeholderTextColor="#B0A9A4"
                keyboardType="number-pad"
                maxLength={2}
                value={expiryYear}
                onChangeText={setExpiryYear}
                returnKeyType="next"
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>CVV</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="CVV"
                placeholderTextColor="#B0A9A4"
                keyboardType="number-pad"
                maxLength={4}
                value={cvv}
                onChangeText={setCvv}
                secureTextEntry={!showCvv}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowCvv(!showCvv)} style={{ marginLeft: 8 }}>
                <Ionicons name={showCvv ? 'eye-off' : 'eye'} size={22} color="#827069" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Save Card Switch */}
        <View style={styles.saveCardRow}>
          <Text style={styles.saveCardText}>Save card for future use</Text>
          <Switch
            value={saveCard}
            onValueChange={setSaveCard}
            trackColor={{ false: '#C5C5C5', true: '#38E078' }}
            thumbColor={saveCard ? '#38E078' : '#C5C5C5'}
          />
        </View>
      </ScrollView>
      {/* Add Card Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.addCardButton, loading && { opacity: 0.7 }]}
          onPress={handleAddCard}
          disabled={loading}
        >
          <Text style={styles.addCardButtonText}>Add Card and Proceed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F5F2',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F0F5F2',
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
    color: '#171212',
    lineHeight: 23,
  },
  inputRow: {
    width: '100%',
    maxWidth: 480,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#827069',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    height: 48,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3DEDE',
    fontSize: 16,
    color: '#171212',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
  },
  cardBrand: {
    fontSize: 13,
    color: '#38E078',
    fontWeight: '600',
    marginTop: 2,
    marginLeft: 2,
  },
  saveCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  saveCardText: {
    fontSize: 16,
    color: '#171212',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F0F5F2',
  },
  addCardButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#38E078',
  },
  addCardButtonText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#171212',
    lineHeight: 24,
  },
  cardLogoContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLogo: {
    width: 32,
    height: 20,
  },
});
