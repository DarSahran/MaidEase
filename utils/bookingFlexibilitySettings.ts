import AsyncStorage from '@react-native-async-storage/async-storage';

const FLEXIBILITY_SETTINGS_KEY = 'booking_flexibility_settings';

export async function saveFlexibilitySettings(settings: any) {
  await AsyncStorage.setItem(FLEXIBILITY_SETTINGS_KEY, JSON.stringify(settings));
}

export async function getFlexibilitySettings() {
  const settings = await AsyncStorage.getItem(FLEXIBILITY_SETTINGS_KEY);
  return settings ? JSON.parse(settings) : null;
}
