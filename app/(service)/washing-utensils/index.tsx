import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function WashingUtensilsService() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Washing Utensils Service</Text>
      <Text>This is the Washing Utensils service page.</Text>
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
