import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    apartment: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    password: '',
    confirmPassword: '',
  });
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const router = useRouter();

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = () => {
    if (!form.email) {
      setEmailError('Email is required');
      return;
    } else if (!form.email.includes('@')) {
      setEmailError('Enter a valid email address');
      return;
    } else {
      setEmailError('');
    }
    // Add your signup logic here
  };

  const handlePasswordChange = (v: string) => {
    handleChange('password', v);
    // Password strength logic
    let strength = '';
    if (v.length < 6) strength = 'Weak';
    else if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(v)) strength = 'Medium';
    else if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(v)) strength = 'Strong';
    else strength = 'Weak';
    setPasswordStrength(strength);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>{'\u2190'}</Text>
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>
            <Text style={styles.headerTitleBold}>MaidEasy</Text>
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#698273"
              value={form.fullName}
              onChangeText={(v) => handleChange('fullName', v)}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#698273"
              keyboardType="phone-pad"
              value={form.mobile}
              onChangeText={(v) => handleChange('mobile', v)}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#698273"
              keyboardType="email-address"
              value={form.email}
              onChangeText={v => { handleChange('email', v); setEmailError(''); }}
              autoCapitalize="none"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Address Fields */}
        <View style={styles.addressRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Apartment Number</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Apartment No."
                placeholderTextColor="#698273"
                value={form.apartment}
                onChangeText={(v) => handleChange('apartment', v)}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Street Name</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Street"
                placeholderTextColor="#698273"
                value={form.street}
                onChangeText={(v) => handleChange('street', v)}
              />
            </View>
          </View>
        </View>

        <View style={styles.addressRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>City</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#698273"
                value={form.city}
                onChangeText={(v) => handleChange('city', v)}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>State</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#698273"
                value={form.state}
                onChangeText={(v) => handleChange('state', v)}
              />
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Pin Code</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Pin Code"
              placeholderTextColor="#698273"
              keyboardType="number-pad"
              value={form.pincode}
              onChangeText={(v) => handleChange('pincode', v)}
            />
          </View>
        </View>

        {/* Password Fields */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#698273"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={handlePasswordChange}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#698273" />
            </TouchableOpacity>
          </View>
          {passwordStrength ? (
            <Text style={{ color: passwordStrength === 'Strong' ? 'green' : passwordStrength === 'Medium' ? 'orange' : 'red', marginLeft: 4, marginTop: 4, fontSize: 12 }}>
              Password Strength: {passwordStrength}
            </Text>
          ) : null}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#698273"
              secureTextEntry={!showConfirmPassword}
              value={form.confirmPassword}
              onChangeText={(v) => handleChange('confirmPassword', v)}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#698273" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Signup Button */}
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text
            style={styles.loginLink}
            onPress={() => router.push('/(auth)/login')}
          >
            Login
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, backgroundColor: '#fff', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 18,
    color: '#121714',
    fontWeight: '700',
  },
  headerTitleBold: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#121714',
  },
  formSection: { marginBottom: 12 },
  label: { color: '#121714', fontSize: 16, fontWeight: '500', marginBottom: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE3E0',
    backgroundColor: '#fff',
    overflow: 'hidden',
    height: 56,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 0,
    paddingHorizontal: 8,
    fontFamily: 'Lexend',
  },
  addressRow: { flexDirection: 'row', marginBottom: 12 },
  signupButton: {
    backgroundColor: '#38E078',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  signupButtonText: { color: '#121714', fontSize: 16, fontWeight: '700' },
  loginText: { color: '#698273', fontSize: 14, textAlign: 'center', marginTop: 8 },
  loginLink: {
    color: '#38E078',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
