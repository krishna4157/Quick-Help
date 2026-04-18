import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function FavouritesScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.emptyText}>Your cart is empty</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "gray", fontSize: 18 },
});
