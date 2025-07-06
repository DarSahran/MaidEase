import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getUser } from '../../utils/session'; // Adjust path if needed

// Define the Booking type
interface Booking {
  id: string;
  service_name: string;
  booking_id: string;
  time: string;
  status: string;
  maid_name: string;
  eta_minutes?: number;
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function BookingCard() {
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user ID from session/auth
    const fetchUserId = async () => {
      try {
        const user = await getUser();
        setUserId(user?.id || null);
      } catch (e) {
        setUserId(null);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchActiveBooking = async () => {
      const { data, error } = await supabase
        .from('booking_history')
        .select('*')
        .eq('user_id', userId)
        .or('status.neq.completed,status.neq.cancelled')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        setActiveBooking({
          id: data.id,
          service_name: data.service_name,
          booking_id: data.id,
          time: `${data.booking_date} ${data.booking_time}`,
          status: data.status,
          maid_name: data.maid_name || '',
          eta_minutes: data.eta_minutes,
        });
      } else {
        setActiveBooking(null);
      }
    };
    fetchActiveBooking();
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('booking_history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_history' }, fetchActiveBooking)
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  if (!activeBooking) return null;

  // Format date and time for display
  const [dateStr, timeStr] = activeBooking.time.split(' ');
  const formattedDate = new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTime = timeStr ? timeStr.slice(0, 5) : '';

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.container}>
        <View style={styles.iconBox}>
          <Image
            source={require('@/assets/images/brooming-illustration.png')}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.details}>
          <Text style={styles.serviceName}>{activeBooking.service_name}</Text>
          <View style={styles.timeIconRow}>
            <Ionicons name="time-outline" size={16} color="#5C8A5C" style={{ marginRight: 4 }} />
            <Text style={styles.timeRow}>{formattedDate} · {formattedTime}</Text>
          </View>
          <Text style={styles.maidRow}>
            Maid: {activeBooking.maid_name || 'Unknown Maid'}
          </Text>
          <Text style={styles.statusRow}>Status: <Text style={{fontWeight:'700'}}>{activeBooking.status}</Text></Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    margin: 0,
    padding: 0,
  },
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 56,
    height: 56,
    backgroundColor: '#F7FCF7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  serviceName: {
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F170F',
    marginBottom: 2,
  },
  timeRow: {
    fontSize: 15,
    color: '#5C8A5C',
    marginBottom: 2,
  },
  maidRow: {
    fontSize: 15,
    color: '#5C8A5C',
    marginBottom: 2,
  },
  statusRow: {
    fontSize: 15,
    color: '#0D1A12',
    marginTop: 4,
  },
  timeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
});
