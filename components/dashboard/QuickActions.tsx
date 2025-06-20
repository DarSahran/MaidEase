import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

const quickActions = [
  'Rebook Kitchen Cleaning',
  'Schedule Weekly Dusting',
  'Book Deep Bathroom Clean',
  'Request Fridge Organization',
  'Order Post-Party Cleanup',
  'Book Elderly Care',
  'Schedule Carpet Cleaning',
  'Request Balcony Maintenance',
  'Book Wardrobe Organization',
  'Schedule Monthly Deep Clean',
];

export default function QuickActions() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {quickActions.map((action, index) => (
        <TouchableOpacity key={index} style={styles.actionButton}>
          <Text style={styles.actionText}>{action}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  content: {
    gap: 12,
    paddingHorizontal: 4,
  },
  actionButton: {
    backgroundColor: '#E8F2E8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#0D1C0D',
    lineHeight: 21,
  },
});
