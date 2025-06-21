import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ServicePage() {
  const { serviceId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{serviceId?.toString().replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} Service</Text>
      <Text>This is the {serviceId} service page.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FCF7',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
