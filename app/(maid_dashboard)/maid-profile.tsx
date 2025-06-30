import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

export default function MaidProfile() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ width: 48, height: 48 }} />
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://placehold.co/130x128' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.profileTextWrap}>
            <Text style={styles.profileName}>Shanta Apte</Text>
            <Text style={styles.profileRating}>4.8 • 124 reviews</Text>
          </View>
        </View>
        {/* Info Cards */}
        <View style={styles.infoCardWrap}>
          <InfoCard
            title="Personal Information"
            subtitle="Name, Age, Gender, Language"
            icon={<Feather name="user" size={32} color="#52946B" />}
          />
          <InfoCard
            title="Contact Details"
            subtitle="Phone, Emergency Contact"
            icon={<Feather name="phone" size={32} color="#52946B" />}
          />
          <InfoCard
            title="Payment Details"
            subtitle="UPI ID or Bank Info"
            icon={<Feather name="credit-card" size={32} color="#52946B" />}
          />
          <InfoCard
            title="Security Settings"
            subtitle="PIN/Password"
            icon={<Feather name="lock" size={32} color="#52946B" />}
          />
          <InfoCard
            title="Language Preferences"
            subtitle="Select from visual flags/icons"
            icon={<Feather name="globe" size={32} color="#52946B" />}
          />
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavItem label="Home" icon="home" active />
        <NavItem label="Jobs" icon="briefcase" active />
        <NavItem label="Profile" icon="user" />
      </View>
    </View>
  );
}

function InfoCard({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <View style={styles.infoCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoCardTitle}>{title}</Text>
        <Text style={styles.infoCardSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.infoCardIconWrap}>{icon}</View>
    </View>
  );
}

function NavItem({ label, icon, active }: { label: string; icon: string; active?: boolean }) {
  return (
    <TouchableOpacity style={styles.navItem}>
      <Feather
        name={icon}
        size={24}
        color={active ? '#52946B' : '#121714'}
        style={{ marginBottom: 4 }}
      />
      <Text style={[styles.navLabel, { color: active ? '#52946B' : '#121714' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FCF7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F7FCF7',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flex: 1,
    height: 24,
    paddingRight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0D1C0D',
    fontSize: 18,
    fontFamily: 'Lexend',
    fontWeight: '700',
    lineHeight: 23,
    textAlign: 'center',
  },
  profileSection: {
    alignSelf: 'stretch',
    padding: 16,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 16,
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#E6F4EA',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 130,
    height: 128,
    borderRadius: 65,
  },
  profileTextWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    color: '#0D1C0D',
    fontSize: 22,
    fontFamily: 'Lexend',
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'center',
  },
  profileRating: {
    color: '#4D994D',
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
  },
  infoCardWrap: {
    padding: 16,
    gap: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  infoCardTitle: {
    color: '#0D1C0D',
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  infoCardSubtitle: {
    color: '#4D994D',
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '400',
    lineHeight: 21,
  },
  infoCardIconWrap: {
    marginLeft: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFA',
    borderTopWidth: 1,
    borderTopColor: '#E8F2ED',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    fontFamily: 'Lexend',
    fontWeight: '500',
    lineHeight: 18,
  },
});
