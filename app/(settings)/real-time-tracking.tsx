import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getTrackingSettings, saveTrackingSettings } from '../../utils/trackingSettings';

const trackingOptions = [
  { label: 'At start only', value: 'start' },
  { label: 'Every 15 minutes', value: '15min' },
  { label: 'Full Session', value: 'full' },
];

export default function RealTimeTrackingSettings() {
  const router = useRouter();
  const [liveTracking, setLiveTracking] = useState(false);
  const [geoFencing, setGeoFencing] = useState(false);
  const [trackingUpdate, setTrackingUpdate] = useState('start');

  // Load saved settings on mount
  useEffect(() => {
    (async () => {
      const saved = await getTrackingSettings();
      if (saved) {
        setLiveTracking(saved.liveTracking ?? false);
        setGeoFencing(saved.geoFencing ?? false);
        setTrackingUpdate(saved.trackingUpdate ?? 'start');
      }
    })();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    saveTrackingSettings({ liveTracking, geoFencing, trackingUpdate });
  }, [liveTracking, geoFencing, trackingUpdate]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFA' }}>
      <ScrollView>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0D1A12" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Real Time Tracking Settings</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Tracking */}
        <Text style={styles.sectionTitle}>Tracking</Text>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Live Maid Tracking</Text>
            <Text style={styles.settingSubtitle}>Enable or disable live maid tracking</Text>
          </View>
          <Switch
            value={liveTracking}
            onValueChange={setLiveTracking}
            trackColor={{ false: "#E8F2ED", true: "#38E078" }}
            thumbColor="#fff"
          />
        </View>

        {/* Tracking Updates */}
        <Text style={styles.sectionTitle}>Tracking Updates</Text>
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {trackingOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.radioRow,
                { borderColor: trackingUpdate === option.value ? "#38E078" : "#D1E5D9" }
              ]}
              onPress={() => setTrackingUpdate(option.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.radioLabel}>{option.label}</Text>
              <View style={styles.radioOuter}>
                {trackingUpdate === option.value ? (
                  <View style={styles.radioSelected} />
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Geo-Fencing */}
        <Text style={styles.sectionTitle}>Geo-Fencing</Text>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Geo-Fencing Alerts</Text>
            <Text style={styles.settingSubtitle}>Get alerts if the maid leaves the premises during the service</Text>
          </View>
          <Switch
            value={geoFencing}
            onValueChange={setGeoFencing}
            trackColor={{ false: "#E8F2ED", true: "#38E078" }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F7FAFA',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#0D1A12',
    textAlign: 'center',
    lineHeight: 23,
  },
  sectionTitle: {
    color: '#0D1A12',
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 28,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7FAFA',
    minHeight: 56,
    gap: 16,
  },
  settingTitle: {
    color: '#0D1A12',
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    lineHeight: 24,
  },
  settingSubtitle: {
    color: '#52946B',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    lineHeight: 21,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  radioLabel: {
    color: '#0D1A12',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    lineHeight: 21,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#38E078',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38E078',
  },
});
