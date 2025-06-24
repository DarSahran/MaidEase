import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrderSummary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showPlatformFeeInfo, setShowPlatformFeeInfo] = useState(false);
  const [kitchenServiceId, setKitchenServiceId] = useState<string | null>(null);
  
  // Parse booking data from previous screen
  const bookingData = params.bookingData ? JSON.parse(params.bookingData as string) : {};

  // Helper: format address for display
  const getAddressText = () => {
    const addr = bookingData.address || {};
    if (!addr) return 'Not Provided';
    let out = '';
    if (addr.houseNumber) out += addr.houseNumber + ', ';
    if (addr.street) out += addr.street + ', ';
    if (addr.city) out += addr.city + ', ';
    if (addr.state) out += addr.state + ' - ';
    if (addr.pincode) out += addr.pincode;
    return out.trim().replace(/, $/, '');
  };

  // Helper: format date
  const getDateText = () => {
    if (!bookingData.date) return 'Not Provided';
    const d = new Date(bookingData.date);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' });
  };

  // Helper: format time
  const getTimeText = () => bookingData.time || 'Not Provided';

  // Kitchen-specific helpers
  const getKitchenSizeText = () => bookingData.kitchenSize || 'Not Provided';
  const getAppliancesText = () => {
    if (!bookingData.appliances || !bookingData.appliances.length) return 'Not Provided';
    return bookingData.appliances.join(', ');
  };
  const getGreaseLevelText = () => bookingData.greaseLevel || 'Not Provided';
  const getMaterialProviderText = () => bookingData.materialProvider === 'maid' ? 'Maid' : 'User';

  // Pricing logic (match kitchen/index.tsx)
  const calculateCosts = () => {
    const { estimatedCost } = bookingData;
    let basePrice = typeof estimatedCost === 'number' ? estimatedCost : 100;
    // Platform fee fixed at ₹8
    const platformFeeBase = 8;
    // GST on platform fee
    const gst = Math.round(platformFeeBase * 0.18);
    // Show as one combined fee
    const platformFee = platformFeeBase + gst;
    const total = basePrice + platformFee;
    return {
      basePrice,
      platformFee,
      total
    };
  };

  const costs = calculateCosts();

  // Supabase client setup
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  // Fetch the service_id for Kitchen Cleaning on mount
  useEffect(() => {
    const fetchKitchenServiceId = async () => {
      if (supabase) {
        const { data, error } = await supabase
          .from('services')
          .select('id')
          .eq('category', 'kitchen')
          .single();
        if (data && data.id) setKitchenServiceId(data.id);
      }
    };
    fetchKitchenServiceId();
  }, [supabase]);

  const handleProceedToPayment = async () => {
    // Prepare service_details JSON
    const serviceDetails = {
      kitchenSize: bookingData.kitchenSize || '',
      appliances: bookingData.appliances || [],
      greaseLevel: bookingData.greaseLevel || '',
      materialProvider: bookingData.materialProvider || '',
      notes: bookingData.notes || ''
    };
    // Insert booking into Supabase
    const resolvedServiceId = kitchenServiceId || (bookingData.serviceId && bookingData.serviceId !== '' ? bookingData.serviceId : null);
    if (supabase) {
      await supabase.from('booking_history').insert([
        {
          user_id: bookingData.userId,
          service_id: resolvedServiceId,
          maid_id: bookingData.maidId && bookingData.maidId !== '' ? bookingData.maidId : null,
          service_name: 'Kitchen',
          service_type: 'kitchen',
          booking_date: bookingData.date ? bookingData.date.split('T')[0] : null,
          booking_time: bookingData.time || null,
          duration_minutes: bookingData.duration_minutes || 60,
          status: 'scheduled',
          total_price: costs.total,
          maid_name: bookingData.maidName || '',
          maid_rating: bookingData.maidRating || 0,
          user_rating: bookingData.userRating || 0,
          full_address: getAddressText(),
          special_instructions: bookingData.notes || null,
          service_details: serviceDetails,
          payment_method: 'cash',
          payment_status: 'pending'
        }
      ]);
    }
    router.push({
      pathname: '../(payment)/payment',
      params: {
        orderData: JSON.stringify({
          ...bookingData,
          service_id: kitchenServiceId || bookingData.serviceId || '6d2fd146-9824-4928-a848-1aa0cb8bdc19',
          service: 'Kitchen',
          service_type: 'kitchen',
          service_details: serviceDetails,
          costs,
          orderId: `ORD${Date.now()}`
        })
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0F1A14" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Order Summary</Text>
          </View>
        </View>

        {/* Service Details Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Service Details</Text>
        </View>

        {/* Kitchen Size */}
        <View style={styles.serviceRow}>
          <View style={styles.serviceIcon}>
            <Ionicons name="resize-outline" size={24} color="#0F1A14" />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>Kitchen Size</Text>
            <Text style={styles.serviceDescription}>{getKitchenSizeText()}</Text>
          </View>
        </View>

        {/* Appliances */}
        <View style={styles.serviceRow}>
          <View style={styles.serviceIcon}>
            <Ionicons name="cube-outline" size={24} color="#0F1A14" />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>Appliances</Text>
            <Text style={styles.serviceDescription}>{getAppliancesText()}</Text>
          </View>
        </View>

        {/* Grease Level */}
        <View style={styles.serviceRow}>
          <View style={styles.serviceIcon}>
            <Ionicons name="flame-outline" size={24} color="#0F1A14" />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>Grease Level</Text>
            <Text style={styles.serviceDescription}>{getGreaseLevelText()}</Text>
          </View>
        </View>

        {/* Material Provider */}
        <View style={styles.serviceRow}>
          <View style={styles.serviceIcon}>
            <Ionicons name="person-outline" size={24} color="#0F1A14" />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>Material Provider</Text>
            <Text style={styles.serviceDescription}>{getMaterialProviderText()}</Text>
          </View>
        </View>

        {/* Notes */}
        {bookingData.notes && (
          <View style={styles.notesRow}>
            <View style={styles.serviceIcon}>
              <Ionicons name="document-text-outline" size={24} color="#0D1A12" />
            </View>
            <View style={styles.serviceDetails}>
              <Text style={styles.serviceName}>Notes</Text>
              <Text style={styles.notesText}>{bookingData.notes}</Text>
            </View>
          </View>
        )}

        {/* Schedule Details Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Schedule Details</Text>
        </View>

        {/* Date */}
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleIcon}>
            <Ionicons name="calendar-outline" size={24} color="#0F1A14" />
          </View>
          <Text style={styles.scheduleText}>Date: {getDateText()}</Text>
        </View>

        {/* Time */}
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleIcon}>
            <Ionicons name="time-outline" size={24} color="#0F1A14" />
          </View>
          <Text style={styles.scheduleText}>Time Slot: {getTimeText()}</Text>
        </View>

        {/* Location */}
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleIcon}>
            <Ionicons name="location-outline" size={24} color="#0F1A14" />
          </View>
          <Text style={styles.scheduleText}>Location: {getAddressText()}</Text>
        </View>

        {/* Cost Summary Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cost Summary</Text>
        </View>

        <View style={styles.costSection}>
          {/* Base Price */}
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Service Price</Text>
            <Text style={styles.costValue}>₹{costs.basePrice}</Text>
          </View>
          {/* Platform Fee (incl. GST) with info icon */}
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>
              Platform Fee <Text style={{fontSize:10, color:'#888', verticalAlign:'top'}}>
                <TouchableOpacity onPress={() => setShowPlatformFeeInfo(true)}>
                  <View style={{marginLeft:2, marginRight:2, alignItems:'center', justifyContent:'center', width:16, height:16, borderRadius:8, backgroundColor:'#E8F2ED'}}>
                    <Text style={{fontSize:12, color:'#38E078', fontWeight:'bold'}}>?</Text>
                  </View>
                </TouchableOpacity>
              </Text>
              (incl. GST)
            </Text>
            <Text style={styles.costValue}>₹{costs.platformFee}</Text>
          </View>
          {/* Total */}
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Total</Text>
            <Text style={styles.costValue}>₹{costs.total}</Text>
          </View>
        </View>
        {/* Platform Fee Info Modal */}
        {showPlatformFeeInfo && (
          <View style={{position:'absolute', top:120, left:30, right:30, backgroundColor:'#fff', borderRadius:12, padding:18, elevation:8, shadowColor:'#000', shadowOpacity:0.1}}>
            <Text style={{fontWeight:'bold', fontSize:16, marginBottom:6}}>Platform Fee Breakdown</Text>
            <Text style={{fontSize:15, marginBottom:2}}>Platform Fee: ₹8</Text>
            <Text style={{fontSize:15, marginBottom:10}}>GST (18%): ₹{Math.round(8*0.18)}</Text>
            <TouchableOpacity style={{alignSelf:'flex-end', marginTop:4}} onPress={() => setShowPlatformFeeInfo(false)}>
              <Text style={{color:'#38E078', fontWeight:'bold', fontSize:15}}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.proceedButton, !kitchenServiceId && { opacity: 0.5 }]}
          onPress={handleProceedToPayment}
          disabled={!kitchenServiceId}
        >
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By booking, you agree to our Terms and Conditions
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
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
    color: '#0F1A14',
    lineHeight: 23,
  },
  sectionHeader: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F1A14',
    lineHeight: 28,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    minHeight: 72,
    gap: 16,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#E8F2ED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#0F1A14',
    lineHeight: 24,
  },
  serviceDescription: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#598C6E',
    lineHeight: 21,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7FAFA',
    minHeight: 72,
    gap: 16,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#52946B',
    lineHeight: 24,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    minHeight: 56,
    gap: 16,
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F2ED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#0F1A14',
    lineHeight: 24,
  },
  costSection: {
    padding: 16,
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
  },
  proceedButton: {
    height: 48,
    backgroundColor: '#38E078',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  proceedButtonText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F1A14',
    lineHeight: 24,
  },
  termsText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0D1A12',
    lineHeight: 24,
    textAlign: 'center',
    paddingTop: 4,
    paddingBottom: 12,
  },
});
