import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'maideasy_user';

export async function saveUser(user: any) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser() {
  const user = await AsyncStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export async function clearUser() {
  await AsyncStorage.removeItem(USER_KEY);
}
