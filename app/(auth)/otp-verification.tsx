import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../constants/supabase';

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { mobile } = params;

  // Format the mobile number for display
  const formattedMobile = mobile && typeof mobile === 'string'
    ? `+91 ${mobile.replace(/\D/g, '').slice(-10)}`
    : '+91';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Move to previous input if deleted
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text: string) => {
    if (/^\d{6}$/.test(text)) {
      setOtp(text.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const isOtpFilled = otp.every((digit) => digit.length === 1);

  const handleVerify = async () => {
    setMessage('');
    setSuccess(false);
    if (isOtpFilled) {
      // Replace with your OTP verification logic
      if (otp.join('') === '000000') {
        setSuccess(true);
        setMessage('OTP verified successfully!');
        // Save user to Supabase if all details are present
        if (params.fullName && params.mobile && params.email && params.apartment && params.street && params.city && params.state && params.pincode && params.password) {
          const { error } = await supabase.from('users').insert([
            {
              full_name: params.fullName,
              mobile: params.mobile,
              email: params.email,
              apartment: params.apartment,
              street: params.street,
              city: params.city,
              state: params.state,
              pincode: params.pincode,
              password: params.password, // In production, hash the password!
            }
          ]);
          if (error) {
            if (error.message.includes('duplicate key value') && error.message.includes('users_email_key')) {
              setMessage('An account with this email already exists. Please log in.');
            } else {
              setMessage('User account was not created: ' + error.message);
            }
            setSuccess(false);
          } else {
            setMessage('User account created successfully!');
            setSuccess(true);
            // router.push('/(main)/dashboard');
          }
        }
      } else {
        setMessage('Invalid OTP. Please try again.');
        console.log('Invalid OTP entered:', otp.join(''));
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      // Implement resend OTP logic here
      setMessage('OTP resent!');
      setSuccess(false);
      setOtp(['', '', '', '', '', '']);
      setTimer(45);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <Text style={styles.header}>OTP Verification</Text>
          <Text style={styles.subheader}>
            Enter the OTP sent to <Text style={{ fontWeight: 'bold' }}>{formattedMobile}</Text>
          </Text>

          {/* OTP Inputs */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={ref => { inputRefs.current[idx] = ref; }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={val => handleChange(idx, val)}
                onFocus={() => {
                  // Select the digit for easy overwrite
                  if (otp[idx]) setOtp(prev => {
                    const copy = [...prev];
                    copy[idx] = '';
                    return copy;
                  });
                }}
                autoFocus={idx === 0}
                onSubmitEditing={() => {
                  if (idx === 5 && isOtpFilled) handleVerify();
                }}
                textContentType="oneTimeCode"
                importantForAutofill="yes"
              />
            ))}
          </View>

          {/* Timer */}
          <View style={styles.timerRow}>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>00</Text>
              <Text style={styles.timerLabel}>Minutes</Text>
            </View>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>{timer.toString().padStart(2, '0')}</Text>
              <Text style={styles.timerLabel}>Seconds</Text>
            </View>
          </View>

          {/* Inline Message */}
          {message ? (
            <Text style={{ color: success ? 'green' : 'red', marginBottom: 8, fontFamily: 'Lexend' }}>{message}</Text>
          ) : null}

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              isOtpFilled ? styles.verifyButtonActive : styles.verifyButtonDisabled
            ]}
            onPress={handleVerify}
            disabled={!isOtpFilled}
          >
            <Text style={[
              styles.verifyButtonText,
              isOtpFilled ? { color: '#fff' } : { color: '#fff', opacity: 0.7 }
            ]}>
              Verify & Continue
            </Text>
          </TouchableOpacity>

          {/* Resend OTP */}
          <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
            <Text style={[styles.resend, { color: timer > 0 ? '#ccc' : '#698273' }]}>Resend OTP</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: '#121714', fontFamily: 'Lexend' },
  subheader: { fontSize: 16, color: '#121714', marginBottom: 24, textAlign: 'center', fontFamily: 'Lexend' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  otpInput: {
    width: 48, height: 56, backgroundColor: '#F2F5F2', borderRadius: 12,
    marginHorizontal: 4, textAlign: 'center', fontSize: 20, fontWeight: '700', color: '#121714', fontFamily: 'Lexend'
  },
  timerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  timerBox: {
    width: 90, height: 56, backgroundColor: '#F2F5F2', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 8,
  },
  timerValue: { color: '#121714', fontSize: 18, fontWeight: '700', fontFamily: 'Lexend' },
  timerLabel: { color: '#121714', fontSize: 14, fontFamily: 'Lexend' },
  verifyButton: {
    borderRadius: 24, height: 48, justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 16,
  },
  verifyButtonActive: { backgroundColor: '#38E078' },
  verifyButtonDisabled: { backgroundColor: '#686767' },
  verifyButtonText: { fontSize: 16, fontWeight: '700', fontFamily: 'Lexend' },
  resend: { color: '#698273', fontSize: 14, marginTop: 12, textAlign: 'center', fontFamily: 'Lexend' },
});
