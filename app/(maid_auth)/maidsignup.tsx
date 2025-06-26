import { Feather } from '@expo/vector-icons';
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

export default function RegisterScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMismatch, setShowMismatch] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const availableSkills = [
    'Cleaning',
    'Kitchen',
    'Bathroom',
    'Laundry',
    'Utensils',
    'Babysitting',
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleCreateAccount = () => {
    if (
      !fullName ||
      !mobileNumber ||
      !experience ||
      !password ||
      !confirmPassword ||
      selectedSkills.length === 0
    ) {
      alert('Please fill in all fields and select at least one skill');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setShowMismatch(true);
      return;
    }

    setShowMismatch(false);
    router.push('/(maid_auth)/verifyingfirstpage');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>MaidEase</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#8A8A8A"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#8A8A8A"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobileNumber}
            onChangeText={(text) => {
              const digitsOnly = text.replace(/[^0-9]/g, '');
              setMobileNumber(digitsOnly);
            }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Years of Experience</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 3"
            placeholderTextColor="#8A8A8A"
            keyboardType="numeric"
            value={experience}
            onChangeText={setExperience}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Skills</Text>
          <View style={styles.skillsContainer}>
            {availableSkills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillItem,
                  selectedSkills.includes(skill) && styles.skillItemSelected,
                ]}
                onPress={() => toggleSkill(skill)}
              >
                <Text
                  style={[
                    styles.skillText,
                    selectedSkills.includes(skill) && styles.skillTextSelected,
                  ]}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedSkills.length > 0 && (
            <Text style={styles.selectedSkillsText}>
              Selected: {selectedSkills.join(', ')}
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#8A8A8A"
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
              <Feather name={passwordVisible ? 'eye' : 'eye-off'} size={22} color="#8A8A8A" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#8A8A8A"
              secureTextEntry={!confirmPasswordVisible}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setShowMismatch(false);
              }}
              onBlur={() => {
                if (
                  password &&
                  confirmPassword &&
                  password.trim() !== confirmPassword.trim()
                ) {
                  setShowMismatch(true);
                }
              }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              <Feather name={confirmPasswordVisible ? 'eye' : 'eye-off'} size={22} color="#8A8A8A" />
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
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    alignSelf: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
    width:'100%'
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
    marginTop: 20,
    width: '100%',
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
    marginTop: 14,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8A8A8A',
  },
  errorText: {
    color: 'red',
    marginTop: 6,
    fontSize: 13,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillItem: {
    borderWidth: 1,
    borderColor: '#8A8A8A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillItemSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  skillText: {
    color: '#8A8A8A',
    fontSize: 13,
  },
  skillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedSkillsText: {
    marginTop: 8,
    color: '#000000',
    fontSize: 14,
  },
});
