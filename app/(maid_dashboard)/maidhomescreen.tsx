import { router } from 'expo-router'; // ✅ use this instead of useNavigation
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');
const profilePic = require('../../assets/images/maid-demo-pic.png');

export default function MaidDashboard() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>MaidEasy</Text>
          <TouchableOpacity>
            <Icon name="settings" size={24} color="#0D1A12" />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <View style={styles.avatarContainer}>
            <Image source={profilePic} style={styles.avatar} />
          </View>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greetingText}>Good Morning, Kavita</Text>
            <Text style={styles.reviewText}>4.8 (120 reviews)</Text>
          </View>
        </View>

        <Text style={styles.dashboardTitle}>Dashboard</Text>

        {/* Cards */}
        <View style={styles.cardGrid}>
          {cardData.map((item, index) => (
            <View key={index} style={styles.card}>
              <Image source={item.image} style={styles.cardImage} />
              <View style={styles.cardOverlay} />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => router.push(item.route)} // ✅ router-based navigation
          >
            <Icon
              name={item.icon}
              size={24}
              color={item.active ? '#52946B' : '#0F1A0F'}
              style={{ marginBottom: 4 }}
            />
            <Text style={[styles.navLabel, { color: item.active ? '#52946B' : '#0F1A0F' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const cardData = [
  { image: require('../../assets/images/todaysjob.png') },
  { image: require('../../assets/images/markavailability.png') },
  { image: require('../../assets/images/messages.png') },
  { image: require('../../assets/images/schedule.png') },
  { image: require('../../assets/images/earnings.png') },
  { image: require('../../assets/images/help.png') },
];

// ✅ Updated navData for router-based navigation
const navData = [
  { label: 'Home', icon: 'home', route: '/(maid_dashboard)/maidhomescreen', active: false },
  { label: 'Jobs', icon: 'briefcase', route: '/(maid_dashboard)/maid-jobs', active: false },
  { label: 'Profile', icon: 'user', route: '/(maid_dashboard)/maid-profile', active: true },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FCFA',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  headerRow: {
    backgroundColor: '#F7FAFA',
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1A12',
    fontFamily: 'Plus Jakarta Sans',
  },
  greetingContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#94E0B0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  avatar: {
    width: 132,
    height: 131,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Lexend',
    color: '#0D1A12',
  },
  reviewText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    color: '#52946B',
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Lexend',
    color: '#0D1C12',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    width: (width - 48) / 2,
    height: 184,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#F7FAFA',
    borderTopWidth: 1,
    borderTopColor: '#E8F2ED',
    paddingVertical: 12,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    fontFamily: 'Lexend',
    fontWeight: '500',
  },
});
