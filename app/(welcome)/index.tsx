// app/(welcome)/index.tsx
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

// Welcome screen images
const welcomeImages = [
  require('@/assets/images/welcome_1.png'),
  require('@/assets/images/welcome_2.png')
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Image alternation effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change image and fade in
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % welcomeImages.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    router.push('../who-are-you');
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Animated.Image 
            source={welcomeImages[currentImageIndex]}
            style={[styles.image, { opacity: fadeAnim }]}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Welcome to MaidEasy</Text>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Find trusted and reliable cleaning services in your area. Book a maid in minutes and enjoy a spotless home.
          </Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-between',
  },
  contentContainer: {
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: 420,
    overflow: 'hidden',
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
    color: '#0F1A14',
    lineHeight: 35,
  },
  descriptionContainer: {
    alignSelf: 'stretch',
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#0F1A14',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
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
    color: '#0F1A14',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  spacer: {
    height: 20,
  }
});
