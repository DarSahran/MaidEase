import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function BookingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>Your booking history will appear here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FCF7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D1A12',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#698273',
    textAlign: 'center',
  },
});
