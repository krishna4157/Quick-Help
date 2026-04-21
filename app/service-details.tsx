import { ThemedCard } from "@/components/themed-card";
import { getThemeColor } from "@/components/themed-color";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AwesomeButton from "react-native-really-awesome-button";

const { width } = Dimensions.get("window");

const ServiceDetails = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const themeColor = getThemeColor(false);

  const fanServiceHighlights = [
    "Ceiling fan cleaning & dusting",
    "Blade alignment & balancing",
    "Motor inspection & lubrication",
    "Electrical connection check",
    "Safety switch testing",
    "Remote functionality test",
    "🕐 Service time: 30-45 mins",
  ];

  const exclusions = [
    "Ceiling fan installation (separate service)",
    "Wall fan or pedestal fan service",
    "Major electrical repairs",
    "Fan regulator replacement",
    "Warranty void repairs",
  ];

  const importantNotes = [
    "⚠️ Remove hanging items before service",
    "⚠️ Ensure good ventilation during service",
    "⚠️ Customer to switch off fan power",
    "⚠️ Service during 7AM-8PM only",
    "⭐ 100% satisfaction guarantee",
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Back Button & Title */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back-outline" size={28} color={themeColor} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          {t("service.fanRepair")}
        </ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Image */}
        <Image
          source={require("../CARD_IMAGES/ElectricServices.png")}
          style={styles.heroImage}
          contentFit="cover"
        />

        {/* Service Overview */}
        <View style={styles.section}>
          <View style={styles.priceTag}>
            <ThemedText style={styles.priceCurrency}>₹</ThemedText>
            <ThemedText style={styles.priceAmount}>250</ThemedText>
            <ThemedText style={styles.priceLabel}>/service</ThemedText>
          </View>

          <View style={styles.ratingContainer}>
            <ThemedText style={styles.rating}>4.8 ★ (1,247 reviews)</ThemedText>
            <View style={styles.timeEstimate}>
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
              <ThemedText style={styles.timeText}>30-45 mins</ThemedText>
            </View>
          </View>
        </View>

        {/* What's Included */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("service.included")}
          </ThemedText>
          <View style={styles.featureList}>
            {fanServiceHighlights.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-sharp" size={20} color="#10B981" />
                </View>
                <ThemedText style={styles.featureText}>{feature}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* What's Not Included */}
        <View style={styles.section}>
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, styles.exclusionTitle]}
          >
            {t("service.notIncluded")}
          </ThemedText>
          <View style={styles.featureList}>
            {exclusions.map((exclusion, index) => (
              <View
                key={index}
                style={[styles.featureItem, styles.exclusionItem]}
              >
                <View style={styles.xIcon}>
                  <Ionicons name="close-sharp" size={24} color="#EF4444" />
                </View>
                <ThemedText style={styles.featureText}>{exclusion}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("service.importantNotes")}
          </ThemedText>
          <View style={styles.notesGrid}>
            {importantNotes.map((note, index) => (
              <ThemedCard key={index} style={styles.noteCard}>
                <ThemedText style={styles.noteText}>{note}</ThemedText>
              </ThemedCard>
            ))}
          </View>
        </View>

        {/* Service Highlights */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("service.highlights")}
          </ThemedText>
          <View style={styles.highlights}>
            <View
              style={[styles.highlightItem, { borderLeftColor: "#3B82F6" }]}
            >
              <ThemedText style={styles.highlightNumber}>24</ThemedText>
              <ThemedText style={styles.highlightLabel}>7 Support</ThemedText>
            </View>
            <View
              style={[styles.highlightItem, { borderLeftColor: "#10B981" }]}
            >
              <ThemedText style={styles.highlightNumber}>100%</ThemedText>
              <ThemedText style={styles.highlightLabel}>Guarantee</ThemedText>
            </View>
            <View
              style={[styles.highlightItem, { borderLeftColor: "#F59E0B" }]}
            >
              <ThemedText style={styles.highlightNumber}>15K+</ThemedText>
              <ThemedText style={styles.highlightLabel}>
                Happy Customers
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Book Now Button */}
      {/* <LinearGradient
        colors={["#10B981", "#059669"]}
        style={styles.fixedButton}
      > */}
      <View style={styles.fixedButton}>
        <AwesomeButton
          onPress={() => navigation.navigate("schedule-details")}
          width={width - 40}
          height={56}
          borderRadius={28}
          backgroundColor="green"
        >
          <ThemedText style={styles.bookButtonText}>
            {t("service.bookNow")}
          </ThemedText>
        </AwesomeButton>
      </View>
      {/* </LinearGradient> */}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    // flex: 1,
    position: "absolute",
    alignSelf: "center",
    width: "100%",
    // backgroundColor: "red",
    textAlign: "center",
    // fontWeight: "800",
  },
  scrollView: {
    flex: 1,
    // paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    color: "white",
  },
  exclusionTitle: {
    color: "#EF4444",
  },
  heroImage: {
    width: "100%",
    height: 250,
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  priceCurrency: {
    fontSize: 24,
    fontWeight: "900",
    color: "#10B981",
    marginRight: 4,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: "900",
    color: "#10B981",
  },
  priceLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rating: {
    fontSize: 18,
    fontWeight: "700",
  },
  timeEstimate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontWeight: "600",
    color: "#F59E0B",
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  exclusionItem: {
    opacity: 0.7,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  xIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: "white",
  },
  notesGrid: {
    flexDirection: "column",
    flexWrap: "wrap",
    width: "100%",
    gap: 12,
    justifyContent: "space-between",
  },
  noteCard: {
    flex: 0.48,
    padding: 16,
    height: 100,
    justifyContent: "center",
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    color: "white",
  },
  highlights: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  highlightItem: {
    alignItems: "center",
    paddingVertical: 16,
    borderLeftWidth: 4,
    paddingLeft: 12,
  },
  highlightNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "white",
  },
  highlightLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  fixedButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 28,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
  },
});

export default ServiceDetails;
