import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function BookingCard() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/brooming-illustration.png')}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.details}>
        <Text style={styles.serviceName}>Brooming</Text>
        <Text style={styles.bookingId}>Booking ID: #12345</Text>
        <Text style={styles.time}>Today, 2:00 PM</Text>
        <Text style={styles.status}>Maid Kavita arriving in 25 minutes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 167,
    height: 140,
    borderRadius: 12,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0F170F',
    lineHeight: 20,
  },
  bookingId: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    color: '#5C8A5C',
    lineHeight: 21,
  },
  time: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    color: '#5C8A5C',
    lineHeight: 21,
  },
  status: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#0D1A12',
    lineHeight: 24,
    marginTop: 16,
  },
});
