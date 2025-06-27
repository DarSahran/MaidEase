import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // ← Feather icons

const { width } = Dimensions.get('window');
const profilePic = require('../../assets/images/maid-demo-pic.png');

export default function MaidDashboard() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>MaidEasy</Text>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingContainer}>
          <View style={styles.avatarContainer}>
            <Image source={profilePic} style={styles.avatar} />
          </View>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greetingText}>Good Morning, Kavita</Text>
            <Text style={styles.reviewText}>4.8 (120 reviews)</Text>
          </View>
        </View>

        {/* Dashboard Title */}
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
          <View key={index} style={styles.navItem}>
            <Icon
              name={item.icon}
              size={24}
              color={item.active ? '#52946B' : '#0F1A0F'}
              style={{ marginBottom: 4 }}
            />
            <Text style={[styles.navLabel, { color: item.active ? '#52946B' : '#0F1A0F' }]}>
              {item.label}
            </Text>
          </View>
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

const navData = [
  { label: 'Home', icon: 'home', active: false },
  { label: 'Jobs', icon: 'briefcase', active: true },
  { label: 'Profile', icon: 'user', active: true },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FCFA',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    backgroundColor: '#F7FAFA',
    padding: 16,
    alignItems: 'center',
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
  },
  navLabel: {
    fontSize: 12,
    fontFamily: 'Lexend',
    fontWeight: '500',
  },
});
