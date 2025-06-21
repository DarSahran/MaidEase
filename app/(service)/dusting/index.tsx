import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DustingService() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dusting Service</Text>
      <Text>This is the Dusting service page.</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
