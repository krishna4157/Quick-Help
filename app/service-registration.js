import * as ImagePicker from "expo-image-picker";
// 1. FIXED: Added collection, query, where, getDocs, and getDoc
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
// 2. NEW: Added Storage functions for the image upload
import Loader from "@/Loader";
import { PopupContext } from "@/PopupProvider";
import Entypo from "@expo/vector-icons/Entypo";
import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
import { ThemedText } from "../components/themed-text";
import { ThemedView } from "../components/themed-view";
import { db } from "../firebaseConfig"; // Ensure storage is imported here

// Service Categories with Work Types
const serviceCategories = [
  {
    category: "Electrical Services",
    workTypes: [
      "electrician",
      "acTechnician",
      "wiringTechnician",
      "inverterTechnician",
    ],
  },
  {
    category: "Plumbing Services",
    workTypes: [
      "plumber",
      "pipeFitter",
      "drainageTechnician",
      "waterTankCleaner",
    ],
  },
  {
    category: "Beauty Services",
    workTypes: ["beautician", "makeupArtist", "hairStylist", "mehendiArtist"],
  },
  {
    category: "Laundry Services",
    workTypes: ["laundryWorker", "dryCleaner", "ironingStaff"],
  },
  {
    category: "Care Takers",
    workTypes: [
      "careTaker",
      "nursing",
      "babyCareTaker",
      "oldAgeCareTaker",
      "patientCareTaker",
    ],
  },
  {
    category: "Home Services",
    workTypes: [
      "maid",
      "houseKeeper",
      "cook",
      "gardener",
      "cleaner",
      "restRoomCleaner",
      "chakali",
    ],
  },
  {
    category: "Construction Services",
    workTypes: [
      "mason",
      "carpenter",
      "painter",
      "welder",
      "tilesWorker",
      "materialSupplier",
      "steelFixer",
      "popWorker",
    ],
  },
  {
    category: "Rented Bikes and Cars",
    workTypes: [
      "vehicleOwner",
      "bikeRentalOwner",
      "carRentalOwner",
      "travelAgent",
    ],
  },
  {
    category: "Parcel Delivery",
    workTypes: ["deliveryBoy", "courierStaff", "pickupAgent", "logisticsStaff"],
  },
  {
    category: "Xerox and Printing",
    workTypes: [
      "xeroxOperator",
      "printingStaff",
      "laminationStaff",
      "dtpOperator",
    ],
  },
  {
    category: "Security Services",
    workTypes: ["securityGuard", "watchman", "gateKeeper", "bouncer"],
  },
  {
    category: "Driver Services",
    workTypes: [
      "driver",
      "personalDriver",
      "truckDriver",
      "tempoDriver",
      "schoolDriver",
    ],
  },
  {
    category: "Mechanic Services",
    workTypes: [
      "mechanic",
      "bikeMechanic",
      "carMechanic",
      "dieselMechanic",
      "cycleMechanic",
      "punctureRepairer",
    ],
  },
  {
    category: "Gold Ornament Making",
    workTypes: [
      "goldsmith",
      "jewelleryMaker",
      "silverSmith",
      "diamondSetter",
      "polishingWorker",
    ],
  },
  {
    category: "Packers and Movers",
    workTypes: ["packer", "mover", "loader", "unloader", "transportDriver"],
  },
  // {
  //   category: "Computer Services",
  //   workTypes: [
  //     "computerTechnician",
  //     "laptopTechnician",
  //     "printerTechnician",
  //     "dataEntryOperator",
  //   ],
  // },
  // {
  //   category: "Mobile Services",
  //   workTypes: [
  //     "mobileTechnician",
  //     "screenRepairTechnician",
  //     "softwareTechnician",
  //   ],
  // },
  // {
  //   category: "Event Services",
  //   workTypes: [
  //     "photographer",
  //     "videographer",
  //     "decorator",
  //     "dj",
  //     "cateringStaff",
  //   ],
  // },
  {
    category: "Pet Services",
    workTypes: ["petCareTaker", "petGroomer", "dogWalker"],
  },
];

