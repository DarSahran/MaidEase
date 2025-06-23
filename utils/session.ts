import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const USER_KEY = 'maideasy_user';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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

/**
 * Helper to get current user ID from custom users table (by email or mobile).
 * Returns null if not found or on error.
 */
export async function getCurrentUserIdFromUsersTable() {
  // Get auth user
  let authUser = null;
  if (supabase && supabase.auth && supabase.auth.getUser) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) authUser = user;
    } catch {}
  }
  // Try to get email/mobile from session if not from auth
  let email = authUser?.email;
  let mobile = authUser?.phone;
  if (!email && !mobile) {
    const sessionUser = await getUser();
    if (sessionUser) {
      email = sessionUser.email;
      mobile = sessionUser.mobile;
    }
  }
  if (!email && !mobile) return null;
  // Query custom users table
  let query = supabase!.from('users').select('id').limit(1);
  if (email) query = query.eq('email', email);
  else if (mobile) query = query.eq('mobile', mobile);
  const { data, error } = await query.single();
  if (error || !data) return null; // Do not fallback to Auth user id
  return data.id;
}

// Universal session getter for user_id (Expo/React Native and web)
export async function getSession() {
  // Try AsyncStorage (React Native/Expo)
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const session = await AsyncStorage.getItem('session');
    if (session) {
      try {
        const sessionObj = JSON.parse(session);
        return sessionObj.user?.id || sessionObj.id;
      } catch {}
    }
  } catch {}
  // Try globalThis for web (if you ever run web)
  if (typeof globalThis !== 'undefined' && globalThis.session) {
    try {
      return globalThis.session.user?.id || globalThis.session.id;
    } catch {}
  }
  return null;
}
