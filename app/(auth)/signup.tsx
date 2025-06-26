import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
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
  const [errors, setErrors] = useState<any>({});
  const [newUserData, setNewUserData] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();

  React.useEffect(() => {
    if (params.email) handleChange('email', String(params.email));
  }, [params.email]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs: any = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.mobile || form.mobile.length !== 10) errs.mobile = 'Valid 10-digit mobile number required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.apartment.trim()) errs.apartment = 'Apartment number is required';
    if (!form.street.trim()) errs.street = 'Street is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.pincode || form.pincode.length !== 6) errs.pincode = 'Valid 6-digit pincode required';
    if (!form.password) errs.password = 'Password is required';
    else if (passwordStrength === 'Weak') errs.password = 'Password is too weak';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSignup = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setEmailError('');
    setSaving(true);
    setSaveError('');
    // Do NOT save to Supabase yet, go to OTP page with all details
    setSaving(false);
    router.push({
      pathname: '/(auth)/otp-verification',
      params: { ...form }
    });
  };

  const handlePasswordChange = (v: string) => {
    handleChange('password', v);
    // Password strength logic
    let strength = '';
    if (v.length < 5) strength = 'Weak';
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
          {/* Uncomment below for back button if needed
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>{'\u2190'}</Text>
          </TouchableOpacity>
          */}
          <Text style={styles.headerTitle}>
            <Text style={styles.headerTitleBold}>MaidEase</Text>
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#698273"
              value={form.firstName}
              onChangeText={(v) => handleChange('firstName', v)}
            />
          </View>
          {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
        </View>
        <View style={styles.formSection}>
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#698273"
              value={form.lastName}
              onChangeText={(v) => handleChange('lastName', v)}
            />
          </View>
          {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#698273"
              keyboardType="phone-pad"
              maxLength={10}
              value={form.mobile}
              onChangeText={(v) => handleChange('mobile', v.replace(/[^0-9]/g, '').slice(0, 10))}
            />
          </View>
          {errors.mobile ? <Text style={styles.errorText}>{errors.mobile}</Text> : null}
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
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
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
            {errors.apartment ? <Text style={styles.errorText}>{errors.apartment}</Text> : null}
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
            {errors.street ? <Text style={styles.errorText}>{errors.street}</Text> : null}
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
            {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
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
            {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
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
              onChangeText={(v) => handleChange('pincode', v.replace(/[^0-9]/g, '').slice(0, 6))}
            />
          </View>
          {errors.pincode ? <Text style={styles.errorText}>{errors.pincode}</Text> : null}
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
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
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
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
        </View>

        {/* Signup Button */}
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={saving}>
          <Text style={styles.signupButtonText}>{saving ? 'Saving...' : 'Create Account'}</Text>
        </TouchableOpacity>
        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

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
