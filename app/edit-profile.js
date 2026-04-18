import * as ImagePicker from "expo-image-picker";
// 1. FIXED: Added collection, query, where, and getDocs
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
// 2. NEW: Added Storage functions for the image upload
import Loader from "@/Loader";
import Entypo from "@expo/vector-icons/Entypo";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import AwesomeButton from "react-native-really-awesome-button";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { ThemedText } from "../components/themed-text";
import { ThemedView } from "../components/themed-view";
import { auth, db } from "../firebaseConfig"; // Ensure storage is imported here

export default function EditProfile() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bio, setBio] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workType, setWorkType] = useState("");
  const [experience, setExperience] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const userData = useSelector((state) => state.user.data);

  // Initialize form fields with user data
  useEffect(() => {
    if (userData) {
      // Set name from displayName
      if (userData.displayName) {
        setName(userData.displayName);
      }
      // Set email from email
      if (userData.email) {
        setContactEmail(userData.email);
      }
      // Set mobile number
      if (userData.mobileNumber) {
        setMobileNumber(userData.mobileNumber);
      }
      // Set location from location.cityName
      if (userData.location?.cityName) {
        setLocation(userData.location.cityName);
        setLatitude(userData.location.latitude);
        setLongitude(userData.location.longitude);
      }
      // Set profile photo from photoURL
      if (userData.photoURL) {
        setImageUri(userData.photoURL);
      }
    }
  }, [userData]);

  // const contactEmail = ""
  // auth.currentUser ? auth.currentUser.email : "";
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
  const IMGBB_API_KEY = "3b754360548ccba1b8004206cd7c222b";
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const getLocationData = async () => {
    setLocationLoading(true);
    try {
      // Request foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("alerts.permissionDenied"), t("alerts.locationRequired"));
        setLocationLoading(false);
        return;
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { coords } = currentLocation;

      // Reverse geocode to get city name
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const cityName =
          reverseGeocode[0].city ||
          reverseGeocode[0].district ||
          "Unknown Location";
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        setLocation(cityName);
        Alert.alert(
          t("alerts.success"),
          `${t("location.locationLabel")}: ${cityName}`,
        );
      } else {
        Alert.alert(t("alerts.error"), t("alerts.failedToGetLocation"));
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert(t("alerts.error"), t("alerts.failedToGetLocation"));
    } finally {
      setLocationLoading(false);
    }
  };

  const submitWorkerData = async () => {
    setLoading(true);
    if (
      !imageUri ||
      !contactEmail ||
      !workType ||
      !experience ||
      !location ||
      !latitude ||
      !longitude ||
      !name ||
      !bio
    ) {
      Alert.alert(t("alerts.error"), t("workerRegistration.fillAllFields"));
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      Alert.alert(t("alerts.error"), t("workerRegistration.invalidEmail"));
      setLoading(false);
      return;
    }

    try {
      // 1. CHECK FOR DUPLICATE EMAIL IN FIRESTORE
      const providersRef = collection(db, "providers");
      const emailQuery = query(
        providersRef,
        where("email", "==", contactEmail),
      );
      const querySnapshot = await getDocs(emailQuery);

      if (!querySnapshot.empty) {
        Alert.alert(t("alerts.error"), t("workerRegistration.profileExists"));
        setLoading(false);
        return;
      }

      // 2. UPLOAD IMAGE TO FIREBASE STORAGE
      const userId = auth.currentUser.uid;
      // let photoUrl = ""; // Initialize photoUrl

      // try {
      //   const response = await fetch(imageUri);
      //   const blob = await response.blob();
      //   const storageRef = ref(storage, `worker_photos/${userId}.jpg`);

      //   await uploadBytes(storageRef, blob);
      //   photoUrl = await getDownloadURL(storageRef); // Assign the actual URL
      // } catch (uploadError) {
      //   console.error("Image upload failed:", uploadError);
      //   Alert.alert("Error", "Failed to upload image.");
      //   return; // Stop if image fails
      // }
      // const userId = auth.currentUser.uid;
      let photoUrl = "";

      try {
        const data = new FormData();
        data.append("image", {
          uri: imageUri,
          type: "image/jpeg",
          name: "profile.jpg",
        });

        // Send the POST request to ImgBB
        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          {
            method: "POST",
            body: data,
            headers: {
              Accept: "application/json",
              "Content-Type": "multipart/form-data",
            },
          },
        );

        const result = await response.json();

        if (result.success) {
          // ImgBB returns a display URL.
          photoUrl = result.data.url;
        } else {
          throw new Error(result.error.message);
        }
      } catch (uploadError) {
        setLoading(false);

        console.error("ImgBB upload failed:", uploadError);
        Alert.alert(t("alerts.error"), t("workerRegistration.uploadFailed"));
        return;
      }

      // 3. SAVE TO FIRESTORE
      const workerData = {
        name: name,
        mobileNumber,
        email: contactEmail,
        workType,
        experience,
        location: {
          cityName: location,
          latitude: latitude,
          longitude: longitude,
        },
        photoUrl, // This now holds the valid URL from Firebase Storage
        isAvailable: true,
        //
        //       "rating": 4.8,
        // "reviewCount": 112,
        verified: false,
        // "startingPrice": "₹500 for visit",
        // "phoneNumber": "+91 98765 12345",
        bio: bio || "",

        //
      };

      await setDoc(doc(db, "providers", userId), workerData);
      setLoading(false);
      Alert.alert(t("alerts.success"), t("alerts.profileSavedSuccessfully"));
    } catch (error) {
      setLoading(false);
      console.error("Upload error:", error);
      Alert.alert(t("alerts.error"), t("workerRegistration.saveFailed"));
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 35}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              width: "100%",
              alignSelf: "center",
              paddingTop: 50,
              padding: 15,
            }}
          >
            {loading && <Loader />}
            <Pressable onPress={pickImage}>
              <Image
                source={imageUri ? { uri: imageUri } : null}
                style={{
                  width: 150,
                  height: 150,
                  marginVertical: 10,
                  borderColor: "green",
                  borderWidth: 2,
                  backgroundColor: "grey",
                  borderRadius: 32,
                }}
              />
              <View style={{ left: 120, marginTop: -40 }}>
                <Entypo
                  name="circle-with-plus"
                  size={40}
                  color="green"
                  style={{
                    backgroundColor: "grey",
                    alignSelf: "flex-start",
                    borderRadius: 24,
                  }}
                />
              </View>
            </Pressable>
            {/* <Pressable
        style={{
          alignItems: "center",
          marginBottom: 20,
          backgroundColor: "red",
          padding: 10,
          width: 200,
        }}
        onPress={pickImage}
      >
        <Text style={{ fontSize: 18 }}>Upload Profile Photo</Text>
      </Pressable> */}
            <View style={{ paddingTop: 20 }} />
            <ThemedText>{t("profile.name")}</ThemedText>
            <TextInput
              placeholder={t("profile.name")}
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <ThemedText>{t("profile.mobileNumber")}</ThemedText>
            <TextInput
              placeholder={t("placeholders.phone")}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <ThemedText>{t("profile.email")}</ThemedText>
            <TextInput
              placeholder={t("profile.email")}
              value={contactEmail}
              onChangeText={setContactEmail}
              // onChangeText={setWorkType}
              // editable={false}
              style={styles.input}
            />

            <ThemedText>{t("profile.bio")}</ThemedText>
            <TextInput
              placeholder={t("profile.bio")}
              value={bio}
              multiline={true}
              onChangeText={setBio}
              // editable={false}
              style={styles.input}
            />
            <ThemedText>{t("location.locationLabel")}</ThemedText>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              <TextInput
                placeholder={t("location.locationLabel")}
                value={location}
                onChangeText={setLocation}
                editable={false}
                style={[styles.input, { flex: 1 }]}
              />
              <Pressable
                onPress={getLocationData}
                disabled={locationLoading}
                style={{
                  backgroundColor: locationLoading ? "grey" : "green",
                  borderRadius: 12,
                  padding: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 5,
                }}
              >
                <ThemedText style={{ color: "white", fontWeight: "bold" }}>
                  {locationLoading
                    ? t("common.requesting")
                    : t("location.getLocation")}
                </ThemedText>
              </Pressable>
            </View>
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <AwesomeButton
                width={200}
                backgroundColor="green"
                onPress={submitWorkerData}
              >
                {t("profile.saveProfile")}
              </AwesomeButton>
            </View>
            <Modal
              onDismiss={() => {
                alert("called");
              }}
              transparent
              visible={showWorkTypeModal}
              onRequestClose={() => {
                setShowWorkTypeModal(false);
              }}
              // presentationStyle=""
              // style={{ marginTop: 100 }}
            >
              <Pressable
                // pointerEvents="none"
                style={{ flex: 1, marginBottom: -20 }}
                onPress={() => {
                  // alert("hello");
                  setShowWorkTypeModal(false);
                }}
              ></Pressable>
              <SafeAreaView
                edges={["bottom"]}
                style={{
                  backgroundColor: "transparent",
                  zIndex: 10,
                  height: 300,
                }}
              >
                <ThemedView
                  style={{
                    padding: 15,
                    paddingLeft: 35,
                    borderRadius: 20,
                    elevation: 5,
                    // backgroundColor: "red",
                    borderTopWidth: 2,
                    // overflow: "hidden",
                    borderColor: "grey",
                    height: 400,
                    width: "100%",
                    bottom: 0,
                    position: "absolute",
                    paddingBottom: 30,
                  }}
                >
                  <ThemedText style={{ marginBottom: 20 }} type="subtitle">
                    {t("profile.chooseWorkType")}
                  </ThemedText>
                  <FlatList
                    contentContainerStyle={{ flexGrow: 1 }}
                    data={[
                      "tailor",
                      "plumber",
                      "electrician",
                      "carpenter",
                      "painter",
                      "maid",
                      "houseKeeper",
                      "nursing",
                      "gardener",
                      "chakali",
                      "careTaker",
                      "cook",
                      "restRoomCleaner",
                    ]}
                    renderItem={({ index, item }) => {
                      const displayText = t(`professions.${item}`);
                      return (
                        <Pressable
                          onPress={() => {
                            setShowWorkTypeModal(false);
                            setWorkType(displayText);
                          }}
                          style={{
                            padding: 15,
                            backgroundColor:
                              workType === displayText
                                ? "green"
                                : "transparent",
                            borderRadius: 10,
                          }}
                        >
                          <ThemedText type="defaultSemiBold">
                            {displayText}
                          </ThemedText>
                        </Pressable>
                      );
                    }}
                  />
                </ThemedView>
              </SafeAreaView>
            </Modal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
});
