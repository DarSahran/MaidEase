import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const aadhar=require('@/assets/images/aadharverification.png'); // Adjust the path as necessary

const AadharVerificationScreen = () => {
    const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
              {/* Header */}
              <TouchableOpacity
                  style={styles.backButton} onPress={() => router.push('/(maid_auth)/verifyingfirstpage')}>
                  <Text style={styles.backIcon}>{'\u2190'}</Text>
              </TouchableOpacity>
        <View style={styles.header}>
          <View style={styles.backIconPlaceholder} />
          <Text style={styles.headerTitle}>Aadhar Verification</Text>
        </View>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={aadhar}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.subtitle}>
          Please enter your 12-digit Aadhar number for verification. This helps us ensure the security of your account.
        </Text>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name on Aadhar Card</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#52946B"
          />
        </View>

        {/* Aadhar Number Input */}
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Enter 12-digit Aadhar Number"
            placeholderTextColor="#638770"
            keyboardType="numeric"
            maxLength={12}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={()=> router.push('/(maid_auth)/otp-verification1')}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <Text style={styles.note}>
          Ensure your Aadhar number is correct to receive OTP.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AadharVerificationScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        paddingBottom: 24,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIconPlaceholder: {
        width: 24,
        height: 24,
        backgroundColor: '#121714',
        borderRadius: 4,
        position: 'absolute',
        left: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Spline Sans',
        color: '#121714',
    },
    imageContainer: {
        width: '100%',
        height: 309,
        backgroundColor: '#F7FAFA',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    bannerImage: {
        width: width + 100,
        height: 309,
        marginLeft: -50,
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        color: '#121714',
        marginTop: 20,
        fontFamily: 'Spline Sans',
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 16,
        color: '#121714',
        fontFamily: 'Spline Sans',
        lineHeight: 24,
        paddingHorizontal: 16,
        marginTop: 8,
    },
    inputGroup: {
        paddingHorizontal: 16,
        marginTop: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#0D1A12',
        fontFamily: 'Lexend',
        marginBottom: 6,
    },
    input: {
        height: 56,
        backgroundColor: '#F7FAFA',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        fontFamily: 'Lexend',
        color: '#121714',
        borderWidth: 1,
        borderColor: '#D1E5D9',
    },
    submitButton: {
        backgroundColor: '#38E078',
        height: 48,
        marginTop: 20,
        marginHorizontal: 16,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        color: '#121714',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Spline Sans',
    },
    note: {
        marginTop: 12,
        marginHorizontal: 25,
        textAlign: 'center',
        color: '#52946B',
        fontSize: 13,
        fontFamily: 'Lexend',
        lineHeight: 21,
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
});
