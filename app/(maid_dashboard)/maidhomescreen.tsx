
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const profilePic = { uri: 'http://localhost:3845/assets/236230df20c21b733addcf1b795a3bd6a4d05b5a.png' };
const cardImages = [
  { uri: 'http://localhost:3845/assets/e4a76363329db9d32ee9474d8c8b872e96990150.png', label: "Today's Jobs" },
  { uri: 'http://localhost:3845/assets/123a1ce83792ebc5718c0a66fd3d1ef1b21af029.png', label: 'Mark Availability' },
  { uri: 'http://localhost:3845/assets/5b110ccd8e140679159cc475bf838219cf083728.png', label: 'Messages' },
  { uri: 'http://localhost:3845/assets/d8acc497b74c1052b371eb6ab44102daa2c8d407.png', label: 'My Schedule' },
  { uri: 'http://localhost:3845/assets/b2287f6168a11ad9b5cad37ec6feb01db6c63fa6.png', label: 'My Earnings' },
  { uri: 'http://localhost:3845/assets/c6fd1422a73f8e6e5e9318d695ef1c266ad07d37.png', label: 'Help & Training' },
];
const navIcons = [
  { uri: 'http://localhost:3845/assets/26eb074b2a06b23176143a3457cd1cebc91ebaaa.svg', label: 'Home', active: false },
  { uri: 'http://localhost:3845/assets/46ca6d85801b7f778455e5a4cb77127c4ee4b3ff.svg', label: 'Jobs', active: true },
  { uri: 'http://localhost:3845/assets/51bd8e20802ee4e800f2b262e573f391b6bbd51a.svg', label: 'Profile', active: true },
];

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
          <View style={styles.avatarShadow}>
            <View style={styles.avatarContainer}>
              <Image source={profilePic} style={styles.avatar} />
            </View>
          </View>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greetingText}>
              Good Morning, <Text style={styles.greetingName}>Kavita</Text>
            </Text>
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewText}>★ 4.8</Text>
              <Text style={styles.reviewCount}> (120 reviews)</Text>
            </View>
          </View>
        </View>

        {/* Dashboard Title */}
        <Text style={styles.dashboardTitle}>Dashboard</Text>

        {/* Cards */}
        <View style={styles.cardGrid}>
          {cardImages.map((item, index) => (
            <View key={index} style={styles.cardShadow}>
              <View style={styles.card}>
                <Image source={item} style={styles.cardImage} />
                <View style={styles.cardOverlay} />
                <View style={styles.cardLabelContainer}>
                  <Text style={styles.cardLabel}>{item.label}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navIcons.map((item, index) => (
          <View key={index} style={[styles.navItem, item.active && styles.navItemActive]}>
            <View style={[styles.navIconCircle, item.active && styles.navIconCircleActive]}>
              <Image source={item} style={{ width: 24, height: 24, tintColor: item.active ? '#fff' : '#52946B' }} />
            </View>
            <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

    </View>
  );
}


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
  avatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 64,
    marginRight: 16,
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
  greetingName: {
    color: '#52946B',
    fontWeight: '700',
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F2ED',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  reviewText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    color: '#52946B',
    fontWeight: '700',
  },
  reviewCount: {
    color: '#52946B',
    fontSize: 14,
    fontFamily: 'Lexend',
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
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 22,
    marginBottom: 16,
  },
  card: {
    width: (width - 48) / 2,
    height: 184,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#fff',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    backgroundColor: 'rgba(82, 148, 107, 0.08)',
  },
  cardLabelContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  cardLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Lexend',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#F7FAFA',
    borderTopWidth: 1,
    borderTopColor: '#E8F2ED',
    paddingVertical: 10,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 6,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navItemActive: {
    // Optionally add a highlight or scale effect
  },
  navIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F2ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  navIconCircleActive: {
    backgroundColor: '#52946B',
  },
  navLabel: {
    fontSize: 12,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#0F1A0F',
  },
  navLabelActive: {
    color: '#52946B',
    fontWeight: '700',
  },
});
