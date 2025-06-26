import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { ThemedView } from "../../components/ThemedView";

export default function MaidAuthLayout() {
  return (
    <ThemedView style={styles.container}>
      {/* You can add a logo or header here if needed */}
      <Stack
        screenOptions={{
          headerShown: false, // Hide header for auth screens
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});