export default function ServiceRegistration() {
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
  const { customAlert } = useContext(PopupContext);

  // Category and Work Type state
  const [selectedCategory, setSelectedCategory] = useState("");

  // Get work types based on selected category
  const workTypesForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    const categoryData = serviceCategories.find(
      (cat) => cat.category === selectedCategory,
    );
    return categoryData ? categoryData.workTypes : [];
  }, [selectedCategory]);

  // Reset work type when category changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setWorkType(""); // Reset work type when category changes
  };

  // const contactEmail = ""
  // auth.currentUser ? auth.currentUser.email : "";

  const [serviceHighlights, setServiceHighlights] = useState([]);
  const [exclusions, setExclusions] = useState([]);
  const [importantNotes, setImportantNotes] = useState([]);
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [timeTaken, setTimeTaken] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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

  const submitWorkerData = async () => {
    setLoading(true);
    if (
      !importantNotes ||
      !exclusions ||
      !serviceHighlights ||
      !imageUri ||
      !category ||
      !price ||
      !serviceType ||
      !timeTaken ||
      !workType
    ) {
      customAlert(t("alerts.error"), t("workerRegistration.fillAllFields"), [
        { title: "OK", onPress: (e) => e.close() },
      ]);
      // customAlert();
      // customAlert(t("alerts.error"), t("workerRegistration.fillAllFields"));
      setLoading(false);
      return;
    }

    try {
      // 1. CHECK FOR DUPLICATE SERVICE (serviceType must be unique)
      const servicesRef = collection(db, "services");
      // Use serviceType as the unique document ID
      const uniqueKey1 = serviceType.toLowerCase().trim();

      // Check if a service with this serviceType already exists
      const existingDocRef = doc(db, "services", uniqueKey1);
      const existingDoc = await getDoc(existingDocRef);

      if (existingDoc.exists()) {
        customAlert(
          t("alerts.error"),
          "A service with this name already exists. Please use a different service name.",
        );
        setLoading(false);
        return;
      }

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
        customAlert(t("alerts.error"), t("workerRegistration.uploadFailed"));
        return;
      }

      // 3. SAVE TO FIRESTORE
      const workerData = {
        serviceType,
        timeTaken,
        importantNotes,
        workType,
        exclusions,
        category,
        price,
        photoUrl,
        createdAt: new Date().toISOString(),
      };
      // Use serviceType as the unique document ID
      const uniqueKey = serviceType.toLowerCase().trim();
      await setDoc(doc(db, "services", uniqueKey), workerData);
      setLoading(false);
      customAlert(t("alerts.success"), t("alerts.profileSavedSuccessfully"));
    } catch (error) {
      setLoading(false);
      console.error("Upload error:", error);
      customAlert(t("alerts.error"), t("workerRegistration.saveFailed"));
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {loading && <Loader />}
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
            <View style={{ paddingTop: 20 }} />
            <ThemedText>Service type</ThemedText>
            <TextInput
              placeholder={"Enter your Service Type"}
              value={serviceType}
              onChangeText={setServiceType}
              style={styles.input}
            />
            <ThemedText>Time Taken</ThemedText>
            <TextInput
              placeholder={'Eg: "30-45 min"'}
              value={timeTaken}
              onChangeText={setTimeTaken}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <ThemedText>Price</ThemedText>
            <TextInput
              placeholder={"in Rs"}
              value={price}
              onChangeText={setPrice}
              style={styles.input}
            />

            <ThemedText>Includes</ThemedText>
            <TextInput
              placeholder={"Includes"}
              value={serviceHighlights}
              multiline
              onChangeText={setServiceHighlights}
              style={styles.input}
            />
            <ThemedText>Important Notes</ThemedText>
            <TextInput
              placeholder={"Important Notes"}
              value={importantNotes}
              multiline
              onChangeText={setImportantNotes}
              style={styles.input}
            />
            <ThemedText>{t("profile.workType")}</ThemedText>
            <Pressable
              onPress={() => {
                setShowWorkTypeModal(true);
              }}
            >
              <TextInput
                placeholder={t("profile.workType")}
                editable={false}
                value={workType}
                onChangeText={setWorkType}
                style={styles.input}
              />
            </Pressable>
            <ThemedText>Doesnot Include</ThemedText>
            <TextInput
              placeholder={"Add Items, followed by ','"}
              value={exclusions}
              multiline={true}
              onChangeText={setExclusions}
              style={styles.input}
            />
            <ThemedText>Category</ThemedText>
            <Pressable
              onPress={() => {
                setShowCategoryModal(true);
              }}
            >
              <TextInput
                placeholder={"Select Category"}
                editable={false}
                value={category}
                onChangeText={setCategory}
                style={styles.input}
              />
            </Pressable>
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <AwesomeButton
                width={200}
                backgroundColor="green"
                onPress={submitWorkerData}
              >
                {t("auth.register")}
              </AwesomeButton>
            </View>

            {/* Work Type Modal */}
            <Modal
              transparent
              visible={showWorkTypeModal}
              onRequestClose={() => {
                setShowWorkTypeModal(false);
              }}
            >
              <Pressable
                style={{ flex: 1, marginBottom: -20 }}
                onPress={() => {
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
                    borderTopWidth: 2,
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
                  {workTypesForCategory.length > 0 ? (
                    <FlatList
                      contentContainerStyle={{ flexGrow: 1 }}
                      data={workTypesForCategory}
                      renderItem={({ index, item }) => {
                        const displayText = t(`professions.${item}`);
                        return (
                          <Pressable
                            onPress={() => {
                              setShowWorkTypeModal(false);
                              setWorkType(item);
                            }}
                            style={{
                              padding: 15,
                              backgroundColor:
                                workType === item ? "green" : "transparent",
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
                  ) : (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      <ThemedText>Please select a category first</ThemedText>
                    </View>
                  )}
                </ThemedView>
              </SafeAreaView>
            </Modal>

            {/* Category Modal */}
            <Modal
              transparent
              visible={showCategoryModal}
              onRequestClose={() => {
                setShowCategoryModal(false);
              }}
            >
              <Pressable
                style={{ flex: 1, marginBottom: -20 }}
                onPress={() => {
                  setShowCategoryModal(false);
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
                    borderTopWidth: 2,
                    borderColor: "grey",
                    height: 400,
                    width: "100%",
                    bottom: 0,
                    position: "absolute",
                    paddingBottom: 30,
                  }}
                >
                  <ThemedText style={{ marginBottom: 20 }} type="subtitle">
                    Select Category
                  </ThemedText>
                  <FlatList
                    contentContainerStyle={{ flexGrow: 1 }}
                    data={serviceCategories.map((cat) => cat.category)}
                    renderItem={({ index, item }) => {
                      return (
                        <Pressable
                          onPress={() => {
                            setShowCategoryModal(false);
                            setCategory(item);
                            handleCategoryChange(item);
                          }}
                          style={{
                            padding: 15,
                            backgroundColor:
                              category === item ? "green" : "transparent",
                            borderRadius: 10,
                          }}
                        >
                          <ThemedText type="defaultSemiBold">{item}</ThemedText>
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
