// app/(welcome)/who-are-you.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// Who are you screen images - alternating between the two designs
const whoAreYouImages = [
  require('@/assets/images/whoareyou_1.png'), // Woman in blue dress with cleaning supplies
  require('@/assets/images/whoareyou_2.png')  // Woman in orange sari in kitchen
];

export default function WhoAreYouScreen() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Image alternation effect (same as welcome screen)
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change image and fade in
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % whoAreYouImages.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleMaidPress = () => {
    // Navigate to maid flow - you can create this route later
    console.log('Maid selected');
    // router.push('/(maid)/dashboard'); // Example for future
  };

  const handleUserPress = () => {
    // Navigate to user flow - you can create this route later
    console.log('User selected');
    router.push('/(auth)/login');
    // router.push('/(user)/dashboard'); // Example for future
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Animated.Image 
            source={whoAreYouImages[currentImageIndex]}
            style={[styles.image, { opacity: fadeAnim }]}
            resizeMode="cover"
          />
        </View>
        
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Who are you?</Text>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Find and book trusted cleaning professionals for your home or office.
          </Text>
        </View>
      </View>
      
      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        {/* Maid Button */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleMaidPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Maid</Text>
          </TouchableOpacity>
        </View>
        
        {/* User Button */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleUserPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>User</Text>
          </TouchableOpacity>
        </View>
        
        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
        
        <View style={styles.bottomSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFA',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: 420,
    overflow: 'hidden',
    backgroundColor: '#F7FAFA',
  },
  image: {
    width: width,
    height: 420,
  },
  titleContainer: {
    alignSelf: 'stretch',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0D1A12',
    lineHeight: 35,
  },
  descriptionContainer: {
    alignSelf: 'stretch',
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#0D1A12',
    lineHeight: 24,
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  buttonWrapper: {
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#38E07A',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#0D1A12',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  termsContainer: {
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#52946B',
    lineHeight: 21,
  },
  bottomSpacer: {
    height: 20,
  }
});
