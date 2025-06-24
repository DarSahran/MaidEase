import CheckmarkCircle from '@/components/ui/CheckmarkCircle';
import { supabase } from '@/constants/supabase';
import { getUser } from '@/utils/session';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [orderData, setOrderData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch booking/payment details from Supabase
  React.useEffect(() => {
    async function fetchBooking() {
      setLoading(true);
      setError(null);
      try {
        // You can pass bookingId/orderId in params for fetching
        const bookingId = params.bookingId || params.orderId;
        if (!bookingId) {
          setOrderData(params.orderData ? JSON.parse(params.orderData as string) : {});
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();
        if (error) throw error;
        setOrderData(data);
      } catch (err: any) {
        setError('Failed to fetch booking details.');
        setOrderData(params.orderData ? JSON.parse(params.orderData as string) : {});
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, []); // Fix: Only run once on mount

  // Helper to convert time slot string (e.g. '8 PM') to 24-hour format for DB
  function parseTimeSlotTo24H(timeSlot: string): string {
    if (!timeSlot) return '10:00:00';
    const [hourStr, period] = timeSlot.split(' ');
    let hour = parseInt(hourStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:00:00`;
  }

  // Save booking to booking_history on mount
  React.useEffect(() => {
    async function saveBookingHistory() {
      if (!orderData || loading || error) return;

      // Debug: log all incoming data
      console.log('orderData:', orderData);
      // console.log('params:', params);

      // Always get user from getUser utility
      let userId = null;
      try {
        const user = await getUser();
        userId = user?.id || null;
      } catch (e) {
        console.log('getUser error:', e);
      }
      

      if (!userId) {
        setError('Booking history not saved: user_id is missing');
        console.log('Booking history not saved: user_id is missing');
        return;
      }

      // Parse orderData from params if needed
      let parsedOrderData = orderData;
      if (!orderData.user_id && params.orderData) {
        try {
          parsedOrderData = JSON.parse(Array.isArray(params.orderData) ? params.orderData[0] : params.orderData);
        } catch {}
      }

      // Extract correct values from parsedOrderData
      const serviceId = parsedOrderData.service_id || params.serviceId;
      const maidId = parsedOrderData.maid_id || params.maidId;
      const maidName = parsedOrderData.maid_name || '';
      const maidRating = parsedOrderData.maid_rating || null;
      const userRating = parsedOrderData.user_rating || null;
      const serviceName = parsedOrderData.service || '';
      const serviceType = parsedOrderData.service_type || (serviceName ? serviceName.toLowerCase() : '');
      // Parse booking date and time
      let bookingDate = dayjs().format('YYYY-MM-DD');
      if (parsedOrderData.date) {
        const parsedDate = dayjs(parsedOrderData.date);
        if (parsedDate.isValid()) bookingDate = parsedDate.format('YYYY-MM-DD');
      }
      let bookingTime = '10:00:00';
      if (parsedOrderData.time) {
        bookingTime = parseTimeSlotTo24H(parsedOrderData.time);
      }
      // Use correct total price (prefer final_total, then discounted_total, then total, then estimatedCost)
      const totalPrice =
        parsedOrderData.costs?.final_total ||
        parsedOrderData.discounted_total ||
        parsedOrderData.costs?.total ||
        parsedOrderData.estimatedCost ||
        parsedOrderData.total_price ||
        299.00;
      // Build full address from user input
      let fullAddress = '';
      if (parsedOrderData && parsedOrderData.address) {
        if (typeof parsedOrderData.address === 'string') {
          fullAddress = parsedOrderData.address;
        } else if (typeof parsedOrderData.address === 'object' && parsedOrderData.address !== null) {
          fullAddress = [
            parsedOrderData.address.houseNumber,
            parsedOrderData.address.street,
            parsedOrderData.address.city,
            parsedOrderData.address.state,
            parsedOrderData.address.pincode
          ].filter(Boolean).join(', ');
        }
      }
      const status = 'completed';
      // Fix paymentMethod: only use a short string, not a JSON string
      let paymentMethod = 'cash';
      if (parsedOrderData.payment_method) {
        paymentMethod = parsedOrderData.payment_method;
      } else if (params.paymentMethod) {
        try {
          const pm = typeof params.paymentMethod === 'string' ? JSON.parse(params.paymentMethod) : params.paymentMethod;
          paymentMethod = pm.id || pm.type || pm.title || 'cash';
        } catch {
          const pmValue = Array.isArray(params.paymentMethod) ? params.paymentMethod[0] : params.paymentMethod;
          paymentMethod = typeof pmValue === 'string' ? pmValue : 'cash';
        }
      }
      const paymentStatus = 'paid';
      const durationMinutes = parsedOrderData.duration_minutes || 60;
      const specialInstructions = parsedOrderData.special_instructions || parsedOrderData.notes || '';

      // Fetch correct service_id if missing
      let resolvedServiceId = serviceId;
      if (!resolvedServiceId && serviceName && supabase) {
        try {
          // Try by name first
          let { data: serviceRow, error: serviceError } = await supabase
            .from('services')
            .select('id')
            .eq('name', serviceName)
            .single();
          if (!serviceError && serviceRow) {
            resolvedServiceId = serviceRow.id;
          } else {
            // Try by category if name fails
            const { data: catRow, error: catError } = await supabase
              .from('services')
              .select('id')
              .eq('category', serviceType)
              .single();
            if (!catError && catRow) {
              resolvedServiceId = catRow.id;
            }
          }
        } catch (e) {
          // ignore
        }
      }

      // Ensure all required fields for booking_history are present and valid
      // Allowed service types from schema
      const allowedServiceTypes = [
        'cleaning', 'laundry', 'utensils', 'babysitting',
        'brooming', 'mopping', 'dusting', 'kitchen', 'bathroom',
        'washing-clothes', 'washing-utensils'
      ];
      // Fallbacks for required fields
      const safeServiceName = serviceName || 'Cleaning';
      let safeServiceType = serviceType || 'cleaning';
      if (!allowedServiceTypes.includes(safeServiceType)) {
        // Try to map from serviceName if possible
        const lower = safeServiceName.toLowerCase();
        safeServiceType = allowedServiceTypes.includes(lower) ? lower : 'cleaning';
      }
      const safeMaidName = maidName || 'Unknown Maid';
      const safeMaidRating = maidRating !== null && maidRating !== undefined ? maidRating : 0.0;
      const safeUserRating = userRating !== null && userRating !== undefined ? userRating : null;
      const safeFullAddress = fullAddress || 'Unknown Address';
      const safeBookingDate = bookingDate || dayjs().format('YYYY-MM-DD');
      const safeBookingTime = bookingTime || '10:00:00';
      const safeTotalPrice = totalPrice || 299.00;
      const safeDurationMinutes = durationMinutes || 60;
      const safeStatus = status || 'completed';
      const safePaymentMethod = paymentMethod || 'cash';
      const safePaymentStatus = paymentStatus || 'paid';
      const safeSpecialInstructions = specialInstructions || '';
      // service_id, maid_id, user_id must be valid UUIDs or null
      const safeServiceId = resolvedServiceId || null;
      const safeMaidId = maidId || null;
      const safeUserId = userId || null;
      // service_details: always a valid object
      let serviceDetails: any = {};
      switch (safeServiceType) {
        case 'mopping':
          serviceDetails = {
            moppingType: parsedOrderData.moppingType || '',
            disinfectant: parsedOrderData.disinfectant || '',
            mopProvider: parsedOrderData.mopProvider || parsedOrderData.broomProvider || '',
            selectedRooms: parsedOrderData.rooms || [],
            notes: parsedOrderData.notes || ''
          };
          break;
        case 'brooming':
          serviceDetails = {
            broomProvider: parsedOrderData.broomProvider || '',
            selectedRooms: parsedOrderData.rooms || [],
            notes: parsedOrderData.notes || ''
          };
          break;
        case 'dusting':
          serviceDetails = {
            selectedRooms: parsedOrderData.rooms || [],
            notes: parsedOrderData.notes || ''
          };
          break;
        case 'kitchen':
          serviceDetails = {
            kitchenSize: parsedOrderData.kitchenSize || '',
            appliances: parsedOrderData.appliances || [],
            greaseLevel: parsedOrderData.greaseLevel || '',
            materialProvider: parsedOrderData.materialProvider || '',
            notes: parsedOrderData.notes || ''
          };
          break;
        case 'bathroom':
          serviceDetails = {
            bathroomType: parsedOrderData.bathroomType || '',
            materialProvider: parsedOrderData.materialProvider || '',
            notes: parsedOrderData.notes || ''
          };
          break;
        case 'washing-clothes':
          serviceDetails = {
            loadType: parsedOrderData.loadType || '',
            detergentType: parsedOrderData.detergentType || '',
            materialProvider: parsedOrderData.materialProvider || '',
            notes: parsedOrderData.notes || ''
          };
          break;
        case 'washing-utensils':
          serviceDetails = {
            utensilsType: parsedOrderData.utensilsType || '',
            materialProvider: parsedOrderData.materialProvider || '',
            notes: parsedOrderData.notes || ''
          };
          break;
        case 'babysitting':
          serviceDetails = {
            notes: parsedOrderData.notes || ''
          };
          break;
        default:
          serviceDetails = {
            notes: parsedOrderData.notes || ''
          };
      }
      // Remove undefined/null fields but keep empty string/array
      serviceDetails = Object.fromEntries(
        Object.entries(serviceDetails).filter(([_, v]) => v !== undefined && v !== null)
      );
      // Ensure service is never null or empty
      const safeService = safeServiceName || 'Cleaning';

      try {
        const { data, error: insertError } = await supabase.from('booking_history').insert([
          {
            user_id: safeUserId,
            service_id: safeServiceId,
            maid_id: safeMaidId,
            service_name: safeServiceName,
            service_type: safeServiceType,
            booking_date: safeBookingDate,
            booking_time: safeBookingTime,
            duration_minutes: safeDurationMinutes,
            status: safeStatus,
            total_price: safeTotalPrice,
            maid_name: safeMaidName,
            maid_rating: safeMaidRating,
            user_rating: safeUserRating,
            full_address: safeFullAddress,
            special_instructions: safeSpecialInstructions,
            payment_method: safePaymentMethod,
            payment_status: safePaymentStatus,
            service_details: serviceDetails
          }
        ]).select();
        if (insertError) throw insertError;
        console.log('Booking history saved:');
      } catch (err) {
        setError('Failed to save booking history.');
        console.log('Failed to save booking history:', err);
      }
    }
    saveBookingHistory();
  }, [orderData, loading, error]);

  // Format address for display
  let addressString = '123 Maple Street, Anytown';
  if (orderData && orderData.address) {
    if (typeof orderData.address === 'string') {
      addressString = orderData.address;
    } else if (typeof orderData.address === 'object' && orderData.address !== null) {
      addressString = [
        orderData.address.houseNumber,
        orderData.address.street,
        orderData.address.city,
        orderData.address.state,
        orderData.address.pincode
      ].filter(Boolean).join(', ');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.replace('/welcome')}>
          <Ionicons name="close" size={24} color="#0F170F" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Payment Successful</Text>
        </View>
      </View>

      {/* Checkmark and Title */}
      <View style={styles.centerContent}>
        <CheckmarkCircle width={120} height={120} />
        <Text style={styles.bigTitle}>Payment Successful</Text>
        <Text style={styles.subtitle}>Your payment has been successfully processed.</Text>
      </View>

      {/* Booking Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.detailsTitle}>Booking Details</Text>
        <View style={styles.detailRow}>
          <View style={styles.detailColLabel}><Text style={styles.detailLabel}>Date</Text></View>
          <View style={styles.detailColValue}><Text style={styles.detailValue}>{orderData?.date ? dayjs(orderData.date).format('MMMM D, YYYY') : 'July 20, 2024'}</Text></View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailColLabel}><Text style={styles.detailLabel}>Time</Text></View>
          <View style={styles.detailColValue}><Text style={styles.detailValue}>{orderData?.time || '10:00 AM'}</Text></View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailColLabel}><Text style={styles.detailLabel}>Service</Text></View>
          <View style={styles.detailColValue}><Text style={styles.detailValue}>{orderData?.service || 'Standard Cleaning'}</Text></View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailColLabel}><Text style={styles.detailLabel}>Address</Text></View>
          <View style={styles.detailColValue}><Text style={styles.detailValue}>{addressString}</Text></View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.replace('/(main)/service/real-time-tracking')}>
          <Text style={styles.actionButtonText}>Track Maid</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => router.replace('../(main)')}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    justifyContent: 'flex-start',
  },
  headerIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    height: 23,
    paddingRight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F170F',
    textAlign: 'center',
    lineHeight: 23,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  bigTitle: {
    fontSize: 28,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F170F',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 35,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#0F170F',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 24,
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E8EB',
    borderBottomWidth: 0,
  },
  detailsTitle: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F170F',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#E5E8EB',
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  detailColLabel: {
    width: 100,
  },
  detailColValue: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#5C8A5C',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    lineHeight: 21,
  },
  detailValue: {
    fontSize: 14,
    color: '#0F170F',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    lineHeight: 21,
  },
  actionsSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#38E078',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    minWidth: 84,
    maxWidth: 480,
    alignSelf: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F170F',
    lineHeight: 24,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#DEE3E0',
  },
  secondaryButtonText: {
    color: '#0F170F',
  },
});
