import { ThemedCard } from "@/components/themed-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");

export default function WalletScreen() {
  const walletBalance = useSelector(
    (state: any) => state.user.data?.walletBalance ?? 0,
  );
  const tintColor = useThemeColor({}, "tint");

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Wallet
        </ThemedText>
        <MaterialIcons
          name="account-balance-wallet"
          size={28}
          color={tintColor}
        />
      </View>

      <View style={styles.balanceCard}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.gradientCard}
        >
          <ThemedText style={styles.balanceLabel}>Available Balance</ThemedText>
          <ThemedText style={styles.balanceAmount}>
            {walletBalance.toLocaleString()} coins
          </ThemedText>
          {/* <View style={styles.balanceInfo}>
            <ThemedText style={styles.balanceInfoText}>
              Tap to add funds
            </ThemedText>
          </View> */}
        </LinearGradient>
      </View>

      <View style={styles.statsContainer}>
        <ThemedCard style={styles.statCard}>
          <ThemedText style={styles.statLabel}>Today's Spend</ThemedText>
          <ThemedText style={styles.statValue}>0 coins</ThemedText>
        </ThemedCard>
        <ThemedCard style={styles.statCard}>
          <ThemedText style={styles.statLabel}>Lifetime Total</ThemedText>
          <ThemedText style={styles.statValue}>0 coins</ThemedText>
        </ThemedCard>
      </View>

      <View style={styles.actionButtons}>
        {/* <ThemedCard style={styles.actionButton}>
          <MaterialIcons name="add" size={24} color={tintColor} />
          <ThemedText style={styles.actionLabel}>Add Money</ThemedText>
        </ThemedCard> */}
        <ThemedCard style={styles.actionButton}>
          <MaterialIcons name="payment" size={24} color={tintColor} />
          <ThemedText style={styles.actionLabel}>Payment History</ThemedText>
        </ThemedCard>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  balanceCard: {
    alignItems: "center",
    marginBottom: 30,
  },
  gradientCard: {
    width: width - 60,
    height: 200,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceLabel: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 10,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  balanceInfo: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  balanceInfoText: {
    color: "white",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
  },
  actionButton: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  actionLabel: {
    marginTop: 8,
    fontWeight: "600",
  },
});
