import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const verifyingfirstpage=require('@/assets/images/verifyingfirstpage.png'); // Adjust the path as necessary

export default function VerificationScreen() {
    const handleVerification = () => {
        router.push('/(maid_auth)/aadharverification');
    }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Bar Title */}
      <View style={styles.header}>
        <Text style={styles.headerText}>MaidEasy</Text>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Verify Yourself to Continue</Text>
      </View>

      {/* Image */}
      <View style={styles.imageWrapper}>
        <Image
          source={verifyingfirstpage}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Verification Explanation Text */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          To ensure the safety of our community, we require all service providers to complete a
          verification process before they can start accepting jobs.
        </Text>
      </View>

      {/* Start Verification Button */}
      <TouchableOpacity style={styles.button} onPress={handleVerification}>
        <Text style={styles.buttonText}>Start Verification</Text>
      </TouchableOpacity>

      {/* Footer Text */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Why verify?</Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 24,
    paddingTop: 16,
  },
  header: {
    width: screenWidth,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Spline Sans',
    color: '#121714',
    textAlign: 'center',
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    width: screenWidth,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Spline Sans',
    color: '#121714',
    textAlign: 'center',
    lineHeight: 35,
  },
  imageWrapper: {
    paddingHorizontal: 16,
    width: screenWidth,
    alignItems: 'center',
  },
  image: {
    width: screenWidth - 32,
    height: 400,
    borderRadius: 12,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    width: screenWidth,
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Spline Sans',
    color: '#121714',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#38E078',
    borderRadius: 24,
    height: 48,
    width: screenWidth - 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Spline Sans',
    color: '#121714',
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 16,
    width: screenWidth,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Spline Sans',
    color: '#638770',
    textAlign: 'center',
    lineHeight: 21,
  },
});
