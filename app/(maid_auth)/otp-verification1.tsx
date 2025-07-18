import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const router = useRouter();

  // ✅ Hardcoded test params
  const params = {
    fullName: 'Priya Sharma',
    mobileNumber: '9876543210',
    experience: '3 years',
    password: 'test@123',
    confirmPassword: 'test@123',
    selectedSkills: ['Cleaning', 'Cooking'],
    mobile: '9876543210'
  };

  const formattedMobile =
    typeof params.mobile === 'string'
      ? `+91 XXXXXXXX${params.mobile.slice(-2)}`
      : '+91';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpFilled = otp.every((digit) => digit.length === 1);

  const handleVerify = async () => {
    setMessage('');
    setSuccess(false);
    if (isOtpFilled) {
      if (otp.join('') === '111111') {
        setSuccess(true);
        setMessage('OTP verified! Navigating...');
        setTimeout(() => {
          router.replace('/(maid_auth)/verificationsuccessful');
        }, 1000);
      } else {
        setMessage('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleResend = () => {
    if (timer === 0) {
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
          <Text style={styles.header}>OTP Verification</Text>
          <Text style={styles.subheader}>
            Enter the OTP sent to{' '}
            <Text style={{ fontWeight: 'bold' }}>{formattedMobile}</Text>
          </Text>

          <View style={styles.illustrationBox}>
            <Image
              source={require('@/assets/images/otp_illustration.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => {
                  inputRefs.current[idx] = ref;
                }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => handleChange(idx, val)}
                autoFocus={idx === 0}
                textContentType="oneTimeCode"
                importantForAutofill="yes"
              />
            ))}
          </View>

          <View style={styles.timerRow}>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>00</Text>
              <Text style={styles.timerLabel}>Minutes</Text>
            </View>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>
                {timer.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.timerLabel}>Seconds</Text>
            </View>
          </View>

          {message ? (
            <Text
              style={{
                color: success ? 'green' : 'red',
                marginBottom: 8,
                fontFamily: 'Lexend'
              }}
            >
              {message}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.verifyButton,
              isOtpFilled ? styles.verifyButtonActive : styles.verifyButtonDisabled
            ]}
            onPress={handleVerify}
            disabled={!isOtpFilled}
          >
            <Text
              style={[
                styles.verifyButtonText,
                isOtpFilled
                  ? { color: '#fff' }
                  : { color: '#fff', opacity: 0.7 }
              ]}
            >
              Verify & Continue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
            <Text
              style={[
                styles.resend,
                { color: timer > 0 ? '#ccc' : '#698273' }
              ]}
            >
              Resend OTP
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 0,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121714',
    fontFamily: 'Lexend',
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 28
  },
  subheader: {
    fontSize: 16,
    color: '#121714',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Lexend',
    lineHeight: 24,
    paddingHorizontal: 16
  },
  illustrationBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#fff'
  },
  illustration: {
    width: 420,
    height: 420,
    borderRadius: 30,
    backgroundColor: '#fff',
    marginVertical: 0
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DEE3E0',
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#121714',
    fontFamily: 'Lexend'
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  timerBox: {
    width: 90,
    height: 56,
    backgroundColor: '#F2F5F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8
  },
  timerValue: {
    color: '#121714',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Lexend'
  },
  timerLabel: {
    color: '#121714',
    fontSize: 14,
    fontFamily: 'Lexend'
  },
  verifyButton: {
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    marginBottom: 12,
    alignSelf: 'center'
  },
  verifyButtonActive: { backgroundColor: '#38E078' },
  verifyButtonDisabled: { backgroundColor: '#686767' },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Lexend'
  },
  resend: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Lexend'
  }
});
