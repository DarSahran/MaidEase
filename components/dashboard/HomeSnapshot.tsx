import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function HomeSnapshot() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Home Snapshot</Text>
          <Text style={styles.statTitle}>Recent Services: 3</Text>
          <Text style={styles.statSubtitle}>Hours Saved: 12</Text>
          
          <TouchableOpacity style={styles.maidBadge}>
            <Text style={styles.maidText}>Maid of the Month: Kavita</Text>
          </TouchableOpacity>
        </View>
        
        <Image
          source={require('@/assets/images/home-snapshot.png')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  statsSection: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    color: '#52946B',
    lineHeight: 21,
  },
  statTitle: {
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0D1A12',
    lineHeight: 20,
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    color: '#52946B',
    lineHeight: 21,
  },
  maidBadge: {
    backgroundColor: '#E8F2ED',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  maidText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: '#0D1A12',
    lineHeight: 21,
  },
  image: {
    width: 130,
    height: 118,
    borderRadius: 12,
  },
});
