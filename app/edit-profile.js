import * as ImagePicker from "expo-image-picker";
// 1. FIXED: Added collection, query, where, and getDocs
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
// 2. NEW: Added Storage functions for the image upload
import Loader from "@/Loader";
import { PopupContext } from "@/PopupProvider";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
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
  const { customAlert } = useContext(PopupContext);
  // Initialize form fields with user data
  useEffect(() => {
    if (userData) {
      // Set name from displayName
      if (userData.displayName || userData.firstName || userData.lastName) {
        setName(
          userData.displayName || userData.firstName + " " + userData.lastName,
        );
      }
      // alert(JSON.stringify(userData));
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
  // const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
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
        customAlert(t("alerts.permissionDenied"), t("alerts.locationRequired"));
        // customAlert();
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
        // customAlert(
        //   t("alerts.success"),
        //   `${t("location.locationLabel")}: ${cityName}`,
        // );
        customAlert(
          t("alerts.success"),
          `${t("location.locationLabel")}: ${cityName}`,
        );
      } else {
        customAlert(t("alerts.error"), t("alerts.failedToGetLocation"));
      }
    } catch (error) {
      console.error("Location error:", error);
      customAlert(t("alerts.error"), t("alerts.failedToGetLocation"));
    } finally {
      setLocationLoading(false);
    }
  };

  const submitWorkerData = async () => {
    setLoading(true);
    if (
      // !imageUri ||
      !contactEmail ||
      // !workType ||
      // !experience ||
      !location ||
      !latitude ||
      !longitude ||
      !name
      // !bio
    ) {
      customAlert(t("alerts.error"), t("workerRegistration.fillAllFields"));
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      customAlert(t("alerts.error"), t("workerRegistration.invalidEmail"));
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
        customAlert(t("alerts.error"), t("workerRegistration.profileExists"));
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
      //   customAlert("Error", "Failed to upload image.");
      //   return; // Stop if image fails
      // }
      // const userId = auth.currentUser.uid;
      let photoUrl = "";

      if (imageUri) {
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
          customAlert(t("alerts.error"), t("workerRegistration.uploadFailed"));
          return;
        }
      }

      // 3. SAVE TO FIRESTORE
      const workerData = {
        name: name,
        mobileNumber,
        email: contactEmail,
        // workType,
        // experience,
        location: {
          cityName: location,
          latitude: latitude,
          longitude: longitude,
        },
        // photoUrl: photoUrl, // This now holds the valid URL from Firebase Storage
        // isAvailable: true,
        //
        //       "rating": 4.8,
        // "reviewCount": 112,
        // verified: false,
        // "startingPrice": "₹500 for visit",
        // "phoneNumber": "+91 98765 12345",
        // bio: bio || "",

        //
      };

      await updateDoc(doc(db, "users", contactEmail), workerData);
      setLoading(false);
      customAlert(t("alerts.success"), t("alerts.profileSavedSuccessfully"), [
        {
          title: "OK",
          onPress: (e) => {
            navigation.navigate("tab-layout", { screen: "index" });
            e.close();
          },
        },
      ]);
    } catch (error) {
      setLoading(false);
      console.error("Upload error:", error);
      customAlert(t("alerts.error"), t("workerRegistration.saveFailed"));
    }
  };

  const renderInput = ({
    icon,
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    editable,
    multiline,
  }) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        <FontAwesome
          name={icon}
          size={14}
          color="#667eea"
          style={styles.labelIcon}
        />
        <ThemedText style={styles.labelText}>{label}</ThemedText>
      </View>
      <View
        style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="rgba(150,150,150,0.6)"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || "default"}
          editable={editable !== false}
          multiline={multiline || false}
          numberOfLines={multiline ? 4 : 1}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
      </View>
    </View>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 35}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {loading && <Loader />}

            {/* Header Section with Profile Image */}
            <View style={styles.headerSection}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
              >
                <Pressable onPress={pickImage} style={styles.imageWrapper}>
                  <Image
                    source={
                      imageUri
                        ? { uri: imageUri }
                        : require("../assets/images/icon.png")
                    }
                    style={styles.profileImage}
                  />
                  <View style={styles.cameraBadge}>
                    <FontAwesome name="camera" size={14} color="#fff" />
                  </View>
                </Pressable>
                <ThemedText style={styles.headerTitle}>
                  {t("profile.editProfile")}
                </ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                  {name || t("profile.name")}
                </ThemedText>
              </LinearGradient>
            </View>

            {/* Form Sections */}
            <View style={styles.formContainer}>
              {/* Personal Info Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBg}>
                    <FontAwesome name="user" size={14} color="#667eea" />
                  </View>
                  <ThemedText style={styles.sectionTitle}>
                    {t("profile.personalInfo") || "Personal Information"}
                  </ThemedText>
                </View>

                {renderInput({
                  icon: "user",
                  label: t("profile.name"),
                  placeholder: t("profile.name"),
                  value: name,
                  onChangeText: setName,
                })}

                {renderInput({
                  icon: "phone",
                  label: t("profile.mobileNumber"),
                  placeholder: t("placeholders.phone"),
                  value: mobileNumber,
                  onChangeText: setMobileNumber,
                  keyboardType: "decimal-pad",
                })}

                {renderInput({
                  icon: "envelope",
                  label: t("profile.email"),
                  placeholder: t("profile.email"),
                  value: contactEmail,
                  onChangeText: setContactEmail,
                })}
              </View>

              {/* Location Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBg}>
                    <FontAwesome name="map-marker" size={14} color="#667eea" />
                  </View>
                  <ThemedText style={styles.sectionTitle}>
                    {t("profile.locationInfo") || "Location"}
                  </ThemedText>
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.labelRow}>
                    <FontAwesome
                      name="map-pin"
                      size={14}
                      color="#667eea"
                      style={styles.labelIcon}
                    />
                    <ThemedText style={styles.labelText}>
                      {t("location.locationLabel")}
                    </ThemedText>
                  </View>
                  <View style={styles.locationRow}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                      <TextInput
                        placeholder={t("location.locationLabel")}
                        placeholderTextColor="rgba(150,150,150,0.6)"
                        value={location}
                        onChangeText={setLocation}
                        editable={false}
                        style={styles.input}
                      />
                    </View>
                    <Pressable
                      onPress={getLocationData}
                      disabled={locationLoading}
                      style={[
                        styles.locationButton,
                        locationLoading && styles.locationButtonLoading,
                      ]}
                    >
                      <LinearGradient
                        colors={["#10b981", "#059669"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.locationButtonGradient}
                      >
                        <FontAwesome
                          name={locationLoading ? "spinner" : "location-arrow"}
                          size={16}
                          color="#fff"
                          style={
                            locationLoading && {
                              transform: [{ rotate: "45deg" }],
                            }
                          }
                        />
                        <ThemedText style={styles.locationButtonText}>
                          {locationLoading
                            ? t("common.requesting")
                            : t("location.getLocation")}
                        </ThemedText>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Save Button */}
              <Pressable
                onPress={submitWorkerData}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                ]}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <FontAwesome name="check" size={18} color="#fff" />
                  <ThemedText style={styles.saveButtonText}>
                    {t("profile.saveProfile")}
                  </ThemedText>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
  // Header Section
  headerSection: {
    width: "100%",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerGradient: {
    width: "100%",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#667eea",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  headerTitle: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 22,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
  },
  // Form Section
  formContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  section: {
    backgroundColor: "rgba(102, 126, 234, 0.04)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(102, 126, 234, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
  },
  // Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  labelIcon: {
    marginRight: 4,
  },
  labelText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: "rgba(102, 126, 234, 0.06)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.15)",
    overflow: "hidden",
  },
  inputWrapperMultiline: {
    minHeight: 100,
  },
  input: {
    padding: 14,
    fontSize: 15,
    fontFamily: "PlusJakartaSans",
    color: "#333",
    minHeight: 50,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  // Work Type Selector
  workTypeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(102, 126, 234, 0.06)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.15)",
    padding: 14,
    minHeight: 50,
  },
  workTypeText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: "#333",
  },
  workTypePlaceholder: {
    color: "rgba(150,150,150,0.6)",
  },
  // Location Section
  locationRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  locationButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  locationButtonLoading: {
    opacity: 0.7,
  },
  locationButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationButtonText: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
  },
  // Save Button
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSafeArea: {
    backgroundColor: "transparent",
    zIndex: 10,
    height: 400,
  },
  modalContent: {
    padding: 20,
    paddingTop: 12,
    borderRadius: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    height: 420,
    width: "100%",
    bottom: 0,
    position: "absolute",
    paddingBottom: 30,
    borderTopWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.15)",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(150,150,150,0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    marginBottom: 16,
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    textAlign: "center",
  },
  modalList: {
    paddingBottom: 20,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "rgba(102, 126, 234, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.08)",
  },
  modalItemSelected: {
    backgroundColor: "rgba(102, 126, 234, 0.12)",
    borderColor: "rgba(102, 126, 234, 0.25)",
  },
  modalItemIcon: {
    marginRight: 14,
  },
  modalItemIconSelected: {},
  modalItemText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: "#555",
  },
  modalItemTextSelected: {
    fontFamily: "Montserrat-SemiBold",
    color: "#667eea",
  },
});
