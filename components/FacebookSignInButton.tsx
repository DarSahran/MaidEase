// components/FacebookSignInButton.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';

export default function FacebookSignInButton({ onPress, disabled }: { onPress?: () => void; disabled?: boolean }) {
  // You can add Facebook sign-in logic here, for now just a placeholder
  const handlePress = () => {
    if (onPress) return onPress();
    Alert.alert('Facebook Sign-In', 'Facebook sign-in logic goes here.');
  };

  return (
    <TouchableOpacity
      style={styles.socialButton}
      disabled={disabled}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.socialButtonText}>Continue with Facebook</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    socialButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 24,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        // Shadow for Android
        elevation: 3,
    },
    socialButtonText: {
        color: '#121714',
        fontSize: 16,
        fontWeight: '600',
    },
});
