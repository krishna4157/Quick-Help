import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Button,
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

// Component Imports
import { ThemedCard } from "@/components/themed-card";
import { getThemeColor } from "@/components/themed-color";
import Loader from "@/Loader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView } from "react-native";
import AwesomeButton from "react-native-really-awesome-button";
import { ThemedText } from "../components/themed-text";
import { ThemedView } from "../components/themed-view";
import { getAvailableProviders } from "../firebaseMethodsToGetData";

const { width } = Dimensions.get("window");

const ServiceDetails = () => {
  // 1. Declare all hooks at the very top
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isFav, setFav] = useState(false);
  const { t } = useTranslation();

  // Get theme color safely
  const iconColor = getThemeColor(true) || "black";
  const s = getThemeColor(true);

  // 2. Define the API logic
  const callProvidersApi = async () => {
    try {
      setLoading(true);
      const data = await getAvailableProviders(["Care Taker"]);
      console.log("Available Providers:", data);
      console.log("Query String Used: 'Care Taker'");
      console.log("Count of results:", data.length);
      console.log("Results:", JSON.stringify(data, null, 2));

      if (data) {
        setProviders(data);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Effect Hook
  useEffect(() => {
    if (isFocused) {
      //   callProvidersApi();
    }
  }, [isFocused]);

  // Render Item for FlatList
  const renderProvider = ({ item }) => (
    <Pressable onPress={() => alert(`Selected ${item.name}`)}>
      <ThemedCard style={styles.providerCard}>
        <View style={styles.cardContent}>
          <View style={styles.row}>
            <Image
              style={styles.profileImage}
              source={{
                uri: item.photoUrl || "https://via.placeholder.com/80",
              }}
            />
            <View style={styles.infoColumn}>
              <ThemedText style={{ color: "white" }} type="subtitle">
                {item.name}
              </ThemedText>
              <ThemedText style={{ color: "white" }} type="default">
                {item.workType}
              </ThemedText>
              <ThemedText style={{ color: "white" }}>
                Exp: {item.experience}
              </ThemedText>
            </View>
          </View>
          <ThemedText>{t("booking.verified")}</ThemedText>
        </View>

        <Button
          title={t("booking.addToFavorites")}
          onPress={() => alert("Added to favorites")}
        />
      </ThemedCard>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={38} color={iconColor} />
        </Pressable>
        <ThemedText type="subtitle" style={{ marginLeft: 10 }}>
          {t("booking.chooseExpert")}
        </ThemedText>
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          zIndex: 10,
          width: "100%",
          backgroundColor: s,
          paddingVertical: 10,
          justifyContent: "center",
          //   alignContent: "center",
          alignItems: "center",
          //   flexDirection: "row",
        }}
      >
        <AwesomeButton
          onPress={() => {
            alert("Booking Confirmed!");
            navigation.navigate("schedule-details");
          }}
          width={200}
          backgroundColor="green"
        >
          BOOK NOW
        </AwesomeButton>
        {/* <Button title="HELLO" /> */}
      </View>
      <ScrollView>
        <Image
          source={require("../CARD_IMAGES/ElectricServices.png")}
          style={{ width: "100%", height: 290 }}
        />
        <View
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View>
            <ThemedText type="title">Title</ThemedText>
            <ThemedText type="subtitle">Subtitle</ThemedText>
          </View>
          {/* <LottieView
            // source={{
            //   uri: "https://lottie.host/15b911fa-9c10-4eb1-a1b5-5e95970bc4b0/OAXgHu1yeu.lottie",
            // }}
            source={require("../Heart.json")}
            autoPlay
            loop
            style={{ width: 80, height: 80 }}
          /> */}
          <Pressable
            onPress={() => {
              // if(isFav){
              setFav(!isFav);
              // }
            }}
          >
            {isFav ? (
              <MaterialIcons name="favorite" size={40} color="red" />
            ) : (
              <MaterialIcons name="favorite-outline" size={40} color="grey" />
            )}
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <ThemedText type="default">
            kfsklfhsfk sfhs fskfjhs fiksjhf skfsfkslfh sfkshf
            skfhsjfsklhsdfskhlfsfs fskl fhsflksj fslkfjs fslkjf sfklsjfs flksjf
            lkj fsdklfj hsfksjh fslkfjsh kfslkfjhs fskljh fslks fskjh sslkjh
            sksj hssklv hsvksj hvslkjhs klsjhf slfksjhf slfs hflskjf slfskjh
            fslfskj sfksjhfsfkfhj skjhfs kljfhsslfjkhsflsifhjsfslfhslfksjfhsfl
            sfkusjhfsfslf sfslkfjhflsk hfslkfjhsefs fskufjsfsh fsklfjez f
          </ThemedText>
          <View style={{ flexDirection: "row" }}>
            <Ionicons name="shield-checkmark" size={24} color="green" />
            <ThemedText> Includes </ThemedText>
          </View>
          <View>
            <ThemedText>HELLO</ThemedText>

            <ThemedText>HELLO</ThemedText>
            <ThemedText>HELLO</ThemedText>
            <ThemedText>HELLO</ThemedText>
            <ThemedText>HELLO</ThemedText>

            <ThemedText>HELLO</ThemedText>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Ionicons name="shield-checkmark" size={24} color="red" />
            <ThemedText> Does not Include </ThemedText>
          </View>
          <View>
            <ThemedText>HELLO</ThemedText>

            <ThemedText>HELLO</ThemedText>
            <ThemedText>HELLO</ThemedText>
            <ThemedText>HELLO</ThemedText>
            <ThemedText>HELLO</ThemedText>

            <ThemedText>HELLO</ThemedText>
          </View>
        </View>
        {/* {new Array(200).fill("HELLO").map((a, b) => {
          return <Button title="HELLO" />;
        })} */}
      </ScrollView>
      {/* Loading Overlay */}
      {loading && <Loader />}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    // marginTop: 40, // Adjust for status bar
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  providerCard: {
    width: "95%",
    padding: 15,
    alignSelf: "center",
    borderRadius: 20,
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  infoColumn: {
    flexDirection: "column",
    paddingLeft: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});

export default ServiceDetails;
