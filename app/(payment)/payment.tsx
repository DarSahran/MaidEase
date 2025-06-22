import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getUser } from '../../utils/session'; // adjust path if needed
import AddUpi from './AddUpi';

interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'wallet' | 'cash';
  title: string;
  subtitle?: string;
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderData = params.orderData ? JSON.parse(params.orderData as string) : {};
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [userCards, setUserCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('');
  const [customUpi, setCustomUpi] = useState('');
  const [upiVerified, setUpiVerified] = useState<boolean | null>(null);
  // Promo code state
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [userUpis, setUserUpis] = useState<any[]>([]);
  const [loadingUpis, setLoadingUpis] = useState(true);
  // Fetch user custom UPI from user_payment_method_upi (latest only)
  const [customUpiSaved, setCustomUpiSaved] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Helper to get current user ID robustly
  async function getCurrentUserId() {
    if (supabase && supabase.auth && supabase.auth.getUser) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id) return user.id;
      } catch {}
    }
    const sessionUser = await getUser();
    if (sessionUser && sessionUser.id) return sessionUser.id;
    return null;
  }

  // Fetch user cards from Supabase
  React.useEffect(() => {
    async function fetchCards() {
      setLoadingCards(true);
      const userId = await getCurrentUserId();
      if (!userId || !supabase) {
        setUserCards([]);
        setLoadingCards(false);
        return;
      }
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'card');
      if (error) {
        setUserCards([]);
      } else {
        setUserCards(data || []);
      }
      setLoadingCards(false);
    }
    fetchCards();
  }, []);

  // Fetch user UPI IDs from Supabase
  React.useEffect(() => {
    async function fetchUpis() {
      setLoadingUpis(true);
      const userId = await getCurrentUserId();
      if (!userId || !supabase) {
        setUserUpis([]);
        setLoadingUpis(false);
        return;
      }
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'upi');
      if (error) {
        setUserUpis([]);
      } else {
        setUserUpis(data || []);
      }
      setLoadingUpis(false);
    }
    fetchUpis();
  }, []);

  // Fetch user custom UPI from user_payment_method_upi (latest only)
  React.useEffect(() => {
    async function fetchCustomUpi() {
      const userId = await getCurrentUserId();
      if (!userId || !supabase) {
        setCustomUpiSaved(null);
        return;
      }
      const { data, error } = await supabase
        .from('user_payment_method_upi')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setCustomUpiSaved(data[0].upi_id);
        setSelectedUpiApp('custom-saved');
        setCustomUpi(data[0].upi_id);
      } else {
        setCustomUpiSaved(null);
      }
    }
    fetchCustomUpi();
  }, []);

  // On mount, get userId for AddUpi
  React.useEffect(() => {
    async function fetchUserId() {
      if (supabase && supabase.auth && supabase.auth.getUser) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.id) setCurrentUserId(user.id);
        } catch {}
      }
    }
    fetchUserId();
  }, []);

  // Decrypt function (hashing is not reversible, so just show last4, name, brand)
  function getCardDisplayInfo(card: any) {
    // Only last4, brand, and name are available
    return {
      last4: card.last4,
      brand: card.brand,
      name: card.encrypted_details ? 'Saved Card' : '', // fallback if name not stored separately
    };
  }

  // Helper to clear other payment selections
  const handleUpiSelect = (upiId: string) => {
    setSelectedUpiApp(upiId);
    setCustomUpi('');
    setSelectedPaymentMethod('');
  };
  const handleCustomUpiSelect = () => {
    setSelectedUpiApp('custom');
    setSelectedPaymentMethod('');
  };
  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setSelectedUpiApp('');
    setCustomUpi('');
  };

  const handleAddNewCard = () => {
    // Navigate to add card screen or show modal
    router.push('/(payment)/add-card');
  };

  const handleWalletChange = () => {
    // Handle wallet change functionality
    Alert.alert('Change Wallet', 'Wallet change functionality will be implemented here');
  };

  const handleContinue = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method to continue');
      return;
    }
    const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);
    // Use string path for navigation
    router.push({
      pathname: '/(main)/service/payment-processing' as any,
      params: {
        orderData: JSON.stringify(orderData),
        paymentMethod: JSON.stringify(selectedMethod),
        promoCode: selectedPromo?.code || '',
      }
    });
  };

  // Card brand logo helper
  function getCardBrandLogo(brand: string) {
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

  // UPI app logo helper
  function getUpiLogo(app: string) {
    try {
      switch (app) {
        case 'phonepe':
          return require('../../assets/upi/phonepe.png');
        case 'gpay':
          return require('../../assets/upi/gpay.png');
        case 'paytm':
          return require('../../assets/upi/paytm.png');
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  // Replace hardcoded card payment methods with fetched cards
  // Fix: add 'as const' to type fields for strict typing
  const cardPaymentMethods: PaymentMethod[] = userCards.map((card) => {
    const info = getCardDisplayInfo(card);
    return {
      id: `card-${info.last4}`,
      type: 'card' as const,
      title: `**** ${info.last4}`,
      subtitle: info.name,
      // brand and logo are extra fields, but only PaymentMethod fields are required
    };
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi-yourname',
      type: 'upi',
      title: 'yourname@upi',
    },
    ...cardPaymentMethods,
    {
      id: 'wallet',
      type: 'wallet' as const,
      title: 'Wallet',
    },
    {
      id: 'cash',
      type: 'cash' as const,
      title: 'Cash',
    },
  ];

  // Helper to hash UPI ID
  async function hashUpiId(upiId: string) {
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, upiId + (ENCRYPTION_KEY || ''));
  }

  // UPI options: 3 apps + latest custom (if any) + Other, all uniform
  const upiAppOptions = [
    { id: 'phonepe', name: 'PhonePe', logo: getUpiLogo('phonepe'), iconLabel: null },
    { id: 'gpay', name: 'GPay', logo: getUpiLogo('gpay'), iconLabel: null },
    { id: 'paytm', name: 'Paytm', logo: getUpiLogo('paytm'), iconLabel: null },
    ...(customUpiSaved ? [{ id: 'custom-saved', name: customUpiSaved, logo: null, iconLabel: '🆔' }] : []),
    { id: 'custom', name: 'Other', logo: null, iconLabel: '+' },
  ];

  // Fetch promo codes from Supabase (table: coupons)
  React.useEffect(() => {
    async function fetchPromoCodes() {
      if (!supabase) return;
      const { data, error } = await supabase.from('coupons').select('*');
      if (!error && data) setPromoCodes(data);
    }
    fetchPromoCodes();
  }, []);

  // Only show MAID10 by default, allow manual entry for others
  const maid10Promo = React.useMemo(() => {
    if (!promoCodes || promoCodes.length === 0) return null;
    return promoCodes.find((c) => c.code.trim().toUpperCase() === 'MAID10');
  }, [promoCodes]);

  // Calculate discounted total
  const getDiscountedTotal = () => {
    const total = orderData.costs?.total || 1400;
    if (selectedPromo && selectedPromo.discount_type && selectedPromo.discount_value) {
      if (selectedPromo.discount_type === 'percent') {
        return Math.max(0, total - (total * selectedPromo.discount_value) / 100);
      } else if (selectedPromo.discount_type === 'amount') {
        return Math.max(0, total - selectedPromo.discount_value);
      }
    }
    return total;
  };

  // Only one payment type can be selected at a time
  const isPaymentSelected = !!(selectedPaymentMethod || selectedUpiApp);

  const renderPaymentMethodItem = (method: any, showRadio: boolean = true) => {
    if (!method || typeof method !== 'object' || !('id' in method) || !('title' in method)) return null;
    const isSelected = selectedPaymentMethod === method.id;
    // Only highlight for non-UPI methods
    const highlight = isSelected && method.type !== 'upi';
    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentMethodRow,
          highlight && {
            borderColor: '#38E078',
            borderWidth: 2,
            backgroundColor: '#E6F9EF',
            borderRadius: 12,
          }
        ]}
        onPress={() => showRadio && handlePaymentMethodSelect(method.id)}
        activeOpacity={0.7}
      >
        <View style={styles.paymentMethodLeft}>
          {method.logo && (
            <Image source={method.logo} style={{ width: 32, height: 20, marginRight: 12 }} resizeMode="contain" />
          )}
          <View style={styles.paymentMethodText}>
            <Text style={styles.paymentMethodTitle}>{method.title}</Text>
            {method.subtitle && (
              <Text style={styles.paymentMethodSubtitle}>{method.subtitle}</Text>
            )}
          </View>
        </View>
        
        {showRadio && (
          <View style={styles.radioButtonContainer}>
            <View style={[
              styles.radioButton,
              isSelected && styles.radioButtonSelected
            ]}>
              {isSelected && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </View>
        )}
        
        {method.id === 'wallet' && (
          <TouchableOpacity style={styles.changeButton} onPress={handleWalletChange}>
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const handleApplyPromo = async () => {
    setPromoError(null);
    if (promoInput.trim().toUpperCase() === 'MAID10') {
      if (maid10Promo) {
        setSelectedPromo(maid10Promo);
        setPromoError(null);
      } else {
        setSelectedPromo(null);
        setPromoError('Promo code not available.');
      }
      return;
    }
    // For other codes, fetch from DB
    if (!supabase) return;
    const { data, error } = await supabase.from('coupons').select('*').eq('code', promoInput.trim().toUpperCase()).single();
    if (!error && data) {
      setSelectedPromo(data);
      setPromoError(null);
    } else {
      setSelectedPromo(null);
      setPromoError('Invalid or expired promo code.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => (router.canGoBack && router.canGoBack()) ? router.back() : router.replace('/welcome')}>
            <Ionicons name="arrow-back" size={24} color="#0D1A12" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Select Payment Method</Text>
          </View>
        </View>

        {/* UPI Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>UPI</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, marginBottom: 8 }}>
          {upiAppOptions.map(app => (
            <TouchableOpacity
              key={app.id}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 150,
                  height: 48,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  borderWidth: selectedUpiApp === app.id ? 2 : 1,
                  borderColor: selectedUpiApp === app.id ? '#38E078' : '#E3DEDE',
                  backgroundColor: '#fff',
                  marginRight: 8,
                  marginBottom: 8,
                },
              ]}
              onPress={() => {
                if (app.id === 'custom') handleCustomUpiSelect();
                else if (app.id === 'custom-saved') {
                  setSelectedUpiApp(app.id);
                  setCustomUpi(app.name);
                  setSelectedPaymentMethod('');
                } else handleUpiSelect(app.id);
              }}
              activeOpacity={0.8}
            >
              {app.logo ? (
                <Image source={app.logo} style={{ width: 28, height: 28, marginRight: 10 }} resizeMode="contain" />
              ) : (
                <Text style={{ fontSize: 22, marginRight: 10 }}>{app.iconLabel}</Text>
              )}
              <Text style={{ fontSize: 16, color: '#0D1A12', fontWeight: selectedUpiApp === app.id ? '700' : '400' }}>{app.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedUpiApp === 'custom' && (
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <TextInput
              style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E3DEDE', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 16, marginBottom: 4 }}
              placeholder="Enter your UPI ID"
              value={customUpi}
              onChangeText={setCustomUpi}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={{ color: upiVerified === true ? '#38E078' : upiVerified === false ? 'red' : '#827069', fontSize: 14 }}>
              {upiVerified === true ? 'Verified' : upiVerified === false ? 'Invalid UPI ID' : 'Live verification indicator'}
            </Text>
            <TouchableOpacity
              style={{ marginTop: 8, backgroundColor: '#38E078', borderRadius: 20, height: 40, justifyContent: 'center', alignItems: 'center' }}
              onPress={async () => {
                setUpiVerified(true);
                // Save UPI ID to user_payment_method_upi for this user, hashed
                const userId = await getCurrentUserId();
                if (!userId || typeof userId !== 'string' || userId.length < 5) {
                  console.error('Invalid userId for UPI insert:', userId);
                  Alert.alert('User not found', 'Please log in again.');
                  return;
                }
                if (customUpi && supabase) {
                  const hashedUpi = await hashUpiId(customUpi);
                  const insertData = {
                    user_id: userId, // correct: set user_id, not id
                    upi_id: customUpi,
                    encrypted_details: hashedUpi,
                    created_at: new Date().toISOString(),
                    type: 'upi',
                  };
                  console.log('Attempting UPI insert:', insertData);
                  const { error } = await supabase.from('user_payment_method_upi').insert([insertData]);
                  if (!error) {
                    console.log('UPI uploaded for user:', userId, customUpi);
                  } else {
                    console.error('UPI upload error:', error, 'Insert data:', insertData);
                    Alert.alert('Error', 'Failed to save UPI. Please try again.');
                    return;
                  }
                  // Fetch latest and update UI
                  const { data } = await supabase
                    .from('user_payment_method_upi')
                    .select('*')
                    .eq('user_id', userId) // correct: query by user_id
                    .order('created_at', { ascending: false });
                  if (data && data.length > 0) {
                    setCustomUpiSaved(data[0].upi_id);
                    setSelectedUpiApp('custom-saved');
                    setCustomUpi(data[0].upi_id);
                  }
                }
              }}
            >
              <Text style={{ color: '#0D1A12', fontWeight: '700', fontSize: 14 }}>Link and Proceed</Text>
            </TouchableOpacity>
          </View>
        )}
        {selectedUpiApp === 'custom' && currentUserId && (
          <AddUpi
            userId={currentUserId}
            onSuccess={(upiId) => {
              setCustomUpiSaved(upiId);
              setSelectedUpiApp('custom-saved');
              setCustomUpi(upiId);
            }}
          />
        )}

        {/* Debit and Credit Card Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Debit and Credit Card</Text>
        </View>
        {cardPaymentMethods.length === 0 ? (
          <Text style={{ marginLeft: 24, color: '#827069', fontSize: 15 }}>No cards saved yet.</Text>
        ) : (
          cardPaymentMethods.filter(Boolean).map((method, idx) => renderPaymentMethodItem(method))
        )}
        {/* Add New Card */}
        <TouchableOpacity style={styles.addNewCardRow} onPress={handleAddNewCard}>
          <View style={styles.paymentMethodLeft}>
            <View style={styles.paymentMethodText}>
              <Text style={styles.paymentMethodTitle}>Add New Card</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Wallet Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Wallet</Text>
        </View>
        {renderPaymentMethodItem(paymentMethods[3])}

        {/* Cash Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cash</Text>
        </View>
        {renderPaymentMethodItem(paymentMethods[4])}

        {/* Promo Code Section - after all payment methods */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
        </View>
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          {/* Manual promo code entry */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TextInput
              style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E3DEDE', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 16 }}
              placeholder="Enter promo code"
              value={promoInput}
              onChangeText={setPromoInput}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={{ marginLeft: 8, backgroundColor: '#38E078', borderRadius: 10, paddingHorizontal: 18, height: 44, justifyContent: 'center', alignItems: 'center' }}
              onPress={handleApplyPromo}
            >
              <Text style={{ color: '#0D1A12', fontWeight: '700', fontSize: 15 }}>Apply</Text>
            </TouchableOpacity>
          </View>
          {promoError && <Text style={{ color: 'red', fontSize: 14, marginBottom: 4 }}>{promoError}</Text>}
          {/* Only show MAID10 by default */}
          {promoCodes.filter((promo: any) => promo.code === 'MAID10').length > 0 && (
            <View style={{ marginTop: 4 }}>
              {promoCodes.filter((promo: any) => promo.code === 'MAID10').map((promo: any) => (
                <TouchableOpacity
                  key={promo.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                    borderWidth: selectedPromo?.id === promo.id ? 2 : 1,
                    borderColor: selectedPromo?.id === promo.id ? '#38E078' : '#E3DEDE',
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    padding: 12,
                  }}
                  onPress={() => { setSelectedPromo(promo); setPromoInput(promo.code); setPromoError(null); }}
                >
                  <Text style={{ flex: 1, fontSize: 15, color: '#0D1A12', fontWeight: selectedPromo?.id === promo.id ? '700' : '400' }}>{promo.code} - {promo.description}</Text>
                  {selectedPromo?.id === promo.id && (
                    <Text style={{ color: '#38E078', fontWeight: '700', marginLeft: 8 }}>APPLIED</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Cost Summary */}
        <View style={styles.costSummarySection}>
          <Text style={styles.costSummaryTitle}>Cost Summary</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Total</Text>
            <Text style={styles.costValue}>₹{getDiscountedTotal()}</Text>
          </View>
          {selectedPromo && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Promo ({selectedPromo.code})</Text>
              <Text style={[styles.costValue, { color: '#38E078' }]}>-
                {selectedPromo.discount_type === 'percent'
                  ? `${selectedPromo.discount_value}%`
                  : `₹${selectedPromo.discount_value}`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isPaymentSelected ? styles.continueButtonActive : styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!isPaymentSelected}
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
    backgroundColor: '#F7FAFA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F7FAFA',
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
    color: '#0D1A12',
    lineHeight: 23,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0D1A12',
    lineHeight: 23,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7FAFA',
    minHeight: 56,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F2ED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#0D1A12',
    lineHeight: 24,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#598C6E',
    lineHeight: 21,
  },
  radioButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DEE3E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFA',
  },
  radioButtonSelected: {
    borderColor: '#38E078',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38E078',
  },
  addNewCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7FAFA',
    minHeight: 56,
  },
  changeButton: {
    height: 32,
    paddingHorizontal: 16,
    backgroundColor: '#E8F2ED',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#0D1A12',
    lineHeight: 21,
  },
  costSummarySection: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  costSummaryTitle: {
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F1A14',
    lineHeight: 28,
    marginBottom: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  costLabel: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#598C6E',
    lineHeight: 21,
  },
  costValue: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#0F1A14',
    lineHeight: 21,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7FAFA',
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
    backgroundColor: '#C5C5C5',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0D1A12',
    lineHeight: 24,
  },
});
