import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { ThemedView } from "../../components/ThemedView";

export default function MaidDashboardLayout() {
  return (
    <ThemedView style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false, // Hide header for dashboard screens
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});