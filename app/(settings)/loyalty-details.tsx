import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../constants/supabase';
import { getUser } from '../../utils/session';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;

export default function LoyaltyDetails() {
  const [bookingsCount, setBookingsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const user = await getUser();
      if (!user || !user.id) {
        setBookingsCount(0);
        setLoading(false);
        return;
      }
      // Fetch all bookings for this user
      const { data, error } = await supabase
        .from('booking_history')
        .select('id')
        .eq('user_id', user.id);
      setBookingsCount(data ? data.length : 0);
      setLoading(false);
    }
    fetchBookings();
  }, []);

  // Tier logic
  let currentTier = '';
  let nextTier: string | undefined = undefined;
  let badge: any = null;
  let toNext = 0;
  let tierMin = 0;
  let tierDisplayMax = 0;
  let bookingsInTier = 0;

  if ((bookingsCount || 0) < 5) {
    currentTier = 'No Tier';
    nextTier = 'Bronze';
    badge = null;
    toNext = 5 - (bookingsCount || 0);
    tierMin = 0;
    tierDisplayMax = 4;
    bookingsInTier = bookingsCount || 0;
  } else if ((bookingsCount || 0) < 20) {
    currentTier = 'Bronze';
    nextTier = 'Silver';
    badge = require('../../assets/card-logos/bronze_badge.png');
    toNext = 20 - (bookingsCount || 0);
    tierMin = 5;
    tierDisplayMax = 19;
    bookingsInTier = (bookingsCount || 0) - tierMin + 1;
  } else if ((bookingsCount || 0) < 40) {
    currentTier = 'Silver';
    nextTier = 'Gold';
    badge = require('../../assets/card-logos/silver_badge.png');
    toNext = 40 - (bookingsCount || 0);
    tierMin = 20;
    tierDisplayMax = 39;
    bookingsInTier = (bookingsCount || 0) - tierMin + 1;
  } else {
    currentTier = 'Gold';
    nextTier = undefined;
    badge = require('../../assets/card-logos/gold_badge.png');
    toNext = 0;
    tierMin = 40;
    tierDisplayMax = 40;
    bookingsInTier = (bookingsCount || 0) - tierMin + 1;
    if (bookingsInTier < 1) bookingsInTier = 1;
  }
  if (bookingsInTier < 0) bookingsInTier = 0;
  if ((bookingsCount || 0) > tierDisplayMax) bookingsInTier = tierDisplayMax - tierMin + 1;

  // Helper for dynamic card height based on text length
  const getCardHeight = (lines: number) => 120 + lines * 18;
  const getCardMinHeight = (lines: number) => 120 + lines * 18;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="arrow-back" size={28} color="#0F1A12" style={{ marginRight: 12 }} />
        <Text style={styles.headerTitle}>Loyalty Tier Details</Text>
        {/* Invisible placeholder to center the title */}
        <View style={{ width: 40, marginLeft: 12 }} />
      </View>
      {/* Current Tier */}
      <View style={[styles.currentTierCard, { width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }]}> 
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.currentTierLabel}>{currentTier === 'No Tier' ? 'No Loyalty Tier Yet' : `${currentTier} Member`}</Text>
          {nextTier ? (
            <Text style={styles.currentTierPoints}>
              {toNext} more booking{toNext === 1 ? '' : 's'} to reach {nextTier}
            </Text>
          ) : (
            <Text style={styles.currentTierPoints}>You are at the highest tier!</Text>
          )}
          {loading ? (
            <ActivityIndicator size="small" color="#598C6E" style={{ marginTop: 4 }} />
          ) : (
            <Text style={styles.bookingsDone}>{bookingsInTier}/{tierDisplayMax - tierMin + 1} bookings in this tier</Text>
          )}
        </View>
        {badge && (
          <View style={styles.badgeContainer}>
            <Image source={badge} style={styles.tierImage} />
          </View>
        )}
      </View>
      {/* Bronze Tier */}
      <View style={[styles.tierCard, { width: CARD_WIDTH, marginHorizontal: CARD_MARGIN, minHeight: getCardMinHeight(2) }]}> 
        <View style={styles.tierBgContainer}>
          <Image source={require('../../assets/images/bronze_bg.png')} style={styles.tierBg} resizeMode="cover" />
        </View>
        <View style={styles.tierOverlay} />
        <View style={styles.tierContentOverlay}>
          <Text style={styles.tierTitle}>Bronze</Text>
          <Text style={styles.tierDesc}>Eligibility: 5+ bookings</Text>
          <Text style={styles.tierPerksTitle}>Perks:</Text>
          {['Access to standard maids', 'Email support'].map((perk, idx) => (
            <Text key={idx} style={styles.tierPerks}>- {perk}</Text>
          ))}
        </View>
      </View>
      {/* Silver Tier */}
      <View style={[styles.tierCard, { width: CARD_WIDTH, marginHorizontal: CARD_MARGIN, minHeight: getCardMinHeight(3) }]}> 
        <View style={styles.tierBgContainer}>
          <Image source={require('../../assets/images/silver_bg.png')} style={styles.tierBg} resizeMode="cover" />
        </View>
        <View style={styles.tierOverlay} />
        <View style={styles.tierContentOverlay}>
          <Text style={styles.tierTitle}>Silver</Text>
          <Text style={styles.tierDesc}>Eligibility: 20+ bookings or ₹10,000 spent</Text>
          <Text style={styles.tierPerksTitle}>Perks:</Text>
          {['Faster maid matching', '5% loyalty discount', 'Dedicated support'].map((perk, idx) => (
            <Text key={idx} style={styles.tierPerks}>- {perk}</Text>
          ))}
        </View>
      </View>
      {/* Gold Tier */}
      <View style={[styles.tierCard, { width: CARD_WIDTH, marginHorizontal: CARD_MARGIN, minHeight: getCardMinHeight(4) }]}> 
        <View style={styles.tierBgContainer}>
          <Image source={require('../../assets/images/gold_bg.png')} style={styles.tierBg} resizeMode="cover" />
        </View>
        <View style={styles.tierOverlay} />
        <View style={styles.tierContentOverlay}>
          <Text style={styles.tierTitle}>Gold</Text>
          <Text style={styles.tierDesc}>Eligibility: 40+ bookings or ₹20,000 spent in 12 months</Text>
          <Text style={styles.tierPerksTitle}>Perks:</Text>
          {['Priority maid selection', '10% discount', 'Early access to promos', 'Loyalty concierge'].map((perk, idx) => (
            <Text key={idx} style={styles.tierPerks}>- {perk}</Text>
          ))}
        </View>
      </View>
      {/* Footer */}
      <Text style={styles.footerText}>Loyalty status is reviewed monthly. Tier resets occur every 12 months.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F1A12',
    flex: 1,
    textAlign: 'center',
  },
  currentTierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 40,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  currentTierLabel: {
    color: '#598C6E',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentTierPoints: {
    color: '#0F1A12',
    fontSize: 16,
    fontWeight: '700',
  },
  tierImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: 'contain',
  },
  tierCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    justifyContent: 'flex-start',
    backgroundColor: '#eee',
    overflow: 'hidden',
    marginVertical: 10,
    alignSelf: 'center',
    position: 'relative',
  },
  tierBgContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 0,
  },
  tierBg: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    // Remove resizeMode here, set via prop
  },
  tierOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 16,
    zIndex: 1,
  },
  tierContentOverlay: {
    position: 'relative',
    zIndex: 2,
    padding: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  tierTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tierDesc: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  tierPerksTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 8,
  },
  tierPerks: {
    color: 'white',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 20,
  },
  footerText: {
    color: '#598C6E',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  bookingsDone: {
    color: '#598C6E',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});
