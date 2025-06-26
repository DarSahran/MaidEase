import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FacebookSignInButton from '../../components/FacebookSignInButton';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { supabase } from '../../constants/supabase';
import { saveUser } from '../../utils/session';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [locationPermissionError, setLocationPermissionError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    } else if (!email.includes('@')) {
      setEmailError('Enter a valid email address');
      return;
    } else {
      setEmailError('');
    }
    setSaving(true);
    setLoginError('');
    // Check if user exists
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    setSaving(false);
    if (error && error.code === 'PGRST116') { // Not found
      // Redirect to signup with prefilled email
      router.push({ pathname: '/(auth)/signup', params: { email } });
      return;
    }
    if (error) {
      setLoginError('Error: ' + error.message);
      return;
    }
    if (data && data.password === password) {
      setLoginError('');
      await saveUser(data);
      // Immediately navigate to main page
      router.replace('../(main)');
      // In the background, get user's city and update Supabase
      (async () => {
        try {
          const OPENCAGE_API_KEY = process.env.EXPO_PUBLIC_OPENCAGE_API_KEY || process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
          if (!OPENCAGE_API_KEY) return;
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;
          let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
          if (!location || !location.coords || !location.coords.latitude || !location.coords.longitude) return;
          const { latitude, longitude } = location.coords;
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
          );
          const geoData = await response.json();
          let userCity = '';
          if (geoData.results && geoData.results[0]) {
            const result = geoData.results[0].components;
            userCity = result.city || result.town || result.village || result.county || result.state || result.country || '';
          }
          await supabase.from('users').update({ last_login: new Date().toISOString(), last_login_city: userCity }).eq('id', data.id);
        } catch (e) {
          // Silently fail, do not block user
          console.log('Background location update error:', e);
        }
      })();
      // router.push('/(main)/dashboard');
    } else {
      setLoginError('Incorrect password.');
      console.log('Incorrect password.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(welcome)/who-are-you')}
          >
            <Text style={styles.backIcon}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            <Text style={styles.headerTitleBold}>MaidEase</Text>
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
            onChangeText={text => { setEmail(text); setEmailError(''); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
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
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={saving}>
          <Text style={styles.loginButtonText}>{saving ? 'Logging in...' : 'Log in'}</Text>
        </TouchableOpacity>
        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

        <Text style={styles.or}>Or</Text>

        {/* Social Buttons */}
        <GoogleSignInButton />
        <FacebookSignInButton />
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
