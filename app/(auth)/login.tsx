import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            <Text style={styles.headerTitleBold}>MaidEasy</Text>
          </Text>
        </View>

        <Text style={styles.welcome}>Welcome back</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#638770"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#638770"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>

        <Text style={styles.or}>Or</Text>

        {/* Social Buttons */}
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Signup Link at the bottom */}
      <View style={styles.signupBottomContainer}>
        <Text style={styles.signupText}>
          Don't have an account?{' '}
          <Text
            style={styles.signupLink}
            onPress={() => router.push('/(auth)/signup')}
          >
            Sign up
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, justifyContent: 'flex-start' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    zIndex: 10,
  },
  backIcon: {
    fontSize: 26,
    color: '#121714',
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    color: '#121714',
    fontWeight: '700',
  },
  headerTitleBold: {
    fontWeight: 'bold',
    fontSize: 32, // Increased font size for MaidEasy
    color: '#121714',
  },
  welcome: {
    fontSize: 22, // Smaller font size for Welcome back
    fontWeight: 'bold', // Make it bold
    color: '#121714',
    marginBottom: 20,
    textAlign: 'left', // Align left
    marginTop: 4,
    marginLeft: 4, // Add a little left margin for spacing
  },
  inputContainer: { marginBottom: 12 },
  input: { height: 56, backgroundColor: '#F0F5F2', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#222' },
  forgot: { color: '#638770', fontSize: 14, marginBottom: 12, textAlign: 'right' },
  loginButton: { backgroundColor: '#38E078', borderRadius: 24, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loginButtonText: { color: '#121714', fontSize: 16, fontWeight: '700' },
  or: { textAlign: 'center', color: '#638770', fontSize: 14, marginVertical: 12 },
  socialButton: { backgroundColor: '#F0F5F2', borderRadius: 20, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  socialButtonText: { color: '#121714', fontSize: 14, fontWeight: '700' },
  signupText: { color: '#638770', fontSize: 14, textAlign: 'center', marginTop: 16 },
  signupLink: {
    color: '#38E078',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  signupBottomContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    width: '100%',
    alignItems: 'center',
  },
});
