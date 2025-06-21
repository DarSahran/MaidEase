// components/GoogleSignInButton.tsx
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Initialize WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// Your Firebase config (now using env variables)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default function GoogleSignInButton() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace with your actual web client ID
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // For iOS if needed
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com', // For Android if needed
    scopes: ['profile', 'email'],
  });

  React.useEffect(() => {
    async function handleSignIn() {
      if (response?.type === 'success') {
        try {
          const { id_token } = response.params;
          const auth = getAuth(app);
          const credential = GoogleAuthProvider.credential(id_token);
          
          await signInWithCredential(auth, credential);
          
          // Handle successful sign-in
          Alert.alert("Success", "Signed in with Google!");
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          Alert.alert("Error", errorMessage);
        }
      }
    }
    
    if (response) handleSignIn();
  }, [response]);

  return (
    <TouchableOpacity
      style={styles.socialButton}
      disabled={!request}
      onPress={() => promptAsync()}
      activeOpacity={0.7}
    >
      <Text style={styles.socialButtonText}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    socialButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 24,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        // Shadow for Android
        elevation: 3,
    },
    socialButtonText: {
        color: '#121714',
        fontSize: 16,
        fontWeight: '600',
    },
});
