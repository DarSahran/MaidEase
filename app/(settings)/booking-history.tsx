import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../constants/supabase';
import { getUser } from '../../utils/session';

const homeServices = [
  { id: 'brooming', name: 'Brooming', icon: 'brush-outline' },
  { id: 'mopping', name: 'Mopping', icon: 'water-outline' },
  { id: 'dusting', name: 'Dusting', icon: 'sparkles-outline' },
  { id: 'kitchen', name: 'Kitchen Cleaning', icon: 'restaurant-outline' },
  { id: 'bathroom', name: 'Bathroom Cleaning', icon: 'home-outline' },
  { id: 'babysitting', name: 'Babysitting', icon: 'happy-outline' },
  { id: 'washing-clothes', name: 'Washing Clothes', icon: 'shirt-outline' },
  { id: 'washing-utensils', name: 'Washing Utensils', icon: 'download-outline' },
];

export default function BookingHistory() {
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState('newest');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  // Combine filters into a single modal
  const [filtersModal, setFiltersModal] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const user = await getUser();
        if (!user || !user.id) {
          setError('User not found.');
          setLoading(false);
          return;
        }
        let query = supabase
          .from('booking_history')
          .select('*')
          .eq('user_id', user.id);
        if (selectedServiceTypes.length > 0) {
          query = query.in('service_type', selectedServiceTypes);
        }
        // Date range filter
        if (dateFrom && dateTo) {
          query = query.gte('booking_date', dateFrom.toISOString().slice(0, 10)).lte('booking_date', dateTo.toISOString().slice(0, 10));
        }
        // Sorting
        if (selectedSort === 'newest') {
          query = query.order('booking_date', { ascending: false }).order('booking_time', { ascending: false });
        } else if (selectedSort === 'price') {
          query = query.order('total_price', { ascending: false });
        } else if (selectedSort === 'rating') {
          query = query.order('maid_rating', { ascending: false });
        }
        query = query.limit(10); // Only fetch top 10
        const { data, error } = await query;
        if (error) {
          setError(error.message);
        } else {
          setBookings(data || []);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch bookings.');
      }
      setLoading(false);
    })();
  }, [selectedServiceTypes, selectedSort, dateFrom, dateTo]);

  // Custom calendar component
  function CalendarPicker({ value, onChange, color }: { value: Date | null, onChange: (date: Date) => void, color?: string }) {
    const [month, setMonth] = useState(() => value ? new Date(value) : new Date());
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const today = new Date();
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    const days: (Date | null)[] = Array(firstDay).fill(null).concat(
      Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))
    );
    return (
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 240, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><Text style={{ fontSize: 18, color: color || '#38E078' }}>{'<'}</Text></TouchableOpacity>
          <Text style={{ fontWeight: 'bold', color: '#0F1A12' }}>{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
          <TouchableOpacity onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Text style={{ fontSize: 18, color: color || '#38E078' }}>{'>'}</Text></TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', width: 240, justifyContent: 'space-between', marginBottom: 4 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => <Text key={i} style={{ width: 32, textAlign: 'center', color: '#737373', fontWeight: 'bold' }}>{d}</Text>)}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 240 }}>
          {days.map((date, i) => date ? (
            <TouchableOpacity
              key={i}
              style={{
                width: 32, height: 32, borderRadius: 16, margin: 2, justifyContent: 'center', alignItems: 'center',
                backgroundColor: value && isSameDay(date, value) ? (color || '#38E078') : 'transparent',
                borderWidth: today.getMonth() === date.getMonth() && isSameDay(date, today) ? 1 : 0,
                borderColor: '#38E078',
              }}
              onPress={() => onChange(date)}
            >
              <Text style={{ color: value && isSameDay(date, value) ? '#fff' : '#0F1A12', fontWeight: 'bold' }}>{date.getDate()}</Text>
            </TouchableOpacity>
          ) : <View key={i} style={{ width: 32, height: 32, margin: 2 }} />)}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0F1A12" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking History</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Filters - single button */}
        <Text style={styles.sectionTitle}>Filters</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBox} onPress={() => setFiltersModal(true)}>
            <Ionicons name="options-outline" size={20} color="#598C6E" style={{ marginRight: 8 }} />
            <Text style={styles.filterText}>
              {selectedServiceTypes.length > 0 || dateFrom || dateTo ? 'Edit Filters' : 'Add Filters'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Filters Modal (bottom sheet style) */}
        <Modal visible={filtersModal} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, minHeight: 350 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 18, textAlign: 'center' }}>Filters</Text>
              {/* Service Type */}
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Service Type</Text>
              <FlatList
                data={homeServices}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                  const selected = selectedServiceTypes.includes(item.id);
                  return (
                    <TouchableOpacity
                      style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 8,
                        borderRadius: 10,
                        backgroundColor: selected ? '#E8F2ED' : '#fff',
                        marginRight: 8,
                        minWidth: 72,
                      }}
                      onPress={() => {
                        setSelectedServiceTypes(prev =>
                          prev.includes(item.id)
                            ? prev.filter(id => id !== item.id)
                            : [...prev, item.id]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name={item.icon as any} size={28} color={selected ? '#38E078' : '#598C6E'} style={{ marginBottom: 4 }} />
                      <Text style={{ fontSize: 13, color: '#0F1A12', textAlign: 'center' }}>{item.name}</Text>
                      {selected && <Ionicons name="checkmark-circle" size={18} color="#38E078" style={{ marginTop: 2 }} />}
                    </TouchableOpacity>
                  );
                }}
                style={{ marginBottom: 16 }}
              />
              {/* Date Range */}
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Date Range</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: '#F7FAFA', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D4E3D9' }}
                  onPress={() => setShowDatePicker('from')}
                >
                  <Text style={{ color: '#598C6E', fontWeight: 'bold' }}>From</Text>
                  <Text style={{ color: '#0F1A12', fontSize: 15, marginTop: 2 }}>{dateFrom ? dateFrom.toLocaleDateString() : 'Select'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: '#F7FAFA', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D4E3D9' }}
                  onPress={() => setShowDatePicker('to')}
                >
                  <Text style={{ color: '#598C6E', fontWeight: 'bold' }}>To</Text>
                  <Text style={{ color: '#0F1A12', fontSize: 15, marginTop: 2 }}>{dateTo ? dateTo.toLocaleDateString() : 'Select'}</Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <CalendarPicker
                  value={showDatePicker === 'from' ? dateFrom : dateTo}
                  onChange={date => {
                    if (showDatePicker === 'from') setDateFrom(date);
                    else setDateTo(date);
                    setShowDatePicker(null);
                  }}
                  color="#38E078"
                />
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: '#F7FAFA', borderRadius: 10, padding: 12, alignItems: 'center' }}
                  onPress={() => { setSelectedServiceTypes([]); setDateFrom(null); setDateTo(null); setFiltersModal(false); }}
                >
                  <Text style={{ color: '#38E078', fontWeight: 'bold' }}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: '#38E078', borderRadius: 10, padding: 12, alignItems: 'center' }}
                  onPress={() => setFiltersModal(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Sort By */}
        <Text style={styles.sectionTitle}>Sort By</Text>
        <View style={styles.sortRow}>
          {[
            { label: 'Newest to Oldest', value: 'newest' },
            { label: 'Price', value: 'price' },
            { label: 'Maid Rating', value: 'rating' },
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortButton,
                selectedSort === option.value && styles.sortButtonActive,
              ]}
              onPress={() => setSelectedSort(option.value)}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  selectedSort === option.value && styles.sortButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Filters Chips */}
        {(selectedServiceTypes.length > 0 || (dateFrom && dateTo)) && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 8 }}>
            {selectedServiceTypes.map(serviceId => (
              <View key={serviceId} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F2ED', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 4, marginBottom: 4 }}>
                <Ionicons name={homeServices.find(s => s.id === serviceId)?.icon as any} size={16} color="#38E078" style={{ marginRight: 4 }} />
                <Text style={{ color: '#0F1A12', fontSize: 13 }}>{homeServices.find(s => s.id === serviceId)?.name}</Text>
                <TouchableOpacity onPress={() => setSelectedServiceTypes(prev => prev.filter(id => id !== serviceId))} style={{ marginLeft: 6 }}>
                  <Ionicons name="close-circle" size={16} color="#38E078" />
                </TouchableOpacity>
              </View>
            ))}
            {dateFrom && dateTo && (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F2ED', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Ionicons name="calendar-outline" size={16} color="#38E078" style={{ marginRight: 4 }} />
                <Text style={{ color: '#0F1A12', fontSize: 13 }}>{dateFrom.toLocaleDateString()} - {dateTo.toLocaleDateString()}</Text>
                <TouchableOpacity onPress={() => { setDateFrom(null); setDateTo(null); }} style={{ marginLeft: 6 }}>
                  <Ionicons name="close-circle" size={16} color="#38E078" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Bookings List */}
        <Text style={styles.sectionTitle}>Bookings</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#38E078" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 32 }}>{error}</Text>
        ) : bookings.length === 0 ? (
          <Text style={{ color: '#737373', textAlign: 'center', marginTop: 32 }}>No bookings found.</Text>
        ) : (
          bookings.map(booking => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name={homeServices.find(s => s.id === booking.service_type)?.icon as any || 'home-outline'} size={24} color="#0F1A12" />
                </View>
                <View>
                  <Text style={styles.bookingService}>{booking.service_name}</Text>
                  <Text style={styles.bookingDate}>{booking.booking_date ? `${new Date(booking.booking_date).toLocaleDateString()} · ${booking.booking_time?.slice(0,5)}` : ''}</Text>
                  <Text style={styles.bookingDate}>Maid: {booking.maid_name} | ₹{booking.total_price}</Text>
                  <Text style={styles.bookingDate}>Status: {booking.status}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F1A12',
    textAlign: 'center',
    lineHeight: 23,
  },
  sectionTitle: {
    color: '#0F1A12',
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 23,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 56,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4E3D9',
    paddingLeft: 15,
    paddingRight: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterText: {
    color: '#598C6E',
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    lineHeight: 24,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  sortButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4E3D9',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    marginRight: 8,
    marginBottom: 8,
  },
  sortButtonActive: {
    backgroundColor: '#E8F2ED',
    borderColor: '#38E078',
  },
  sortButtonText: {
    color: '#0F1A12',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    lineHeight: 21,
  },
  sortButtonTextActive: {
    color: '#0F1A12',
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingVertical: 8,
    paddingHorizontal: 0,
    minHeight: 72,
  },
  bookingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    paddingLeft: 0,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#E8F2ED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingService: {
    color: '#0F1A12',
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    lineHeight: 24,
  },
  bookingDate: {
    color: '#598C6E',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    lineHeight: 21,
  },
});
