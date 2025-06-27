import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const verificationSuccessfull=require('../../assets/images/verificationsuccessfull.png');

const VerificationSuccessScreen = () => {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Verification Successful!</Text>

        <Image
          style={styles.image}
          source={verificationSuccessfull}
          resizeMode="cover"
        />

        <Text style={styles.subtitle}>
          You’re now verified and ready to start accepting bookings!
        </Text>

        <Text style={styles.sectionTitle}>Tips for Getting Started</Text>

        {/* Tip 1 */}
        <View style={styles.tipContainer}>
          <View style={styles.iconBox}>
            <View style={styles.icon} />
          </View>
          <View>
            <Text style={styles.tipTitle}>Complete Your Profile</Text>
            <Text style={styles.tipDescription}>
              Complete your profile to attract more clients.
            </Text>
          </View>
        </View>

        {/* Tip 2 */}
        <View style={styles.tipContainer}>
          <View style={styles.iconBox}>
            <View style={styles.icon} />
          </View>
          <View>
            <Text style={styles.tipTitle}>Set Your Availability</Text>
            <Text style={styles.tipDescription}>
              Set your availability to receive booking requests.
            </Text>
          </View>
        </View>

        {/* Tip 3 */}
        <View style={styles.tipContainer}>
          <View style={styles.iconBox}>
            <View style={styles.icon} />
          </View>
          <View>
            <Text style={styles.tipTitle}>Respond Quickly</Text>
            <Text style={styles.tipDescription}>
              Respond quickly to booking requests to increase your chances of getting hired.
            </Text>
          </View>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={()=>router.push('/(maid_dashboard)/maidhomescreen')}>
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default VerificationSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentWrapper: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'SplineSans-Bold',
    fontWeight: '700',
    textAlign: 'center',
    color: '#121714',
    lineHeight: 35,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 239,
    borderRadius: 12,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'SplineSans-Regular',
    textAlign: 'center',
    color: '#121714',
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'SplineSans-Bold',
    fontWeight: '700',
    color: '#121714',
    lineHeight: 28,
    marginBottom: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#F2F5F2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    backgroundColor: '#121714',
    borderRadius: 4,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'SplineSans-Medium',
    fontWeight: '500',
    color: '#121714',
    lineHeight: 24,
  },
  tipDescription: {
    fontSize: 14,
    fontFamily: 'SplineSans-Regular',
    color: '#698273',
    lineHeight: 21,
    maxWidth: width - 96,
  },
  button: {
    margin: 16,
    backgroundColor: '#38E078',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#121714',
    fontSize: 16,
    fontFamily: 'SplineSans-Bold',
    fontWeight: '700',
    lineHeight: 24,
  },
});
