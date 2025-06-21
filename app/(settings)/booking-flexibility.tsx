import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getFlexibilitySettings, saveFlexibilitySettings } from '../../utils/bookingFlexibilitySettings';

export default function BookingFlexibility() {
  const router = useRouter();
  
  // State for toggles
  const [allowReschedule, setAllowReschedule] = useState(false);
  const [autoCancel, setAutoCancel] = useState(false);
  const [enableBackupMaid, setEnableBackupMaid] = useState(false);
  
  // State for preferred replacement maid checkboxes
  const [preferences, setPreferences] = useState({
    vaccinated: false,
    experienced: false,
    sameGender: false,
    topRated: false,
  });

  // Track initial settings for change detection
  const [initialSettings, setInitialSettings] = useState<any>(null);

  // Load saved settings on mount
  useEffect(() => {
    (async () => {
      const saved = await getFlexibilitySettings();
      if (saved) {
        setAllowReschedule(saved.allowReschedule ?? false);
        setAutoCancel(saved.autoCancel ?? false);
        setEnableBackupMaid(saved.enableBackupMaid ?? false);
        setPreferences({
          vaccinated: saved.preferences?.vaccinated ?? false,
          experienced: saved.preferences?.experienced ?? false,
          sameGender: saved.preferences?.sameGender ?? false,
          topRated: saved.preferences?.topRated ?? false,
        });
        setInitialSettings({
          allowReschedule: saved.allowReschedule ?? false,
          autoCancel: saved.autoCancel ?? false,
          enableBackupMaid: saved.enableBackupMaid ?? false,
          preferences: {
            vaccinated: saved.preferences?.vaccinated ?? false,
            experienced: saved.preferences?.experienced ?? false,
            sameGender: saved.preferences?.sameGender ?? false,
            topRated: saved.preferences?.topRated ?? false,
          },
        });
      } else {
        setInitialSettings({
          allowReschedule: false,
          autoCancel: false,
          enableBackupMaid: false,
          preferences: {
            vaccinated: false,
            experienced: false,
            sameGender: false,
            topRated: false,
          },
        });
      }
    })();
  }, []);

  // Compare current state to initial settings
  const isChanged = initialSettings && (
    allowReschedule !== initialSettings.allowReschedule ||
    autoCancel !== initialSettings.autoCancel ||
    enableBackupMaid !== initialSettings.enableBackupMaid ||
    preferences.vaccinated !== initialSettings.preferences.vaccinated ||
    preferences.experienced !== initialSettings.preferences.experienced ||
    preferences.sameGender !== initialSettings.preferences.sameGender ||
    preferences.topRated !== initialSettings.preferences.topRated
  );

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    await saveFlexibilitySettings({
      allowReschedule,
      autoCancel,
      enableBackupMaid,
      preferences
    });
    setInitialSettings({
      allowReschedule,
      autoCancel,
      enableBackupMaid,
      preferences: { ...preferences },
    });
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0F1A12" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Flexibility</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Reschedule Section */}
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Allow Reschedule</Text>
            <Text style={styles.settingSubtitle}>Let users reschedule bookings with maid consent</Text>
          </View>
          <Switch
            value={allowReschedule}
            onValueChange={setAllowReschedule}
            trackColor={{ false: "#E8F2ED", true: "#38E078" }}
            thumbColor={allowReschedule ? "#38E078" : "#fff"}
            style={styles.switchUniform}
          />
        </View>

        {/* Auto-cancel Section */}
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Auto-cancel</Text>
            <Text style={styles.settingSubtitle}>Auto-cancel if maid is unavailable 2 hrs before service</Text>
          </View>
          <Switch
            value={autoCancel}
            onValueChange={setAutoCancel}
            trackColor={{ false: "#E8F2ED", true: "#38E078" }}
            thumbColor={autoCancel ? "#38E078" : "#fff"}
            style={styles.switchUniform}
          />
        </View>

        {/* Preferred Replacement Maid Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferred Replacement Maid</Text>
        </View>

        <View style={styles.checkboxContainer}>
          <View style={styles.checkboxGrid}>
            <TouchableOpacity 
              style={[styles.checkboxRow, preferences.vaccinated && styles.checkboxRowActive]}
              onPress={() => handlePreferenceChange('vaccinated')}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, preferences.vaccinated && styles.checkboxChecked]}>
                {preferences.vaccinated && (
                  <Ionicons name="checkmark" size={16} color="#38E078" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Vaccinated</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.checkboxRow, preferences.experienced && styles.checkboxRowActive]}
              onPress={() => handlePreferenceChange('experienced')}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, preferences.experienced && styles.checkboxChecked]}>
                {preferences.experienced && (
                  <Ionicons name="checkmark" size={16} color="#38E078" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Experienced</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.checkboxRow, preferences.sameGender && styles.checkboxRowActive]}
              onPress={() => handlePreferenceChange('sameGender')}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, preferences.sameGender && styles.checkboxChecked]}>
                {preferences.sameGender && (
                  <Ionicons name="checkmark" size={16} color="#38E078" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Same Gender</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.checkboxRow, preferences.topRated && styles.checkboxRowActive]}
              onPress={() => handlePreferenceChange('topRated')}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, preferences.topRated && styles.checkboxChecked]}>
                {preferences.topRated && (
                  <Ionicons name="checkmark" size={16} color="#38E078" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Top Rated</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Default backup maid Section */}
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Default Backup Maid</Text>
            <Text style={styles.settingSubtitle}>Enable default backup maid option</Text>
          </View>
          <Switch
            value={enableBackupMaid}
            onValueChange={setEnableBackupMaid}
            trackColor={{ false: "#E8F2ED", true: "#38E078" }}
            thumbColor={enableBackupMaid ? "#38E078" : "#fff"}
            style={styles.switchUniform}
          />
        </View>

        {/* Bottom spacing for scroll */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button - Fixed at bottom, only if changed */}
      {isChanged && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: '#FAFAFA',
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
    color: '#0F1A12',
    textAlign: 'center',
    lineHeight: 23,
    paddingRight: 48, // Compensate for back button
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    minHeight: 72,
  },
  settingTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  settingTitle: {
    color: '#0F1A12',
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    lineHeight: 24,
  },
  settingSubtitle: {
    color: '#598C6E',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    lineHeight: 21,
  },
  switchUniform: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    marginHorizontal: 0,
    marginVertical: 0,
  },
  sectionHeader: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#0F1A12',
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 28,
  },
  checkboxContainer: {
    paddingHorizontal: 16,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 12,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#D4E3D9',
    marginBottom: 8,
    minWidth: '47%',
  },
  checkboxRowActive: {
    backgroundColor: '#E8F2ED',
    borderColor: '#38E078',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#D4E3D9',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#E8F2ED',
    borderColor: '#38E078',
  },
  checkboxLabel: {
    color: '#0F1A12',
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    lineHeight: 24,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  saveButton: {
    backgroundColor: '#38E078',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0F1A12',
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    lineHeight: 24,
  },
});
