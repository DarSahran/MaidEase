import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  compact?: boolean;
}

export default function SettingItem({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showArrow = false,
  compact = false 
}: SettingItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, compact && styles.compactContainer]} 
      onPress={onPress}
    >
      <View style={[styles.iconContainer, compact && styles.compactIcon]}>
        <Ionicons name={icon} size={24} color="#141414" />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#141414" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    minHeight: 72,
    gap: 16,
  },
  compactContainer: {
    minHeight: 56,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactIcon: {
    width: 40,
    height: 40,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#141414',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#737373',
    lineHeight: 21,
  },
});
