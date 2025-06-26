import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMismatch, setShowMismatch] = useState(false);

  const handleCreateAccount = () => {
    if (!fullName || !mobileNumber || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      setShowMismatch(true);
      return;
    }

    setShowMismatch(false);
    router.push('/(maid_auth)/verifyingfirstpage');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MaidEase</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#698273"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#698273"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#698273"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setShowMismatch(false);
              }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Feather name={passwordVisible ? 'eye' : 'eye-off'} size={22} color="#698273" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#698273"
              secureTextEntry={!confirmPasswordVisible}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setShowMismatch(false);
              }}
              onBlur={() => {
                if (password && confirmPassword && password !== confirmPassword) {
                  setShowMismatch(true);
                }
              }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              <Feather name={confirmPasswordVisible ? 'eye' : 'eye-off'} size={22} color="#698273" />
            </TouchableOpacity>
          </View>
          {showMismatch && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Lexend',
    color: '#121714',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Lexend',
    color: '#121714',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderColor: '#DEE3E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'Lexend',
    color: '#121714',
    backgroundColor: 'white',
    flex: 1,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 10,
  },
  button: {
    marginTop: 16,
    width: '100%',
    maxWidth: 480,
    height: 48,
    backgroundColor: '#38E078',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#121714',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Lexend',
    lineHeight: 24,
  },
  loginPrompt: {
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lexend',
    color: '#698273',
    textAlign: 'center',
    lineHeight: 21,
  },
  errorText: {
    color: 'red',
    marginTop: 6,
    fontSize: 13,
    fontFamily: 'Lexend',
  },
});
