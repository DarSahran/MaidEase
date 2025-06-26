import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LogoutConfirmation() {
  const router = useRouter();

  // Confirm logout: clear all user data and go to who-are-you
  const handleConfirm = async () => {
    try {
      // Clear AsyncStorage (user cache)
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.clear();
      // Add any other cache/session clearing logic here
      router.replace('/(welcome)/who-are-you');
    } catch (e) {
      // fallback: still go to who-are-you
      router.replace('/(welcome)/who-are-you');
    }
  };

  // Cancel: go back to settings
  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="#0D1A12" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logout</Text>
        <View style={{ width: 48 }} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Are you sure you want to log out?</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F7FAFA',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#0D1A12',
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 23,
    paddingRight: 48,
  },
  body: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#F7FAFA',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0D1A12',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: 16,
    gap: 12,
  },
  confirmButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#38E078',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmText: {
    color: '#0D1A12',
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 24,
  },
  cancelButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#E8F2ED',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#0D1A12',
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 24,
  },
});
