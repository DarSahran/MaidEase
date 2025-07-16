import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { getCurrentUserIdFromUsersTable } from '../../utils/session';
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
  const [isPaying, setIsPaying] = useState(false);
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

  // Fetch user cards from Supabase
  React.useEffect(() => {
    async function fetchCards() {
      setLoadingCards(true);
      const userId = await getCurrentUserIdFromUsersTable();
      if (!userId || !supabase) {
        setUserCards([]);
        setLoadingCards(false);
        return;
      }
      const { data, error } = await supabase
        .from('user_payment_methods_cards')
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
      const userId = await getCurrentUserIdFromUsersTable();
      if (!userId || !supabase) {
        setUserUpis([]);
        setLoadingUpis(false);
        return;
      }
      const { data, error } = await supabase
        .from('user_payment_method_upi')
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
      const userId = await getCurrentUserIdFromUsersTable();
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
      const userId = await getCurrentUserIdFromUsersTable();
      if (userId) setCurrentUserId(userId);
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

  // Helper to get cost breakdown from real confirmation page data
  const getCostBreakdown = () => {
    // Use the real keys from confirmation page
    const base = orderData.costs?.basePrice ?? 0;
    const platform = orderData.costs?.platformFee ?? 0;
    const total = orderData.costs?.total ?? (base + platform);
    let discount = 0;
    if (selectedPromo && selectedPromo.discount_type && selectedPromo.discount_value) {
      if (selectedPromo.discount_type === 'percent') {
        discount = (total * selectedPromo.discount_value) / 100;
      } else if (selectedPromo.discount_type === 'amount') {
        discount = selectedPromo.discount_value;
      }
    }
    const finalTotal = Math.max(0, total - discount);
    return { base, platform, discount, total, finalTotal };
  };

  const handleContinue = async () => {
    // Razorpay integration: Secure payment flow
    if (!selectedPaymentMethod && !selectedUpiApp) {
      Alert.alert('Select Payment Method', 'Please select a payment method to continue.');
      return;
    }
    setIsPaying(true);
    try {
      // 1. Prepare payment details
      const { base, platform, discount, total, finalTotal } = getCostBreakdown();
      // 2. Call backend to create Razorpay order (never do this client-side)
      const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend.com/api/create-razorpay-order';
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(finalTotal * 100), // Razorpay expects paise
          currency: 'INR',
          receipt: orderData?.id || `order_${Date.now()}`,
          notes: { user: currentUserId || '', service: orderData?.service_name || '' },
        }),
      });
      let orderId, amount, keyId;
      if (!response.ok) {
        // Only read the body ONCE
        const errorText = await response.text();
        throw new Error('Failed to create payment order.' + (errorText ? ' Details: ' + errorText : ''));
      } else {
        // Only read the body ONCE
        let json;
        try {
          json = await response.json();
        } catch (err) {
          throw new Error('Invalid backend response: Could not parse JSON.');
        }
        orderId = json.orderId;
        amount = json.amount;
        keyId = json.keyId;
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: keyId, // Publishable key only
        order_id: orderId,
        amount: amount, // in paise
        currency: 'INR',
        name: 'MaidEasy',
        description: 'Service Payment',
        prefill: {
          email: orderData?.user_email || '',
          contact: orderData?.user_phone || '',
          name: orderData?.user_name || '',
        },
        theme: { color: '#38E078' },
        // Only allow UPI/Card/Wallet
        method: {
          netbanking: false,
          card: true,
          upi: true,
          wallet: true,
        },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          // 4. On success, verify payment with backend
          //    Pass payment_id, order_id, signature to backend for verification
          const verifyRes = await fetch(`${backendUrl.replace('create-razorpay-order', 'verify-razorpay-payment')}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: data.razorpay_payment_id,
              orderId: data.razorpay_order_id,
              signature: data.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) throw new Error('Payment verification failed.');
          // 5. On verified, navigate to payment-processing (which saves booking/payment in Supabase)
          // Build new orderData to pass forward
          let selectedMethod: any = null;
          if (selectedPaymentMethod) {
            selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod)
              || cardPaymentMethods.find(method => method.id === selectedPaymentMethod)
              || { id: selectedPaymentMethod, type: 'wallet', title: selectedPaymentMethod };
          } else if (selectedUpiApp) {
            if (selectedUpiApp === 'custom' || selectedUpiApp === 'custom-saved') {
              selectedMethod = {
                id: 'upi-custom',
                type: 'upi',
                title: customUpi || customUpiSaved || 'Custom UPI',
              };
            } else {
              const upiApp = upiAppOptions.find(app => app.id === selectedUpiApp);
              selectedMethod = {
                id: upiApp?.id || 'upi',
                type: 'upi',
                title: upiApp?.name || 'UPI',
              };
            }
          }
          // Fetch service_id from Supabase (optional, can be handled in payment-processing)
          let serviceId = null;
          if (supabase && orderData.service_name) {
            const { data, error } = await supabase
              .from('services')
              .select('id')
              .eq('name', orderData.service_name)
              .single();
            if (!error && data) {
              serviceId = data.id;
            }
          }
          const newOrderData = {
            ...orderData,
            costs: {
              basePrice: base,
              platformFee: platform,
              total,
              discount,
              final_total: finalTotal,
            },
            discounted_total: finalTotal,
            promo: selectedPromo ? {
              code: selectedPromo.code,
              discount_type: selectedPromo.discount_type,
              discount_value: selectedPromo.discount_value,
            } : null,
            service_id: serviceId,
            razorpay_payment_id: data.razorpay_payment_id,
          };
          router.replace({
            pathname: '/(payment)/payment-processing',
            params: {
              orderData: JSON.stringify(newOrderData),
              paymentMethod: JSON.stringify(selectedMethod),
              promoCode: selectedPromo?.code || '',
            },
          });
        })
        .catch((err: any) => {
          // 6. On failure/cancel, show error
          if (err && err.description !== 'Payment Cancelled') {
            Alert.alert('Payment Failed', err.description || 'Payment was not completed.');
          }
        })
        .finally(() => setIsPaying(false));
    } catch (e) {
      setIsPaying(false);
      let message = 'Could not start payment.';
      if (typeof e === 'object' && e && 'message' in e) {
        message = (e as any).message;
      } else if (typeof e === 'string') {
        message = e;
      }
      Alert.alert('Payment Error', message);
    }
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

  // Only cards in card section, not in wallet
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi-yourname',
      type: 'upi',
      title: 'yourname@upi',
    },
    // No cards here
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 }}>
          {upiAppOptions.map(app => (
            <TouchableOpacity
              key={app.id}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  width: '48%',
                  height: 52,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  borderWidth: selectedUpiApp === app.id ? 2 : 1,
                  borderColor: selectedUpiApp === app.id ? '#38E078' : '#E3DEDE',
                  backgroundColor: '#fff',
                  marginBottom: 12,
                  marginTop: 2,
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
              activeOpacity={0.85}
            >
              {/* Icon logic */}
              {app.id === 'custom-saved' ? (
                <Image source={require('../../assets/upi/bhim.png')} style={{ width: 28, height: 28, marginRight: 10 }} resizeMode="contain" />
              ) : app.logo ? (
                <Image source={app.logo} style={{ width: 28, height: 28, marginRight: 10 }} resizeMode="contain" />
              ) : (
                <Text style={{ fontSize: 22, marginRight: 10 }}>{app.iconLabel}</Text>
              )}
              <Text style={{ fontSize: 16, color: '#0D1A12', fontWeight: selectedUpiApp === app.id ? '700' : '400' }}>{app.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Only render AddUpi, remove redundant inline UPI input */}
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
        <View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 12, marginBottom: 16, overflow: 'hidden' }}>
          {/* Paytm Wallet */}
          <TouchableOpacity
            style={[
              { flexDirection: 'row', alignItems: 'center', height: 56, paddingLeft: 16, paddingRight: 16, backgroundColor: selectedPaymentMethod === 'wallet-paytm' ? '#E6F9EF' : '#F7FAFA', borderBottomWidth: 1, borderBottomColor: '#E3DEDE' },
              selectedPaymentMethod === 'wallet-paytm' && { borderLeftWidth: 4, borderLeftColor: '#38E078', borderRadius: 12 }
            ]}
            onPress={() => handlePaymentMethodSelect('wallet-paytm')}
            activeOpacity={0.85}
          >
            <View style={{ width: 40, height: 40, backgroundColor: '#E8F2ED', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../../assets/upi/paytm.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </View>
            <Text style={{ flex: 1, color: '#0D1A12', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: 24, marginLeft: 16 }}>Paytm Wallet</Text>
            {selectedPaymentMethod === 'wallet-paytm' && (
              <Ionicons name="checkmark" size={22} color="#38E078" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
          {/* Amazon Pay */}
          <TouchableOpacity
            style={[
              { flexDirection: 'row', alignItems: 'center', height: 56, paddingLeft: 16, paddingRight: 16, backgroundColor: selectedPaymentMethod === 'wallet-amazonpay' ? '#E6F9EF' : '#F7FAFA', borderBottomWidth: 1, borderBottomColor: '#E3DEDE' },
              selectedPaymentMethod === 'wallet-amazonpay' && { borderLeftWidth: 4, borderLeftColor: '#38E078', borderRadius: 12 }
            ]}
            onPress={() => handlePaymentMethodSelect('wallet-amazonpay')}
            activeOpacity={0.85}
          >
            <View style={{ width: 40, height: 40, backgroundColor: '#E8F2ED', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../../assets/upi/amazonpay.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </View>
            <Text style={{ flex: 1, color: '#0D1A12', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: 24, marginLeft: 16 }}>Amazon Pay</Text>
            {selectedPaymentMethod === 'wallet-amazonpay' && (
              <Ionicons name="checkmark" size={22} color="#38E078" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
          {/* PhonePe Wallet */}
          <TouchableOpacity
            style={[
              { flexDirection: 'row', alignItems: 'center', height: 56, paddingLeft: 16, paddingRight: 16, backgroundColor: selectedPaymentMethod === 'wallet-phonepe' ? '#E6F9EF' : '#F7FAFA', borderBottomWidth: 1, borderBottomColor: '#E3DEDE' },
              selectedPaymentMethod === 'wallet-phonepe' && { borderLeftWidth: 4, borderLeftColor: '#38E078', borderRadius: 12 }
            ]}
            onPress={() => handlePaymentMethodSelect('wallet-phonepe')}
            activeOpacity={0.85}
          >
            <View style={{ width: 40, height: 40, backgroundColor: '#E8F2ED', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../../assets/upi/phonepe.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </View>
            <Text style={{ flex: 1, color: '#0D1A12', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: 24, marginLeft: 16 }}>PhonePe Wallet</Text>
            {selectedPaymentMethod === 'wallet-phonepe' && (
              <Ionicons name="checkmark" size={22} color="#38E078" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
          {/* Mobikwik */}
          <TouchableOpacity
            style={[
              { flexDirection: 'row', alignItems: 'center', height: 56, paddingLeft: 16, paddingRight: 16, backgroundColor: selectedPaymentMethod === 'wallet-mobikwik' ? '#E6F9EF' : '#F7FAFA' },
              selectedPaymentMethod === 'wallet-mobikwik' && { borderLeftWidth: 4, borderLeftColor: '#38E078', borderRadius: 12 }
            ]}
            onPress={() => handlePaymentMethodSelect('wallet-mobikwik')}
            activeOpacity={0.85}
          >
            <View style={{ width: 40, height: 40, backgroundColor: '#E8F2ED', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../../assets/upi/mobikwik.jpeg')} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </View>
            <Text style={{ flex: 1, color: '#0D1A12', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: 24, marginLeft: 16 }}>Mobikwik</Text>
            {selectedPaymentMethod === 'wallet-mobikwik' && (
              <Ionicons name="checkmark" size={22} color="#38E078" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        </View>

        {/* Cash Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cash</Text>
        </View>
        {/* Custom Pay on Delivery (Cash/COD) UI */}
        <TouchableOpacity
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: selectedPaymentMethod === 'cash-cod' ? '#E6F9EF' : '#fff',
              borderRadius: 16,
              marginHorizontal: 12,
              marginBottom: 16,
              borderLeftWidth: selectedPaymentMethod === 'cash-cod' ? 4 : 0,
              borderLeftColor: selectedPaymentMethod === 'cash-cod' ? '#38E078' : 'transparent',
              paddingVertical: 8,
              paddingHorizontal: 12,
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 2,
              shadowOffset: { width: 0, height: 1 },
            },
          ]}
          onPress={() => handlePaymentMethodSelect('cash-cod')}
          activeOpacity={0.85}
        >
          {/* Icon */}
          <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#F7FAFA', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E3DEDE' }}>
            {/* Use a rupee icon or fallback */}
            <Ionicons name="card-outline" size={22} color="#0D1A12" />
          </View>
          {/* Texts */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#0D1A12', fontSize: 17, fontWeight: '700', fontFamily: 'Plus Jakarta Sans' }}>Pay on Delivery</Text>
            <Text style={{ color: '#827069', fontSize: 15, fontWeight: '400', marginTop: 2 }}>Pay in cash or pay online.</Text>
          </View>
          {/* Checkmark if selected */}
          {selectedPaymentMethod === 'cash-cod' && (
            <Ionicons name="checkmark" size={22} color="#38E078" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>

        {/* Promo Code Section - after all payment methods */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
        </View>
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          {/* Manual promo code entry */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <TextInput
              style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E3DEDE', backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 16 }}
              placeholder="Enter promo code"
              value={promoInput}
              onChangeText={setPromoInput}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#38E078', borderRadius: 10, paddingHorizontal: 18, height: 44, justifyContent: 'center', alignItems: 'center' }}
              onPress={handleApplyPromo}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#0D1A12', fontWeight: '700', fontSize: 15 }}>Apply</Text>
            </TouchableOpacity>
            {/* Uniform cross button to remove selected promo */}
            {selectedPromo && (
              <TouchableOpacity
                style={{ marginLeft: 0, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}
                onPress={() => { setSelectedPromo(null); setPromoInput(''); setPromoError(null); }}
                accessibilityLabel="Remove promo code"
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={22} color="#38E078" />
              </TouchableOpacity>
            )}
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
            <Text style={styles.costLabel}>Service Price</Text>
            <Text style={styles.costValue}>₹{getCostBreakdown().base}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Platform Fee</Text>
            <Text style={styles.costValue}>₹{getCostBreakdown().platform}</Text>
          </View>
          {selectedPromo && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Discount ({selectedPromo.code})</Text>
              <Text style={[styles.costValue, { color: '#38E078' }]}>-
                {selectedPromo.discount_type === 'percent'
                  ? `${selectedPromo.discount_value}%`
                  : `₹${selectedPromo.discount_value}`}
              </Text>
            </View>
          )}
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { fontWeight: '700' }]}>Final Total</Text>
            <Text style={[styles.costValue, { fontWeight: '700' }]}>₹{getCostBreakdown().finalTotal}</Text>
          </View>
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
          disabled={!isPaymentSelected || isPaying}
        >
          {isPaying ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueButtonText}>Continue</Text>}
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
