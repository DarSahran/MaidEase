// components/GoogleSignInButton.tsx
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Initialize WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyArHQzajx9JkUd98ryqdToeTRFlyIjkQfo",
  authDomain: "maideasy-b9537.firebaseapp.com",
  projectId: "maideasy-b9537",
  storageBucket: "maideasy-b9537.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
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
