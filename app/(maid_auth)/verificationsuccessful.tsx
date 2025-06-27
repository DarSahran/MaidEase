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
    <ScrollView style={styles.bg} contentContainerStyle={{flexGrow: 1}}>
      <View style={styles.topAccent} />
      <View style={styles.card}>
        <View style={styles.celebrateIconBox}>
          <Image
            source={require('../../assets/images/CheckmarkCircle.svg')}
            style={styles.celebrateIcon}
            resizeMode="contain"
          />
        </View>
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
        <TouchableOpacity style={styles.button} onPress={()=>router.push('/(maid_dashboard)/maidhomescreen')}>
          <Text style={styles.buttonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default VerificationSuccessScreen;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },
  topAccent: {
    height: 80,
    backgroundColor: '#38E078',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: -40,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  celebrateIconBox: {
    backgroundColor: '#E6F9ED',
    borderRadius: 40,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -48,
    marginBottom: 8,
    shadowColor: '#38E078',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  celebrateIcon: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'SplineSans-Bold',
    fontWeight: '700',
    textAlign: 'center',
    color: '#121714',
    lineHeight: 35,
    marginBottom: 16,
    marginTop: 4,
  },
  image: {
    width: '100%',
    height: 180,
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
    fontSize: 20,
    fontFamily: 'SplineSans-Bold',
    fontWeight: '700',
    color: '#121714',
    lineHeight: 28,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 18,
    backgroundColor: '#F2F5F2',
    borderRadius: 12,
    padding: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#E6F9ED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    width: 24,
    height: 24,
    backgroundColor: '#38E078',
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
    maxWidth: width - 120,
  },
  button: {
    marginTop: 18,
    backgroundColor: '#38E078',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#38E078',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'SplineSans-Bold',
    fontWeight: '700',
    lineHeight: 24,
  },
});
