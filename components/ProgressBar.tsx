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
  const currentStage = getStage(bookingsCount);
  const nextStage = getNextStage(bookingsCount);
  let stageProgress = 0;
  if (currentStage.name === 'None') {
    stageProgress = bookingsCount / 5;
  } else if (currentStage.max === Infinity) {
    stageProgress = 1;
  } else {
    stageProgress = (bookingsCount - currentStage.min) / (currentStage.max - currentStage.min + 1);
  }
  stageProgress = Math.max(0, Math.min(stageProgress, 1));

  return (
    <View style={styles.wrapper}>
      <View style={styles.stagesRow}>
        <Text style={[styles.stageLabel, { color: currentStage.color }]}>{currentStage.name === 'None' ? 'No Tier' : currentStage.name}</Text>
        <Text style={styles.nextStageLabel}>
          {currentStage.name === 'Gold' ? 'Highest Tier' : `Next: ${nextStage.name}`}
        </Text>
      </View>
      <View style={styles.container}>
        <View style={[styles.progress, { width: `${stageProgress * 100}%`, backgroundColor: currentStage.color }]} />
      </View>
      <Text style={styles.perksLabel}>
        {currentStage.name === 'None' ? 'Book 5 times to unlock Bronze perks!' : `Perks: ${currentStage.perks}`}
      </Text>
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
  perksLabel: {
    fontSize: 12,
    color: '#737373',
    marginTop: 2,
  },
});
