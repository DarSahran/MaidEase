import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const img = require('@/assets/images/offeringSupport.png');
const { width } = Dimensions.get('window');

export default function MaidPage() {
  const router = useRouter();
  const handleClick = () => {
    router.push('/(maid_auth)/maidlogin');
  };

  return (
    <View style={styles.container}>
      {/* Centered Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={img}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Support Message in Card */}
      <View style={styles.messageCard}>
        <Text style={styles.messageText}>
          We’re always here to help you with the login process—feel free to call us anytime if you
          need support.
        </Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonTextSecondary}>I Need Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleClick}>
          <Text style={styles.buttonTextPrimary}>I Can Do It</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFA',
    alignItems: 'center',
    // Removed justifyContent: 'center' and paddingTop to allow image to start from top
  },
  imageContainer: {
    width: width,
    height: 420,
    overflow: 'hidden',
    backgroundColor: '#F7FAFA',
    alignItems: 'center',
    justifyContent: 'flex-start', // align image to top
    marginBottom: 12,
  },
  image: {
    width: width,
    height: 420, // match who-are-you.tsx
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginHorizontal: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    width: screenWidth * 0.9,
    alignSelf: 'center',
  },
  messageText: {
    textAlign: 'center',
    color: '#0F1A14',
    fontSize: 16,
    fontFamily: 'Spline Sans',
    fontWeight: '400',
    lineHeight: 24,
  },
  buttonsContainer: {
    width: screenWidth,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPrimary: {
    width: screenWidth * 0.85,
    height: 48,
    backgroundColor: '#38E07A',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
    shadowColor: '#38E07A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonTextPrimary: {
    color: '#0F1A14',
    fontSize: 16,
    fontFamily: 'Spline Sans',
    fontWeight: '700',
    lineHeight: 24,
  },
  buttonSecondary: {
    width: screenWidth * 0.85,
    height: 48,
    backgroundColor: '#E6F9EF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#38E07A',
  },
  buttonTextSecondary: {
    color: '#38E07A',
    fontSize: 16,
    fontFamily: 'Spline Sans',
    fontWeight: '700',
    lineHeight: 24,
  },
});
