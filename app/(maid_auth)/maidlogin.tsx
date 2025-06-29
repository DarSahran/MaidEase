import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FacebookSignInButton from '../../components/FacebookSignInButton';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { supabase } from '../../constants/supabase';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone) {
      setPhoneError('Phone number is required');
      return;
    } else if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Enter a valid 10-digit phone number');
      return;
    } else {
      setPhoneError('');
    }

    setSaving(true);
    setLoginError('');

    const { data, error } = await supabase
      .from('maids')
      .select('id')
      .eq('mobile', phone)
      .single();

    setSaving(false);

    if (error && error.code === 'PGRST116') {
      // Maid not found — redirect to signup
      router.push({
        pathname: '/(maid_auth)/maidsignup',
        params: { phone }
      });
      return;
    }

    if (error) {
      setLoginError('Error: ' + error.message);
      return;
    }

    if (data) {
      // Maid found — redirect to OTP Verification
      router.push({
        pathname: '/(maid_auth)/otp-verification1',
        params: { phone }
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#8A8A8A"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setPhoneError('');
            }}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={saving}
        >
          <Text style={styles.loginButtonText}>
            {saving ? 'Logging in...' : 'Log in'}
          </Text>
        </TouchableOpacity>

        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

        <Text style={styles.or}>Or</Text>

        <GoogleSignInButton />
        <FacebookSignInButton />
      </ScrollView>

      {/* Signup Link */}
      <View style={styles.signupBottomContainer}>
        <Text style={styles.signupText}>
          Don't have an account?{' '}
          <Text
            style={styles.signupLink}
            onPress={() => router.push('/(maid_auth)/maidsignup')}
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
    fontSize: 32,
    color: '#121714',
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#121714',
    marginBottom: 20,
    textAlign: 'left',
    marginTop: 4,
    marginLeft: 4,
  },
  inputContainer: { marginBottom: 12 },
  input: {
    height: 56,
    backgroundColor: '#F0F5F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222',
  },
  loginButton: {
    backgroundColor: '#38E078',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#121714',
    fontSize: 16,
    fontWeight: '700',
  },
  or: {
    textAlign: 'center',
    color: '#638770',
    fontSize: 14,
    marginVertical: 12,
  },
  signupText: {
    color: '#638770',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
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
