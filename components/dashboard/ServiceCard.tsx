import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap; // This ensures valid icon names
  };
  onPress: () => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={service.icon} size={24} color="#0D1C0D" />
      </View>
      <Text style={styles.serviceName}>{service.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    padding: 16,
    backgroundColor: '#F7FCF7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1E8D1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#0D1C0D',
    lineHeight: 20,
  },
});
