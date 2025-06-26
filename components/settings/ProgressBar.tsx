// This file has been moved to components/ProgressBar.tsx. Please update your imports accordingly.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
  bookingsCount: number; // Number of bookings completed by the user
}

// Loyalty tiers as per app description
const stages = [
  { name: 'Bronze', min: 5, max: 19, color: '#B08D57', perks: 'Access to standard maids, Email support' },
  { name: 'Silver', min: 20, max: 39, color: '#C0C0C0', perks: 'Faster maid matching, 5% loyalty discount, Dedicated support' },
  { name: 'Gold', min: 40, max: Infinity, color: '#FFD700', perks: 'Priority maid selection, 10% discount, Early access to promos, Loyalty concierge' },
];

function getStage(bookingsCount: number) {
  // If less than 5 bookings, not eligible for any tier
  if (bookingsCount < 5) return { name: 'None', color: '#DBDBDB', perks: 'No perks yet', min: 0, max: 4 };
  return stages.find(stage => bookingsCount >= stage.min && bookingsCount <= stage.max) || stages[stages.length - 1];
}

function getNextStage(bookingsCount: number) {
  if (bookingsCount < 5) return stages[0];
  const currentIndex = stages.findIndex(stage => bookingsCount >= stage.min && bookingsCount <= stage.max);
  return stages[currentIndex + 1] || stages[stages.length - 1];
}

export default function ProgressBar({ bookingsCount }: ProgressBarProps) {
  // --- Use the same logic as loyalty-details.tsx ---
  let currentTier = '';
  let nextTier: string | undefined = undefined;
  let tierMin = 0;
  let tierDisplayMax = 0;
  let bookingsInTier = 0;
  let toNext = 0;
  let progress = 0;

  if (bookingsCount < 5) {
    currentTier = 'No Tier';
    nextTier = 'Bronze';
    tierMin = 0;
    tierDisplayMax = 4;
    bookingsInTier = bookingsCount;
    toNext = 5 - bookingsCount;
    progress = bookingsCount / 5;
  } else if (bookingsCount < 20) {
    currentTier = 'Bronze';
    nextTier = 'Silver';
    tierMin = 5;
    tierDisplayMax = 19;
    bookingsInTier = bookingsCount - tierMin + 1;
    toNext = 20 - bookingsCount;
    progress = (bookingsCount - tierMin + 1) / (tierDisplayMax - tierMin + 1);
  } else if (bookingsCount < 40) {
    currentTier = 'Silver';
    nextTier = 'Gold';
    tierMin = 20;
    tierDisplayMax = 39;
    bookingsInTier = bookingsCount - tierMin + 1;
    toNext = 40 - bookingsCount;
    progress = (bookingsCount - tierMin + 1) / (tierDisplayMax - tierMin + 1);
  } else {
    currentTier = 'Gold';
    nextTier = undefined;
    tierMin = 40;
    tierDisplayMax = 40;
    bookingsInTier = bookingsCount - tierMin + 1;
    if (bookingsInTier < 1) bookingsInTier = 1;
    toNext = 0;
    progress = 1;
  }
  if (bookingsInTier < 0) bookingsInTier = 0;
  if (bookingsCount > tierDisplayMax) bookingsInTier = tierDisplayMax - tierMin + 1;
  progress = Math.max(0, Math.min(progress, 1));

  return (
    <View style={styles.wrapper}>
      <View style={styles.stagesRow}>
        <Text style={styles.stageLabel}>{currentTier === 'No Tier' ? 'No Loyalty Tier Yet' : `${currentTier}`}</Text>
        {nextTier ? (
          <Text style={styles.nextStageLabel}>Next: {nextTier}</Text>
        ) : null}
      </View>
      <View style={styles.container}>
        <View style={[styles.progress, { width: `${progress * 100}%`, backgroundColor: currentTier === 'Bronze' ? '#B08D57' : currentTier === 'Silver' ? '#C0C0C0' : currentTier === 'Gold' ? '#FFD700' : '#DBDBDB' }]} />
      </View>
      <Text style={styles.discountLabel}>{bookingsInTier}/{tierDisplayMax - tierMin + 1} bookings in this tier</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'flex-start',
  },
  stagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  stageLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextStageLabel: {
    fontSize: 14,
    color: '#737373',
  },
  container: {
    height: 8,
    backgroundColor: '#DBDBDB',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 4,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  discountLabel: {
    fontSize: 12,
    color: '#737373',
    marginTop: 2,
  },
});
