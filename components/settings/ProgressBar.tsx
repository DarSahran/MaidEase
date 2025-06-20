import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
  bookingsCount: number; // Number of bookings completed by the user
}

const stages = [
  { name: 'Bronze', min: 0, max: 4, color: '#B08D57', discount: '0%' },
  { name: 'Silver', min: 5, max: 9, color: '#C0C0C0', discount: '5%' },
  { name: 'Gold', min: 10, max: 19, color: '#FFD700', discount: '10%' },
  { name: 'Platinum', min: 20, max: Infinity, color: '#E5E4E2', discount: '15%' },
];

function getStage(bookingsCount: number) {
  return stages.find(stage => bookingsCount >= stage.min && bookingsCount <= stage.max) || stages[0];
}

function getNextStage(bookingsCount: number) {
  const currentIndex = stages.findIndex(stage => bookingsCount >= stage.min && bookingsCount <= stage.max);
  return stages[currentIndex + 1] || stages[stages.length - 1];
}

export default function ProgressBar({ bookingsCount }: ProgressBarProps) {
  const currentStage = getStage(bookingsCount);
  const nextStage = getNextStage(bookingsCount);
  const stageProgress = Math.min(
    (bookingsCount - currentStage.min) / ((currentStage.max === Infinity ? bookingsCount + 1 : currentStage.max + 1) - currentStage.min),
    1
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.stagesRow}>
        <Text style={[styles.stageLabel, { color: currentStage.color }]}>{currentStage.name}</Text>
        <Text style={styles.nextStageLabel}>Next: {nextStage.name}</Text>
      </View>
      <View style={styles.container}>
        <View style={[styles.progress, { width: `${stageProgress * 100}%`, backgroundColor: currentStage.color }]} />
      </View>
      <Text style={styles.discountLabel}>Discount: {currentStage.discount} on bookings</Text>
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
