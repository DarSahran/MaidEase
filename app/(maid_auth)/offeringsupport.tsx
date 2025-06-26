import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const img = require('@/assets/images/offeringSupport.png'); // Adjust the path as necessary
const { width } = Dimensions.get('window');
export default function MaidPage() {
    const router = useRouter();
    const handleClick = () => {
        router.push('/(maid_auth)/maidlogin')
    }
  return (
    <View style={styles.container}>
      {/* Top Menu Icon (Placeholder Box) */}
      {/* <View style={styles.topBar}>
        <View style={styles.menuBox} />
      </View> */}

      {/* Center Image */}
      <Image
        source={img}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Support Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          We’re always here to help you with the login process—feel free to call us anytime if you
          need support.
        </Text>
      </View>

      {/* Button: I Need Help */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>I Need Help</Text>
      </TouchableOpacity>

      {/* Button: I Can Do It */}
      <TouchableOpacity style={styles.button} onPress={handleClick}>
        <Text style={styles.buttonText}>I Can Do It</Text>
      </TouchableOpacity>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    position: 'relative',
  },
  topBar: {
    width: screenWidth,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBox: {
    width: 24,
    height: 24,
    backgroundColor: '#121712',
    borderRadius: 4,
  },
  image: {
    width: width,
    height: 335,
    marginTop: 20,
    marginBottom: 30,
  },
  messageContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    width: screenWidth,
  },
  messageText: {
    textAlign: 'center',
    color: '#0F1A14',
    fontSize: 16,
    fontFamily: 'Spline Sans',
    fontWeight: '400',
    lineHeight: 24,
  },
  button: {
    width: screenWidth - 32,
    height: 48,
    backgroundColor: '#38E07A',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#0F1A14',
    fontSize: 16,
    fontFamily: 'Spline Sans',
    fontWeight: '700',
    lineHeight: 24,
  },
});
