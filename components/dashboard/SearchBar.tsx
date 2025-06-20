import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="search" size={20} color="#4F964F" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="What do you need today?"
          placeholderTextColor="#4F964F"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F2E8',
    borderRadius: 12,
    alignItems: 'center',
    height: 48,
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 16,
    fontSize: 16,
    fontFamily: 'Lexend',
    color: '#4F964F',
    lineHeight: 24,
  },
});
