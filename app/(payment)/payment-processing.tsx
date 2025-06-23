import { supabase } from '@/constants/supabase';
import { getUser } from '@/utils/session';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderData = params.orderData ? JSON.parse(params.orderData as string) : {};
  const paymentMethod = params.paymentMethod ? JSON.parse(params.paymentMethod as string) : {};

  // Animation state: 0 = nothing, 1 = spinner, 2 = checkmark
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    setStage(1); // Show spinner after mount
    const spinnerTimeout = setTimeout(() => setStage(2), 1200); // Show checkmark after 1.2s
    const saveAndGo = async () => {
      // Save booking to Supabase
      try {
        const user = await getUser();
        const userId = user?.id;
        if (userId) {
          const serviceDetails = {
            moppingType: orderData.moppingType,
            disinfectant: orderData.disinfectant,
            mopProvider: orderData.broomProvider,
            selectedRooms: orderData.rooms,
            notes: orderData.notes
          };
          await supabase.from('booking_history').insert([
            {
              user_id: userId,
              service_id: orderData.service_id || null,
              service_name: orderData.service || '',
              service_type: orderData.service_type || '',
              booking_date: orderData.date ? orderData.date.split('T')[0] : null,
              booking_time: orderData.time || null,
              duration_minutes: orderData.duration_minutes || 60,
              status: 'completed',
              total_price: orderData.costs?.final_total || orderData.costs?.total || orderData.estimatedCost || 0,
              maid_name: orderData.maidName || '',
              full_address: [orderData.address?.houseNumber, orderData.address?.street, orderData.address?.city, orderData.address?.state, orderData.address?.pincode].filter(Boolean).join(', '),
              special_instructions: orderData.notes || null,
              service_details: serviceDetails,
              payment_method: paymentMethod?.id || paymentMethod?.type || paymentMethod?.title || 'cash',
              payment_status: 'paid'
            }
          ]);
        }
      } catch (e) {
        // ignore
      }
      setStage(2);
      setTimeout(() => {
        router.replace({
          pathname: '/(payment)/payment-success',
          params: {
            orderData: JSON.stringify(orderData),
            paymentMethod: JSON.stringify(paymentMethod),
            promoCode: params.promoCode || '',
          }
        });
      }, 1000);
    };
    const successTimeout = setTimeout(saveAndGo, 1200);
    return () => {
      clearTimeout(spinnerTimeout);
      clearTimeout(successTimeout);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#0F170F" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={{ width: 200, height: 200, marginBottom: 32, justifyContent: 'center', alignItems: 'center' }}>
          {stage === 0 ? null : stage === 1 ? (
            <Ionicons name="time-outline" size={120} color="#38E078" />
          ) : (
            // CheckmarkCircle is your SVG component
            <Ionicons name="checkmark-circle" size={120} color="#38E078" />
          )}
        </View>
        
        <Text style={styles.title}>Processing payment</Text>
        <Text style={styles.subtitle}>
          Please wait while we process your payment. This may take a few moments.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.seriousNoteTitle}>⚠️ Do Not Close or Cancel</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F170F',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#0F170F',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  seriousNoteTitle: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '800',
    color: '#B00020',
    backgroundColor: '#FDEDED',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  seriousNoteDesc: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    color: '#B00020',
    backgroundColor: '#FDEDED',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    textAlign: 'center',
    lineHeight: 20,
  },
});