import AsyncStorage from '@react-native-async-storage/async-storage';

const TRACKING_SETTINGS_KEY = 'tracking_settings';

export async function saveTrackingSettings(settings: any) {
  await AsyncStorage.setItem(TRACKING_SETTINGS_KEY, JSON.stringify(settings));
}

export async function getTrackingSettings() {
  const settings = await AsyncStorage.getItem(TRACKING_SETTINGS_KEY);
  return settings ? JSON.parse(settings) : null;
}
