import { ThemedCard } from "@/components/themed-card";
import { getThemeColor } from "@/components/themed-color";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
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
  const route = useRoute<any>();
  const { t } = useTranslation();
  const themeColor = getThemeColor(false);

  // Get dynamic data from route params
  const service = route.params?.service || {};
  const theme = route.params?.theme || {};
  const highlights = route.params?.highlights || [];
  const exclusionList = route.params?.exclusionList || [];

  // Service data with fallbacks
  const serviceName = service.serviceType || service.name || "Service";
  const serviceImage = service.photoUrl
    ? { uri: service.photoUrl }
    : theme.image || require("../CARD_IMAGES/ElectricServices.png");
  const price = service.price || service.amount || "250";
  const duration = service.timeTaken || "30-45 mins";
  const rating = service.rating || "4.8";
  const reviewCount = service.reviewCount || "1,247";
  alert(JSON.stringify(service));
  // Parse important notes if not passed as highlights
  const importantNotes =
    highlights.length > 0
      ? highlights
      : service.importantNotes
        ? Array.isArray(service.importantNotes)
          ? service.importantNotes
          : String(service.importantNotes)
              .split(",")
              .map((s: string) => s.trim())
        : [];

  // Parse exclusions if not passed
  const exclusions =
    exclusionList.length > 0
      ? exclusionList
      : service.exclusions
        ? Array.isArray(service.exclusions)
          ? service.exclusions
          : String(service.exclusions)
              .split(",")
              .map((s: string) => s.trim())
        : [];

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
          {serviceName}
        </ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Image */}
        <Image
          source={serviceImage}
          style={styles.heroImage}
          contentFit="cover"
        />

        {/* Service Overview */}
        <View style={styles.section}>
          <View style={styles.priceTag}>
            <ThemedText style={styles.priceCurrency}>₹</ThemedText>
            <ThemedText style={styles.priceAmount}>{price}</ThemedText>
            <ThemedText style={styles.priceLabel}>/service</ThemedText>
          </View>

          <View style={styles.ratingContainer}>
            <ThemedText style={styles.rating}>
              {rating} ★ ({reviewCount} reviews)
            </ThemedText>
            <View style={styles.timeEstimate}>
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
              <ThemedText style={styles.timeText}>{duration} mins</ThemedText>
            </View>
          </View>
        </View>

        {/* What's Included */}
        {importantNotes.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("service.included")}
            </ThemedText>
            <View style={styles.featureList}>
              {importantNotes.map((feature: string, index: number) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.checkIcon}>
                    <Ionicons
                      name="checkmark-sharp"
                      size={20}
                      color="#10B981"
                    />
                  </View>
                  <ThemedText style={styles.featureText}>{feature}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* What's Not Included */}
        {exclusions.length > 0 && (
          <View style={styles.section}>
            <ThemedText
              type="subtitle"
              style={[styles.sectionTitle, styles.exclusionTitle]}
            >
              {t("service.notIncluded")}
            </ThemedText>
            <View style={styles.featureList}>
              {exclusions.map((exclusion: string, index: number) => (
                <View
                  key={index}
                  style={[styles.featureItem, styles.exclusionItem]}
                >
                  <View style={styles.xIcon}>
                    <Ionicons name="close-sharp" size={24} color="#EF4444" />
                  </View>
                  <ThemedText style={styles.featureText}>
                    {exclusion}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Important Notes */}
        {service.notes && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("service.importantNotes")}
            </ThemedText>
            <View style={styles.notesGrid}>
              <ThemedCard style={styles.noteCard}>
                <ThemedText style={styles.noteText}>{service.notes}</ThemedText>
              </ThemedCard>
            </View>
          </View>
        )}

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
      <View style={styles.fixedButton}>
        <AwesomeButton
          onPress={() =>
            navigation.navigate("schedule-details", {
              service,
              highlights: importantNotes,
              exclusionList: exclusions,
              theme,
            })
          }
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
    paddingTop: 10,
    paddingBottom: 15,
    // backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
    paddingHorizontal: 20,
    // backgroundColor: "red",
  },
  headerTitle: {
    position: "absolute",
    alignSelf: "center",
    width: "100%",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    // backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    // color: "white",
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
    fontSize: 28,
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
    // color: "white",
  },
  notesGrid: {
    flexDirection: "column",
    flexWrap: "wrap",
    width: "100%",
    gap: 12,
    justifyContent: "space-between",
  },
  noteCard: {
    padding: 16,
    borderRadius: 10,
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
    // color: "white",
  },
  highlightLabel: {
    fontSize: 14,
    // color: "rgba(255, 255, 255, 0.8)",
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
