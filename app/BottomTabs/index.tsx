// import { IconSymbol } from "@/components/ui/icon-symbol";
// import { useThemeColor } from "@/hooks/use-theme-color";
// // import Voice from "@react-native-voice/voice";
// import { useState } from "react";
// import {
//   Animated,
//   Button,
//   Dimensions,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";
// import Carousel from "react-native-reanimated-carousel";
// import { SafeAreaView } from "react-native-safe-area-context";

// import { HelloWave } from "@/components/hello-wave";
// import { ThemedText } from "@/components/themed-text";
// import { ThemedView } from "@/components/themed-view";
// import { ImageBackground } from "expo-image";
// import {
//   ExpoSpeechRecognitionModule,
//   useSpeechRecognitionEvent,
// } from "expo-speech-recognition";
// import Svg, { Path } from "react-native-svg";

// import { useAudioPlayer } from "expo-audio";

// function AudioPlayer(props: { source: string }) {
//   const player = useAudioPlayer(props.source);
//   return <Button title="Play" onPress={player.play} />;
// }

// export default function HomeScreen() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isListening, setIsListening] = useState(false);
//   const [scaleAnim] = useState(new Animated.Value(1));
//   const tintColor = useThemeColor({}, "tint");
//   const width = Dimensions.get("window").width;
//   const carouselData = [
//     { id: 1, color: "#FF6B6B", title: "Card 1" },
//     { id: 2, color: "#4ECDC4", title: "Card 2" },
//     { id: 3, color: "#FFE66D", title: "Card 3" },
//     { id: 4, color: "#FF9F1C", title: "Card 4" },
//   ];

//   const [recording, setRecording] = useState(false);
//   const [recordingUri, setRecordingUri] = useState<string | null>(null);
//   const [recognizing, setRecognizing] = useState(false);
//   const [recordingPath, setRecordingPath] = useState<string | null>(null);

//   const handleStart = () => {
//     setRecording(true);
//     // Start recording
//     ExpoSpeechRecognitionModule.start({
//       lang: "en-US",
//       recordingOptions: {
//         persist: true,
//         // Optional: Specify the output file path to save the recording to
//         // e.g. `Paths.document.uri` (from `expo-file-system`)
//         outputDirectory:
//           "/data/user/0/expo.modules.speechrecognition.example/files",
//         // Optional: Specify the output file name to save the recording to
//         outputFileName: "recording.wav",
//         // Optional: Specify the output sample rate to save the recording to
//         // Only supported on iOS
//         // Default sample rate: 16000 on Android, 44100/48000 on iOS
//         outputSampleRate: 16000,
//         // Optional: Specify the output encoding to save the recording to
//         // Only supported on iOS
//         // Default encoding: pcmFormatInt16 on Android, pcmFormatFloat32 on iOS
//         outputEncoding: "pcmFormatInt16",
//       },
//     });
//   };

//   useSpeechRecognitionEvent("audiostart", (event) => {
//     // Note: don't use this file until the "audioend" event is emitted
//     // Note: event.uri will be null if `recordingOptions.persist` is not enabled
//     console.log("Recording started for file:", event.uri);
//   });

//   useSpeechRecognitionEvent("audioend", (event) => {
//     // Recording ended, the file is now safe to use
//     console.log("Local file path:", event.uri);
//     // Android: Will be saved as a .wav file
//     // e.g. "file:///data/user/0/expo.modules.speechrecognition.example/cache/recording_1720678500903.wav"
//     // iOS: Will be saved as a .wav file
//     // e.g. "file:///path/to/Library/Caches/audio_CD5E6C6C-3D9D-4754-9188-D6FAF97D9DF2.wav"
//     setRecordingPath(event.uri);
//   });

//   return (
//     <ThemedView style={styles.container}>
//       <SafeAreaView edges={["top"]} style={styles.container}>
//         <View style={styles.scrollWrapper}>
//           <ScrollView contentContainerStyle={styles.scrollContent}>
//             <Carousel
//               autoPlayInterval={3000}
//               loop
//               width={width}
//               height={150}
//               autoPlay={true}
//               data={carouselData}
//               scrollAnimationDuration={3000}
//               renderItem={({ item }) => (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: "center",
//                     backgroundColor: item.color,
//                     borderRadius: 15,
//                     marginHorizontal: 5,
//                     overflow: "hidden",
//                     elevation: 4,
//                     shadowColor: "#000",
//                     shadowOffset: { width: 0, height: 2 },
//                     shadowOpacity: 0.2,
//                     shadowRadius: 4,
//                   }}
//                 >
//                   <ThemedText
//                     style={{
//                       textAlign: "center",
//                       fontSize: 20,
//                       color: "white",
//                     }}
//                     type="title"
//                   >
//                     ALWAYS ON SPECIFIED TIME
//                   </ThemedText>
//                 </View>
//               )}
//             />
//             <View>
//               <Button
//                 title="Start"
//                 onPress={handleStart}
//                 disabled={recording}
//               />
//               {recordingUri && <AudioPlayer source={recordingUri} />}
//             </View>
//             <View style={styles.content}>
//               <ThemedView style={styles.titleContainer}>
//                 <ThemedText type="title">Welcome Back!</ThemedText>
//                 <HelloWave />
//               </ThemedView>
//               <ThemedView style={styles.stepContainer}>
//                 <ThemedText type="subtitle">
//                   Book trusted, top-rated professionals for any home need in
//                   just a few taps.
//                 </ThemedText>
//                 <ThemedText>
//                   Explore our range of doorstep services below and book your
//                   expert today.
//                 </ThemedText>
//               </ThemedView>

//               <ImageBackground
//                 source={require("../../CARD_IMAGES/ElectricServices.png")}
//                 style={[
//                   styles.colorBlock,
//                   {
//                     backgroundColor: "rgba(245, 158, 11)",
//                     justifyContent: "center",
//                     opacity: 0.9,
//                   },
//                 ]}
//                 imageStyle={{ opacity: 0.8 }}
//               >
//                 <Text
//                   style={{
//                     color: "white",
//                     justifyContent: "center",
//                     alignContent: "center",
//                     alignItems: "center",
//                     fontFamily: "PlusJakartaSans",
//                     fontWeight: "bold",
//                     padding: 10,
//                     textShadowColor: "#000",
//                     textShadowOffset: { width: 0.5, height: 0.5 },
//                     textShadowRadius: 1,
//                     fontSize: 18,
//                   }}
//                 >
//                   ELECTRIC SERVICES
//                 </Text>
//               </ImageBackground>
//               <ImageBackground
//                 source={require("../../CARD_IMAGES/BeautyServices.png")}
//                 style={[
//                   styles.colorBlock,
//                   { backgroundColor: "rgba(16, 185, 129)" },
//                 ]}
//                 imageStyle={{ opacity: 0.7 }}
//               >
//                 <Text
//                   style={{
//                     color: "white",
//                     justifyContent: "center",
//                     alignContent: "center",
//                     alignItems: "center",
//                     fontFamily: "PlusJakartaSans",
//                     fontWeight: "bold",
//                     padding: 10,
//                     textShadowColor: "#000",
//                     textShadowOffset: { width: 0.5, height: 0.5 },
//                     textShadowRadius: 1,
//                     fontSize: 18,
//                   }}
//                 >
//                   HOME SERVICES
//                 </Text>
//               </ImageBackground>
//               <ImageBackground
//                 source={require("../../CARD_IMAGES/LaundryServices.png")}
//                 style={[
//                   styles.colorBlock,
//                   { backgroundColor: "rgba(14, 165, 233)" },
//                 ]}
//                 imageStyle={{ opacity: 0.7 }}
//               >
//                 <Text
//                   style={{
//                     color: "white",
//                     justifyContent: "center",
//                     alignContent: "center",
//                     alignItems: "center",
//                     fontFamily: "PlusJakartaSans",
//                     fontWeight: "bold",
//                     padding: 10,
//                     textShadowColor: "#000",
//                     textShadowOffset: { width: 0.5, height: 0.5 },
//                     textShadowRadius: 1,
//                     fontSize: 18,
//                   }}
//                 >
//                   LAUNDRY SERVICES
//                 </Text>
//               </ImageBackground>
//               <ImageBackground
//                 style={[
//                   styles.colorBlock,
//                   { backgroundColor: "rgba(244, 63, 94)" },
//                 ]}
//                 source={require("../../CARD_IMAGES/CareTakerServices.png")}
//                 imageStyle={{ opacity: 0.8 }}
//               >
//                 <Text
//                   style={{
//                     color: "white",
//                     justifyContent: "center",
//                     alignContent: "center",
//                     alignItems: "center",
//                     fontFamily: "PlusJakartaSans",
//                     fontWeight: "bold",
//                     padding: 10,
//                     textShadowColor: "#000",
//                     textShadowOffset: { width: 0.5, height: 0.5 },
//                     textShadowRadius: 1,
//                     fontSize: 18,
//                   }}
//                 >
//                   CARE TAKERS
//                 </Text>
//               </ImageBackground>

//               <View style={{ height: 100 }} />
//             </View>
//           </ScrollView>
//           <View style={styles.stickySearch}>
//             <View style={styles.searchContainer}>
//               <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
//                 <Path
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                   stroke={tintColor}
//                   strokeWidth={2}
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </Svg>
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search for deliveries..."
//                 placeholderTextColor="#999"
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//               />
//               <Pressable onPress={() => {}} style={styles.micContainer}>
//                 <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//                   <IconSymbol
//                     name={isListening ? "mic.fill" : "mic"}
//                     size={20}
//                     color={isListening ? "#FF4444" : tintColor}
//                   />
//                 </Animated.View>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </SafeAreaView>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollWrapper: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingTop: 100,
//     paddingBottom: 20,
//   },
//   content: {
//     padding: 32,
//     gap: 16,
//   },
//   titleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   colorBlock: {
//     height: 120,
//     borderRadius: 20,
//     marginBottom: 20,
//     width: "100%",
//     overflow: "hidden",
//     justifyContent: "center",
//   },
//   stickySearch: {
//     position: "absolute",
//     top: 8,
//     left: 12,
//     right: 12,
//     zIndex: 10,
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.9)",
//     borderWidth: 1,
//     borderColor: "rgba(0,0,0,0.3)",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 30,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.5,
//     shadowRadius: 4,
//     elevation: 13,
//   },
//   searchInput: {
//     flex: 1,
//     marginHorizontal: 4,
//     fontSize: 16,
//     includeFontPadding: false,
//   },
//   micContainer: {
//     padding: 4,
//   },
// });

// // import { useState } from "react";
// // import { ScrollView, Text, View } from "react-native";

// // export default function HomeScreen() {
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [isListening, setIsListening] = useState(false);
// //   const [recording, setRecording] = useState<
// //     import("expo-av").Recording | null
// //   >(null); // ✅ Added recording state
// //   const [scaleAnim] = useState(new Animated.Value(1));
// //   const tintColor = useThemeColor({}, "tint");
// //   const width = Dimensions.get("window").width;

// //   const carouselData = [
// //     { id: 1, color: "#FF6B6B", title: "Card 1" },
// //     { id: 2, color: "#4ECDC4", title: "Card 2" },
// //     { id: 3, color: "#FFE66D", title: "Card 3" },
// //     { id: 4, color: "#FF9F1C", title: "Card 4" },
// //   ];

// //   // Cleanup recording if component unmounts
// //   useEffect(() => {
// //     return () => {
// //       if (recording) {
// //         recording?.stopAndUnloadAsync();
// //       }
// //     };
// //   }, [recording]);

// //   const startRecording = async () => {
// //     try {
// //       // 1. Request Microphone Permissions
// //       const permission = await Audio.requestPermissionsAsync();
// //       if (permission.status !== "granted") {
// //         console.warn("Microphone permission not granted");
// //         return;
// //       }

// //       await Audio.setAudioModeAsync({
// //         allowsRecordingIOS: true,
// //         playsInSilentModeIOS: true,
// //       });

// //       // 2. Start Recording
// //       const { recording: newRecording } = await Audio.Recording.createAsync(
// //         Audio.RecordingOptionsPresets.HIGH_QUALITY,
// //       );

// //       setRecording(newRecording);
// //       setIsListening(true);

// //       // 3. Start Pulse Animation
// //       Animated.loop(
// //         Animated.sequence([
// //           Animated.timing(scaleAnim, {
// //             toValue: 1.2,
// //             duration: 500,
// //             useNativeDriver: true,
// //           }),
// //           Animated.timing(scaleAnim, {
// //             toValue: 1,
// //             duration: 500,
// //             useNativeDriver: true,
// //           }),
// //         ]),
// //       ).start();
// //     } catch (err) {
// //       console.error("Failed to start recording", err);
// //     }
// //   };

// //   const stopRecording = async () => {
// //     try {
// //       if (!recording) return;

// //       // 1. Stop UI Updates
// //       setIsListening(false);
// //       scaleAnim.stopAnimation();
// //       scaleAnim.setValue(1);

// //       // 2. Stop and Retrieve Audio File
// //       await recording.stopAndUnloadAsync();
// //       const uri = recording.getURI();
// //       setRecording(null);

// //       // 3. Send to API for transcription
// //       transcribeAudio(uri);
// //     } catch (err) {
// //       console.error("Failed to stop recording", err);
// //     }
// //   };

// //   // ✅ New Transcription Function
// //   const transcribeAudio = async (uri: any) => {
// //     if (!uri) return;

// //     try {
// //       setSearchQuery("Transcribing...");

// //       const formData = new FormData();
// //       formData?.append("file", {
// //         uri,
// //         type: "audio/m4a", // expo-av default high quality format
// //         name: "audio.m4a",
// //       });
// //       formData.append("model", "whisper-1");

// //       // Replace with your actual backend or API integration.
// //       // NOTE: Do not hardcode API keys in a production frontend app!
// //       const response = await fetch(
// //         "https://api.openai.com/v1/audio/transcriptions",
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Bearer YOUR_OPENAI_API_KEY`,
// //             "Content-Type": "multipart/form-data",
// //           },
// //           body: formData,
// //         },
// //       );

// //       const data = await response.json();

// //       if (data.text) {
// //         setSearchQuery(data.text);
// //       } else {
// //         setSearchQuery("");
// //         console.error("Transcription error:", data);
// //       }
// //     } catch (error) {
// //       console.error("Error transcribing:", error);
// //       setSearchQuery("");
// //     }
// //   };

// //   const toggleVoice = () => {
// //     if (isListening) {
// //       stopRecording();
// //     } else {
// //       startRecording();
// //     }
// //   };

// //   return (
// //     <ThemedView style={styles.container}>
// //       <SafeAreaView edges={["top"]} style={styles.container}>
// //         <View style={styles.scrollWrapper}>
// //           <ScrollView contentContainerStyle={styles.scrollContent}>
// //             <Carousel
// //               autoPlayInterval={3000}
// //               loop
// //               width={width}
// //               height={150}
// //               autoPlay={true}
// //               data={carouselData}
// //               scrollAnimationDuration={3000}
// //               renderItem={({ item }) => (
// //                 <View
// //                   style={{
// //                     flex: 1,
// //                     justifyContent: "center",
// //                     backgroundColor: item.color,
// //                     borderRadius: 15,
// //                     marginHorizontal: 5,
// //                     overflow: "hidden",
// //                     elevation: 4,
// //                     shadowColor: "#000",
// //                     shadowOffset: { width: 0, height: 2 },
// //                     shadowOpacity: 0.2,
// //                     shadowRadius: 4,
// //                   }}
// //                 >
// //                   <ThemedText
// //                     style={{
// //                       textAlign: "center",
// //                       fontSize: 20,
// //                       color: "white",
// //                     }}
// //                     type="title"
// //                   >
// //                     ALWAYS ON SPECIFIED TIME
// //                   </ThemedText>
// //                 </View>
// //               )}
// //             />
// //             <View style={styles.content}>
// //               <ThemedView style={styles.titleContainer}>
// //                 <ThemedText type="title">Welcome Back!</ThemedText>
// //                 <HelloWave />
// //               </ThemedView>
// //               <ThemedView style={styles.stepContainer}>
// //                 <ThemedText type="subtitle">
// //                   Book trusted, top-rated professionals for any home need in
// //                   just a few taps.
// //                 </ThemedText>
// //                 <ThemedText>
// //                   Explore our range of doorstep services below and book your
// //                   expert today.
// //                 </ThemedText>
// //               </ThemedView>

// //               <ImageBackground
// //                 source={require("../../CARD_IMAGES/ElectricServices.png")}
// //                 style={[
// //                   styles.colorBlock,
// //                   {
// //                     backgroundColor: "rgba(245, 158, 11)",
// //                     justifyContent: "center",
// //                     opacity: 0.9,
// //                   },
// //                 ]}
// //                 imageStyle={{ opacity: 0.8 }}
// //               >
// //                 <Text style={styles.cardText}>ELECTRIC SERVICES</Text>
// //               </ImageBackground>

// //               <ImageBackground
// //                 source={require("../../CARD_IMAGES/BeautyServices.png")}
// //                 style={[
// //                   styles.colorBlock,
// //                   { backgroundColor: "rgba(16, 185, 129)" },
// //                 ]}
// //                 imageStyle={{ opacity: 0.7 }}
// //               >
// //                 <Text style={styles.cardText}>HOME SERVICES</Text>
// //               </ImageBackground>

// //               <ImageBackground
// //                 source={require("../../CARD_IMAGES/LaundryServices.png")}
// //                 style={[
// //                   styles.colorBlock,
// //                   { backgroundColor: "rgba(14, 165, 233)" },
// //                 ]}
// //                 imageStyle={{ opacity: 0.7 }}
// //               >
// //                 <Text style={styles.cardText}>LAUNDRY SERVICES</Text>
// //               </ImageBackground>

// //               <ImageBackground
// //                 style={[
// //                   styles.colorBlock,
// //                   { backgroundColor: "rgba(244, 63, 94)" },
// //                 ]}
// //                 source={require("../../CARD_IMAGES/CareTakerServices.png")}
// //                 imageStyle={{ opacity: 0.8 }}
// //               >
// //                 <Text style={styles.cardText}>CARE TAKERS</Text>
// //               </ImageBackground>

// //               <View style={{ height: 100 }} />
// //             </View>
// //           </ScrollView>

// //           <View style={styles.stickySearch}>
// //             <View style={styles.searchContainer}>
// //               <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
// //                 <Path
// //                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
// //                   stroke={tintColor}
// //                   strokeWidth={2}
// //                   strokeLinecap="round"
// //                   strokeLinejoin="round"
// //                 />
// //               </Svg>
// //               <TextInput
// //                 style={styles.searchInput}
// //                 placeholder="Search for deliveries..."
// //                 placeholderTextColor="#999"
// //                 value={searchQuery}
// //                 onChangeText={setSearchQuery}
// //               />
// //               <Pressable onPress={toggleVoice} style={styles.micContainer}>
// //                 <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
// //                   <IconSymbol
// //                     name={isListening ? "mic.fill" : "mic"}
// //                     size={20}
// //                     color={isListening ? "#FF4444" : tintColor}
// //                   />
// //                 </Animated.View>
// //               </Pressable>
// //             </View>
// //           </View>
// //         </View>
// //       </SafeAreaView>
// //     </ThemedView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1 },
// //   scrollWrapper: { flex: 1 },
// //   scrollContent: { paddingTop: 100, paddingBottom: 20 },
// //   content: { padding: 32, gap: 16 },
// //   titleContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
// //   stepContainer: { gap: 8, marginBottom: 8 },
// //   colorBlock: {
// //     height: 120,
// //     borderRadius: 20,
// //     marginBottom: 20,
// //     width: "100%",
// //     overflow: "hidden",
// //     justifyContent: "center",
// //   },
// //   cardText: {
// //     color: "white",
// //     justifyContent: "center",
// //     alignContent: "center",
// //     alignItems: "center",
// //     fontFamily: "PlusJakartaSans",
// //     fontWeight: "bold",
// //     padding: 10,
// //     textShadowColor: "#000",
// //     textShadowOffset: { width: 0.5, height: 0.5 },
// //     textShadowRadius: 1,
// //     fontSize: 18,
// //   },
// //   stickySearch: {
// //     position: "absolute",
// //     top: 8,
// //     left: 12,
// //     right: 12,
// //     zIndex: 10,
// //   },
// //   searchContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "rgba(255,255,255,0.9)",
// //     borderWidth: 1,
// //     borderColor: "rgba(0,0,0,0.3)",
// //     paddingVertical: 12,
// //     paddingHorizontal: 16,
// //     borderRadius: 30,
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.5,
// //     shadowRadius: 4,
// //     elevation: 13,
// //   },
// //   searchInput: {
// //     flex: 1,
// //     marginHorizontal: 4,
// //     fontSize: 16,
// //     includeFontPadding: false,
// //   },
// //   micContainer: { padding: 4 },
// // });

// /*
// expo init expo-speech-to-text
// cd expo-speech-to-text
// expo install @react-native-voice/voice expo-dev-client

// Add the following to your app.json, inside the expo section:
// "plugins": [
//   [
//     "@react-native-voice/voice",
//     {
//       "microphonePermission": "Allow Voice to Text Tutorial to access the microphone",
//       "speechRecognitionPermission": "Allow Voice to Text Tutorial to securely recognize user speech"
//     }
//   ]
// ]

// If you don't have eas installed then install using the following command:
// npm install -g eas-cli

// eas login
// eas build:configure

// Build for local development on iOS or Android:
// eas build -p ios --profile development --local
// OR
// eas build -p android --profile development --local

// May need to install the following to build locally (which allows debugging)
// npm install -g yarn
// brew install fastlane

// After building install on your device:
// For iOS (simulator): https://docs.expo.dev/build-reference/simulators/
// For Android: https://docs.expo.dev/build-reference/apk/

// Run on installed app:
// expo start --dev-client

// */
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TranscribeLocalAudioFileDemo } from "@/components/TranscribeLocalAudioFileDemo";
import { TranscribeRemoteAudioFileDemo } from "@/components/TranscribeRemoteAudioFileDemo";
import {
  BigButton,
  CheckboxButton,
  OptionButton,
  SmallButton,
  TabButton,
} from "@/components/ui/Buttons";
import { Card } from "@/components/ui/Card";
import { WebSpeechAPIDemo } from "@/components/WebSpeechAPIDemo";
import { useThemeColor } from "@/hooks/use-theme-color";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Paths } from "expo-file-system";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import type {
  AndroidIntentOptions,
  AVAudioSessionCategoryOptionsValue,
  AVAudioSessionCategoryValue,
  AVAudioSessionModeValue,
  ExpoSpeechRecognitionOptions,
  SetCategoryOptions,
} from "expo-speech-recognition";
import {
  AudioEncodingAndroid,
  AVAudioSessionCategory,
  AVAudioSessionCategoryOptions,
  AVAudioSessionMode,
  ExpoSpeechRecognitionModule,
  TaskHintIOS,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useSelector } from "react-redux";

const speechRecognitionServices =
  ExpoSpeechRecognitionModule.getSpeechRecognitionServices();

const HomeScreen = () => {
  const [error, setError] = useState<{ error: string; message: string } | null>(
    null,
  );
  const navigation = useNavigation<any>();

  const transcriptTallyRef = useRef<string>("");
  const [transcription, setTranscription] = useState<string>("");

  const [status, setStatus] = useState<"idle" | "starting" | "recognizing">(
    "idle",
  );

  const [settings, setSettings] = useState<ExpoSpeechRecognitionOptions>({
    lang: "en-US",
    interimResults: true,
    maxAlternatives: 3,
    continuous: true,
    requiresOnDeviceRecognition: false,
    addsPunctuation: true,
    contextualStrings: [
      "expo-speech-recognition",
      "Carlsen",
      "Ian Nepomniachtchi",
      "Praggnanandhaa",
    ],
    volumeChangeEventOptions: {
      enabled: false,
      intervalMillis: 300,
    },
  });

  // useSpeechRecognitionEvent("result", (ev) => {
  //   console.log("[event]: result", {
  //     isFinal: ev.isFinal,
  //     transcripts: ev.results.map((result) => {
  //       setSearchQuery(result.transcript);
  //       return searchQuery + result.transcript;
  //     }),
  //   });

  //   const transcript = ev.results[0]?.transcript || "";

  //   if (ev.isFinal) {
  //     // When a final result is received, any following result events will include a new transcript
  //     // So we need to keep a tally of the current transcript so we can append it to the following result events
  //     transcriptTallyRef.current += transcript;
  //     setTranscription(transcriptTallyRef.current);
  //   } else {
  //     setTranscription(transcriptTallyRef.current + transcript);
  //   }
  // });

  // useSpeechRecognitionEvent("start", () => {
  //   transcriptTallyRef.current = "";
  //   setTranscription("");
  //   setStatus("recognizing");
  // });

  // useSpeechRecognitionEvent("end", () => {
  //   console.log("[event]: end");
  //   setStatus("idle");
  // });

  // useSpeechRecognitionEvent("error", (ev) => {
  //   console.log(
  //     "[event]: error",
  //     ev.error,
  //     ev.message,
  //     ev.code ? `code: ${ev.code}` : "",
  //   );

  //   switch (ev.code) {
  //     case SpeechRecognizerErrorAndroid.ERROR_NETWORK_TIMEOUT:
  //       break;
  //     case SpeechRecognizerErrorAndroid.ERROR_TOO_MANY_REQUESTS:
  //       break;
  //     case -1:
  //       break;
  //   }

  //   setError(ev);
  // });

  // useSpeechRecognitionEvent("nomatch", () => {
  //   console.log("[event]: nomatch");
  // });

  // useSpeechRecognitionEvent("languagedetection", (ev) => {
  //   console.log("[event]: languagedetection", ev);
  // });

  const startListening = async () => {
    if (status !== "idle") {
      return;
    }
    transcriptTallyRef.current = "";
    setTranscription("");
    setError(null);
    setStatus("starting");

    const microphonePermissions =
      await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
    console.log("Microphone permissions", microphonePermissions);
    if (!microphonePermissions.granted) {
      setError({ error: "not-allowed", message: "Permissions not granted" });
      setStatus("idle");
      return;
    }

    if (!settings.requiresOnDeviceRecognition && Platform.OS === "ios") {
      const speechRecognizerPermissions =
        await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
      console.log("Speech recognizer permissions", speechRecognizerPermissions);
      if (!speechRecognizerPermissions.granted) {
        if (speechRecognizerPermissions.restricted) {
          setError({
            error: "not-allowed",
            message: "Speech recognition is restricted.",
          });
        } else {
          setError({
            error: "not-allowed",
            message: "Permissions not granted",
          });
        }
        setStatus("idle");
        return;
      }
    }

    console.log(settings);

    ExpoSpeechRecognitionModule.start(settings);
    setTimeout(() => {
      ExpoSpeechRecognitionModule.stop();
    }, 5000);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<any>(null); // ✅ Added recording state
  const [scaleAnim] = useState(new Animated.Value(1));
  const tintColor = useThemeColor({}, "tint");
  const width = Dimensions.get("window").width;
  const { t, i18n } = useTranslation();
  const userData = useSelector((state: any) => state.user.data);
  // alert(JSON.stringify(userData));
  // const AVAILABLE_SERVICES = [
  //   {
  //     id: "1",
  //     title: t("home.electricalServices"),
  //     category: "Electrical Services",
  //     image: require("../../CARD_IMAGES/ElectricServices.webp"),
  //     gradientColors: ["#f59e0b", "#d97706"] as const,
  //     imageOpacity: 0.85,
  //   },
  //   {
  //     id: "2",
  //     title: t("home.plumbingServices"),
  //     category: "Plumbing Services",
  //     image: require("../../CARD_IMAGES/PlumberServices.webp"),
  //     gradientColors: ["#06b6d4", "#0891b2"] as const,
  //     imageOpacity: 0.85,
  //   },
  //   {
  //     id: "3",
  //     title: t("home.beautyServices"),
  //     category: "Beauty Services",
  //     image: require("../../CARD_IMAGES/BeautyServices.webp"),
  //     gradientColors: ["#ec4899", "#db2777"] as const,
  //     imageOpacity: 0.75,
  //   },
  //   {
  //     id: "4",
  //     title: t("home.laundryServices"),
  //     category: "Laundry Services",
  //     image: require("../../CARD_IMAGES/LaundryServices.webp"),
  //     gradientColors: ["#0ea5e9", "#0284c7"] as const,
  //     imageOpacity: 0.75,
  //   },
  //   {
  //     id: "5",
  //     title: t("home.careTakers"),
  //     category: "Care Takers",
  //     image: require("../../CARD_IMAGES/CareTakerServices.webp"),
  //     gradientColors: ["#f43f5e", "#e11d48"] as const,
  //     imageOpacity: 0.95,
  //   },
  //   {
  //     id: "6",
  //     title: t("home.homeServices"),
  //     category: "Home Services",
  //     image: require("../../CARD_IMAGES/HomeServices.webp"),
  //     gradientColors: ["#10b981", "#059669"] as const,
  //     imageOpacity: 0.75,
  //   },
  //   {
  //     id: "7",
  //     title: t("home.constructionServices"),
  //     category: "Construction Services",
  //     image: require("../../CARD_IMAGES/ConstructionServices.webp"),
  //     gradientColors: ["#78716c", "#57534e"] as const,
  //     imageOpacity: 0.85,
  //   },
  //   {
  //     id: "8",
  //     title: t("home.rentedBikesAndCars"),
  //     category: "Rented Bikes and Cars",
  //     image: require("../../CARD_IMAGES/RentalServices.webp"),
  //     gradientColors: ["#3b82f6", "#2563eb"] as const,
  //     imageOpacity: 0.75,
  //   },
  //   {
  //     id: "9",
  //     title: t("home.parcelDelivery"),
  //     category: "Parcel Delivery",
  //     image: require("../../CARD_IMAGES/DeliveryServices.webp"),
  //     gradientColors: ["#8b5cf6", "#7c3aed"] as const,
  //     imageOpacity: 0.75,
  //   },
  //   {
  //     id: "10",
  //     title: t("home.xeroxAndPrinting"),
  //     category: "Xerox and Printing",
  //     image: require("../../CARD_IMAGES/XeroxServices.webp"),
  //     gradientColors: ["#64748b", "#475569"] as const,
  //     imageOpacity: 0.85,
  //   },
  //   {
  //     id: "11",
  //     title: t("home.securityServices"),
  //     category: "Security Services",
  //     image: require("../../CARD_IMAGES/SecurityServices.webp"),
  //     gradientColors: ["#dc2626", "#b91c1c"] as const,
  //     imageOpacity: 0.95,
  //   },
  //   {
  //     id: "12",
  //     title: t("home.driverServices"),
  //     category: "Driver Services",
  //     image: require("../../CARD_IMAGES/DriverServices.webp"),
  //     gradientColors: ["#f97316", "#ea580c"] as const,
  //     imageOpacity: 0.75,
  //   },
  //   {
  //     id: "13",
  //     title: t("home.mechanicServices"),
  //     category: "Mechanic Services",
  //     image: require("../../CARD_IMAGES/MechanicServices.webp"),
  //     gradientColors: ["#84cc16", "#65a30d"] as const,
  //     imageOpacity: 0.85,
  //   },
  //   {
  //     id: "14",
  //     title: t("home.goldOrnamentMaking"),
  //     category: "Gold Ornament Making",
  //     image: require("../../CARD_IMAGES/GoldServices.webp"),
  //     gradientColors: ["#fbbf24", "#f59e0b"] as const,
  //     imageOpacity: 0.75,
  //   },
  //   {
  //     id: "15",
  //     title: t("home.packersAndMovers"),
  //     category: "Packers and Movers",
  //     image: require("../../CARD_IMAGES/PackerServices.webp"),
  //     gradientColors: ["#14b8a6", "#0d9488"] as const,
  //     imageOpacity: 0.75,
  //   },
  //   // {
  //   //   id: "16",
  //   //   title: t("home.computerServices"),
  //   //   category: "Computer Services",
  //   //   image: require("../../CARD_IMAGES/ElectricServices.png"),
  //   //   gradientColors: ["#6366f1", "#4f46e5"] as const,
  //   //   imageOpacity: 0.85,
  //   // },
  //   // {
  //   //   id: "17",
  //   //   title: t("home.mobileServices"),
  //   //   category: "Mobile Services",
  //   //   image: require("../../CARD_IMAGES/BeautyServices.png"),
  //   //   gradientColors: ["#06b6d4", "#0891b2"] as const,
  //   //   imageOpacity: 0.75,
  //   // },
  //   // {
  //   //   id: "18",
  //   //   title: t("home.eventServices"),
  //   //   category: "Event Services",
  //   //   image: require("../../CARD_IMAGES/LaundryServices.png"),
  //   //   gradientColors: ["#f43f5e", "#e11d48"] as const,
  //   //   imageOpacity: 0.75,
  //   // },
  //   {
  //     id: "19",
  //     title: t("home.petServices"),
  //     category: "Pet Services",
  //     image: require("../../CARD_IMAGES/PetServices.webp"),
  //     gradientColors: ["#a855f7", "#9333ea"] as const,
  //     imageOpacity: 0.95,
  //   },
  // ];
  const AVAILABLE_SERVICES = [
    {
      id: "1",
      title: t("home.electricalServices"),
      category: "Electrical Services",
      image: require("../../CARD_IMAGES/ElectricServices_1.webp"),
      // Electric Yellow to Deep Gold
      gradientColors: ["#fde047", "#ca8a04"] as const,
      imageOpacity: 0.85,
    },
    {
      id: "2",
      title: t("home.plumbingServices"),
      category: "Plumbing Services",
      image: require("../../CARD_IMAGES/PlumberServices_1.webp"),
      // Fresh Water Cyan to Deep Blue
      gradientColors: ["#38bdf8", "#0284c7"] as const,
      imageOpacity: 0.85,
    },
    {
      id: "3",
      title: t("home.beautyServices"),
      category: "Beauty Services",
      image: require("../../CARD_IMAGES/BeautyServices_1.webp"),
      // Soft Blush Pink to Deep Rose
      gradientColors: ["#f472b6", "#be185d"] as const,
      imageOpacity: 0.75,
    },
    {
      id: "4",
      title: t("home.laundryServices"),
      category: "Laundry Services",
      image: require("../../CARD_IMAGES/LaundryServices_1.webp"),
      // Fresh Linen Blue to Clean Indigo
      gradientColors: ["#818cf8", "#4338ca"] as const,
      imageOpacity: 0.75,
    },
    {
      id: "5",
      title: t("home.careTakers"),
      category: "Care Takers",
      image: require("../../CARD_IMAGES/CareTakerServices_1.webp"),
      // Calming Health Mint to Trusting Green
      gradientColors: ["#6ee7b7", "#059669"] as const,
      imageOpacity: 0.95,
    },
    {
      id: "6",
      title: t("home.homeServices"),
      category: "Home Services",
      image: require("../../CARD_IMAGES/HomeServices_1.webp"),
      // Warm Terracotta/Brick
      gradientColors: ["#fb923c", "#c2410c"] as const,
      imageOpacity: 0.75,
    },
    {
      id: "7",
      title: t("home.constructionServices"),
      category: "Construction Services",
      image: require("../../CARD_IMAGES/ConstructionServices_1.webp"),
      // Safety Yellow to Construction Orange
      gradientColors: ["#fcd34d", "#ea580c"] as const,
      imageOpacity: 0.85,
    },
    {
      id: "8",
      title: t("home.rentedBikesAndCars"),
      category: "Rented Bikes and Cars",
      image: require("../../CARD_IMAGES/RentalServices_1.webp"),
      // Asphalt Gray to Sleek Metal
      gradientColors: ["#94a3b8", "#334155"] as const,
      imageOpacity: 0.75,
    },
    {
      id: "9",
      title: t("home.parcelDelivery"),
      category: "Parcel Delivery",
      image: require("../../CARD_IMAGES/DeliveryServices_1.webp"),
      // Cardboard Box Amber/Brown
      gradientColors: ["#d97706", "#78350f"] as const,
      imageOpacity: 0.75,
    },
    {
      id: "10",
      title: t("home.xeroxAndPrinting"),
      category: "Xerox and Printing",
      image: require("../../CARD_IMAGES/XeroxServices_1.webp"),
      // Printer Ink Cyan
      gradientColors: ["#2dd4bf", "#0369a1"] as const,
      imageOpacity: 0.85,
    },
    {
      id: "11",
      title: t("home.securityServices"),
      category: "Security Services",
      image: require("../../CARD_IMAGES/SecurityServices_1.webp"),
      // Authoritative Navy to Midnight Blue
      gradientColors: ["#1e3a8a", "#0f172a"] as const,
      imageOpacity: 0.95,
    },
    {
      id: "12",
      title: t("home.driverServices"),
      category: "Driver Services",
      image: require("../../CARD_IMAGES/DriverServices_1.webp"),
      // Sleek Chauffeur Gray/Black
      gradientColors: ["#64748b", "#0f172a"] as const,
      imageOpacity: 0.75,
    },
    {
      id: "13",
      title: t("home.mechanicServices"),
      category: "Mechanic Services",
      image: require("../../CARD_IMAGES/MechanicServices_1.webp"),
      // Steel Tools and Motor Oil
      gradientColors: ["#9ca3af", "#374151"] as const,
      imageOpacity: 0.85,
    },
    {
      id: "14",
      title: t("home.goldOrnamentMaking"),
      category: "Gold Ornament Making",
      image: require("../../CARD_IMAGES/GoldServices_1.webp"),
      // Bright Gold to Deep Rich Gold
      gradientColors: ["#fef08a", "#a16207"] as const,
      imageOpacity: 0.75,
    },
    {
      id: "15",
      title: t("home.packersAndMovers"),
      category: "Packers and Movers",
      image: require("../../CARD_IMAGES/PackerServices_1.webp"),
      // Energetic Transit Green
      gradientColors: ["#a3e635", "#4d7c0f"] as const,
      imageOpacity: 0.75,
    },
    // {
    //   id: "16",
    //   title: t("home.computerServices"),
    //   category: "Computer Services",
    //   image: require("../../CARD_IMAGES/ElectricServices.png"),
    //   // Tech Purple/Indigo
    //   gradientColors: ["#a78bfa", "#5b21b6"] as const,
    //   imageOpacity: 0.85,
    // },
    // {
    //   id: "17",
    //   title: t("home.mobileServices"),
    //   category: "Mobile Services",
    //   image: require("../../CARD_IMAGES/BeautyServices.png"),
    //   // Digital Cyan
    //   gradientColors: ["#2dd4bf", "#0f766e"] as const,
    //   imageOpacity: 0.75,
    // },
    // {
    //   id: "18",
    //   title: t("home.eventServices"),
    //   category: "Event Services",
    //   image: require("../../CARD_IMAGES/LaundryServices.png"),
    //   // Festive Magenta/Gold
    //   gradientColors: ["#f43f5e", "#9f1239"] as const,
    //   imageOpacity: 0.75,
    // },
    {
      id: "19",
      title: t("home.petServices"),
      category: "Pet Services",
      image: require("../../CARD_IMAGES/PetServices_1.webp"),
      // Playful Pet Orange to Warm Fur Brown
      gradientColors: ["#fb923c", "#9a3412"] as const,
      imageOpacity: 0.95,
    },
  ];
  const carouselData = [
    {
      id: 1,
      color: "#FF6B6B",
      title: "Card 1",
      image: require("../../CARD_IMAGES/ElectricServices.png"),
    },
    {
      id: 2,
      color: "#4ECDC4",
      title: "Card 2",
      image: require("../../CARD_IMAGES/BeautyServices.png"),
    },
    {
      id: 3,
      color: "#FFE66D",
      title: "Card 3",
      image: require("../../CARD_IMAGES/LaundryServices.png"),
    },
    {
      id: 4,
      color: "#FF9F1C",
      title: "Card 4",
      image: require("../../CARD_IMAGES/LaundryServices.png"),
    },
  ];

  const scaleAnimsRef = React.useRef<Animated.Value[]>([]);

  const getScaleAnim = (index: number) => {
    if (!scaleAnimsRef.current[index]) {
      scaleAnimsRef.current[index] = new Animated.Value(1);
    }
    return scaleAnimsRef.current[index];
  };

  // ─── Press Animation ───
  const handlePressIn = (index: number) => {
    Animated.spring(getScaleAnim(index), {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(getScaleAnim(index), {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{olj[ayj[j[ayfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQfQ";
  return (
    <SafeAreaProvider>
      {/* <AppContainer> */}
      <StatusBar style="dark" />
      <ThemedView style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.container}>
          <View style={styles.scrollWrapper}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Promo Carousel */}
              {searchQuery == "" && (
                <View style={styles.carouselWrapper}>
                  <Carousel
                    autoPlayInterval={3000}
                    loop
                    width={width}
                    height={220}
                    autoPlay={true}
                    data={carouselData}
                    scrollAnimationDuration={3000}
                    renderItem={({ item }) => (
                      <Pressable
                        style={{ paddingHorizontal: 10 }}
                        onPress={() => {
                          navigation.navigate("service-providers");
                        }}
                      >
                        <ImageBackground
                          placeholder={{ blurhash }}
                          source={item.image}
                          style={[
                            styles.promoCard,
                            { backgroundColor: item.color },
                          ]}
                          imageStyle={{ opacity: 0.8 }}
                        >
                          <Text style={styles.promoCardText}>{item.title}</Text>
                        </ImageBackground>
                      </Pressable>
                    )}
                  />
                </View>
              )}

              {/* Greeting Header */}
              {searchQuery == "" && (
                <View style={styles.heroSection}>
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroGradient}
                  >
                    <View style={styles.heroContent}>
                      <Text style={styles.greetingLabel}>Welcome back </Text>
                      <Text style={styles.heroTitle}>
                        {/* {JSON.stringify(userData)} */}
                        {userData.displayName ||
                          userData.firstName + " " + userData.lastName}
                      </Text>
                      <Text style={styles.heroSubtitle}>
                        {t("home.appIntro")}
                      </Text>
                      <View style={styles.heroStats}>
                        <View style={styles.statItem}>
                          <Text style={styles.statNumber}>25+</Text>
                          <Text style={styles.statLabel}>Services</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                          <Text style={styles.statNumber}>500+</Text>
                          <Text style={styles.statLabel}>Experts</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                          <Text style={styles.statNumber}>4.9</Text>
                          <Text style={styles.statLabel}>Rating</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                  {/* <HelloWave /> */}
                </View>
              )}

              {/* Services Section */}

              <View style={styles.servicesSection}>
                {searchQuery == "" && (
                  <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>
                      {t("home.exploreServices")}
                    </ThemedText>
                    {/* <Pressable style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>See All</Text>
                    <FontAwesome
                      name="chevron-right"
                      size={12}
                      color="#667eea"
                    />
                  </Pressable> */}
                  </View>
                )}

                <View style={styles.servicesGrid}>
                  {AVAILABLE_SERVICES.map((item, index) => {
                    console.log("Search Query : ", searchQuery);
                    console.log("item.title : ", item.title.toLowerCase());
                    if (
                      // searchQuery == "" ||
                      item.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    ) {
                      console.log("CALLED99999");
                      return (
                        <Pressable
                          key={item.id}
                          onPressIn={() => handlePressIn(index)}
                          onPressOut={() => handlePressOut(index)}
                          style={[
                            styles.serviceCard,
                            { flex: 1 },
                            searchQuery !== "" && {
                              maxWidth: "100%",
                              minWidth: "80%",
                            },
                            index % 2 === 0 &&
                              searchQuery == "" && { marginRight: 12 },
                          ]}
                          onPress={() => {
                            navigation.navigate("service-providers", {
                              category: item.category,
                            });
                          }}
                        >
                          <Animated.View
                            style={[
                              // styles.cardContainer,
                              {
                                // backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                                // shadowColor: isDark ? "#000" : "#000",
                                transform: [{ scale: getScaleAnim(index) }],
                              },
                            ]}
                          >
                            <ImageBackground
                              placeholder={{ blurhash }}
                              source={item.image}
                              style={styles.serviceImageBg}
                              imageStyle={{
                                opacity: item.imageOpacity,
                                borderRadius: 20,
                              }}
                            >
                              <LinearGradient
                                colors={item.gradientColors}
                                start={{ x: 0, y: 1 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.serviceCardOverlay}
                              />
                              <View style={styles.serviceCardContent}>
                                <Text style={styles.serviceCardTitle}>
                                  {item.title}
                                </Text>
                                <View style={styles.bookNowBadge}>
                                  <Text style={styles.bookNowText}>
                                    Book Now
                                  </Text>
                                </View>
                              </View>
                            </ImageBackground>
                          </Animated.View>
                        </Pressable>
                      );
                    } else {
                      console.log("CALLED11111");

                      return <></>;
                    }
                  })}
                </View>
              </View>

              {/* Bottom spacer */}
              <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.stickySearch}>
              <View style={styles.searchContainer}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    stroke={"blue"}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for deliveries..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {status === "idle" ? (
                  <Pressable
                    onPress={startListening}
                    style={styles.micContainer}
                  >
                    <Animated.View
                      style={{ transform: [{ scale: scaleAnim }] }}
                    >
                      {/* <IconSymbol
                          name={isListening ? "mic.fill" : "mic"}
                          size={20}
                          color={isListening ? "#FF4444" : tintColor}
                        />
                         */}
                      <FontAwesome
                        name="microphone"
                        size={24}
                        // color="black"
                        color={"black"}
                      />
                    </Animated.View>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => {
                      ExpoSpeechRecognitionModule.stop();
                    }}
                    style={styles.micContainer}
                  >
                    <Animated.View
                      style={{ transform: [{ scale: scaleAnim }] }}
                    >
                      {/* <IconSymbol
                          name={isListening ? "mic.fill" : "mic"}
                          size={20}
                          color={isListening ? "#FF4444" : tintColor}
                        /> */}
                      {/* <Feather name="mic" size={24} color={"#FF4444"} /> */}
                      <FontAwesome
                        name="microphone"
                        size={24}
                        // color="black"
                        color={"#FF4444"}
                      />
                    </Animated.View>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate("ai-assistant")}
            style={({ pressed }) => [
              styles.floatingAiButton,
              pressed && styles.floatingAiButtonPressed,
            ]}
          >
            <View style={styles.floatingAiInner}>
              <FontAwesome name="magic" size={22} color="#fff" />
              <Text style={styles.floatingAiText}>Ask AI</Text>
            </View>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
      {/* </AppContainer> */}
    </SafeAreaProvider>
  );
  {
    /* <ScrollView style={{ paddingBottom: 80 }}>
          {settings.volumeChangeEventOptions?.enabled ? (
            <VolumeMeteringAvatar />
          ) : null}

          <Card>
            <Text style={styles.text}>
              {error ? JSON.stringify(error) : "Error messages go here"}
            </Text>
          </Card>

          <Card
            use={ScrollView}
            style={{ height: 140, maxHeight: 140 }}
            contentContainerStyle={{ padding: 10 }}
          >
            <View>
              <Text style={styles.text}>
                Status:{" "}
                <Text style={{ color: status === "idle" ? "green" : "red" }}>
                  {status}
                </Text>
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.text}>
                {transcription || "transcript goes here"}
              </Text>
            </View>
          </Card>

          <Card use={ScrollView} contentContainerStyle={{ paddingBottom: 20 }}>
            <Settings value={settings} onChange={setSettings} />
          </Card>

          <Card
            style={[
              styles.buttonContainer,
              { justifyContent: "space-between" },
            ]}
          >
            {Platform.OS === "android" &&
              settings.requiresOnDeviceRecognition && (
                <View style={styles.flex1}>
                  <DownloadOfflineModelButton
                    locale={settings.lang ?? "en-US"}
                  />
                </View>
              )}

            {status === "idle" ? (
              <BigButton title="Start Recognition" onPress={startListening} />
            ) : (
              <View style={[styles.row, styles.gap1]}>
                <BigButton
                  title="Stop"
                  disabled={status !== "recognizing"}
                  onPress={() => ExpoSpeechRecognitionModule.stop()}
                />
                <BigButton
                  title="Abort"
                  disabled={status !== "recognizing"}
                  onPress={() => ExpoSpeechRecognitionModule.abort()}
                />
              </View>
            )}
          </Card>
        </ScrollView> */
  }
  // );
};

function Settings(props: {
  value: ExpoSpeechRecognitionOptions;
  onChange: (v: ExpoSpeechRecognitionOptions) => void;
}) {
  const { value: settings, onChange } = props;

  const [tab, setTab] = useState<"general" | "android" | "ios" | "other">(
    "general",
  );

  const handleChange = <T extends keyof ExpoSpeechRecognitionOptions>(
    key: T,
    value: ExpoSpeechRecognitionOptions[T],
  ) => {
    onChange({ ...props.value, [key]: value });
  };

  return (
    <View>
      <View style={[styles.flex1, styles.row, styles.mb2, styles.gap1]}>
        <TabButton
          title="General Settings"
          active={tab === "general"}
          onPress={() => {
            setTab("general");
          }}
        />
        <TabButton
          title="Android"
          active={tab === "android"}
          onPress={() => {
            setTab("android");
          }}
        />
        <TabButton
          title="iOS"
          active={tab === "ios"}
          onPress={() => {
            setTab("ios");
          }}
        />
        <TabButton
          title="Other"
          active={tab === "other"}
          onPress={() => {
            setTab("other");
          }}
        />
      </View>
      {tab === "general" && (
        <GeneralSettings value={settings} onChange={handleChange} />
      )}
      {tab === "android" && (
        <AndroidSettings value={settings} onChange={handleChange} />
      )}
      {tab === "other" && (
        <OtherSettings value={settings} onChange={handleChange} />
      )}
      {tab === "ios" && (
        <IOSSettings value={settings} onChange={handleChange} />
      )}
    </View>
  );
}

function IOSSettings(props: {
  value: ExpoSpeechRecognitionOptions;
  onChange: <T extends keyof ExpoSpeechRecognitionOptions>(
    key: T,
    value: ExpoSpeechRecognitionOptions[T],
  ) => void;
}) {
  const { value: settings, onChange: handleChange } = props;

  const updateCategoryOptions = (options: Partial<SetCategoryOptions>) => {
    handleChange("iosCategory", {
      category:
        options.category ?? settings.iosCategory?.category ?? "playAndRecord",
      categoryOptions: options.categoryOptions ??
        settings.iosCategory?.categoryOptions ?? [
          AVAudioSessionCategoryOptions.defaultToSpeaker,
          AVAudioSessionCategoryOptions.allowBluetooth,
        ],
      mode: options.mode ?? settings.iosCategory?.mode ?? "measurement",
    });
  };

  return (
    <View style={styles.gap1}>
      <View style={styles.gap1}>
        <Text style={styles.textLabel}>Task Hint</Text>
        <View style={[styles.row, styles.flexWrap]}>
          {Object.keys(TaskHintIOS).map((hint) => (
            <OptionButton
              key={hint}
              title={hint}
              active={settings.iosTaskHint === hint}
              onPress={() =>
                handleChange("iosTaskHint", hint as keyof typeof TaskHintIOS)
              }
            />
          ))}
        </View>
      </View>
      <View style={styles.gap1}>
        <Text style={styles.textLabel}>Audio Category</Text>
        <View style={[styles.row, styles.flexWrap]}>
          {Object.keys(AVAudioSessionCategory).map((category) => (
            <OptionButton
              key={category}
              title={category}
              active={settings.iosCategory?.category === category}
              onPress={() =>
                updateCategoryOptions({
                  category: category as AVAudioSessionCategoryValue,
                })
              }
            />
          ))}
        </View>
      </View>

      <View style={styles.gap1}>
        <View style={styles.flex1}>
          <Text style={styles.textLabel}>Category Options</Text>
          <View style={[styles.row, styles.flexWrap]}>
            {Object.keys(AVAudioSessionCategoryOptions).map((option) => (
              <CheckboxButton
                key={option}
                title={option}
                checked={Boolean(
                  settings.iosCategory?.categoryOptions?.includes(
                    option as AVAudioSessionCategoryOptionsValue,
                  ),
                )}
                onPress={() => {
                  // Remove the option if it's already selected
                  let newOptions = [
                    ...(settings.iosCategory?.categoryOptions ?? []),
                  ];
                  if (
                    newOptions.includes(
                      option as AVAudioSessionCategoryOptionsValue,
                    )
                  ) {
                    newOptions = newOptions.filter((o) => o !== option);
                  } else {
                    newOptions.push(
                      option as AVAudioSessionCategoryOptionsValue,
                    );
                  }

                  updateCategoryOptions({
                    categoryOptions: newOptions,
                  });
                }}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.gap1}>
        <Text style={styles.textLabel}>Audio Mode</Text>
        <View style={[styles.row, styles.flexWrap]}>
          {Object.keys(AVAudioSessionMode).map((mode) => (
            <OptionButton
              key={mode}
              title={mode}
              active={settings.iosCategory?.mode === mode}
              onPress={() =>
                updateCategoryOptions({
                  mode: mode as AVAudioSessionModeValue,
                })
              }
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function GeneralSettings(props: {
  value: ExpoSpeechRecognitionOptions;
  onChange: <T extends keyof ExpoSpeechRecognitionOptions>(
    key: T,
    value: ExpoSpeechRecognitionOptions[T],
  ) => void;
}) {
  const { value: settings, onChange: handleChange } = props;

  const [supportedLocales, setSupportedLocales] = useState<{
    locales: string[];
    installedLocales: string[];
  }>({ locales: [], installedLocales: [] });

  useEffect(() => {
    ExpoSpeechRecognitionModule.getSupportedLocales({
      androidRecognitionServicePackage:
        settings.androidRecognitionServicePackage,
    })
      .then(setSupportedLocales)
      .catch((err) => {
        console.log(
          "Error getting supported locales for package:",
          settings.androidRecognitionServicePackage,
          err,
        );
      });
  }, [settings.androidRecognitionServicePackage]);

  const locales =
    supportedLocales.locales.length === 0
      ? fallbackLocales
      : supportedLocales.locales;

  return (
    <View>
      <View
        style={[styles.row, styles.flexWrap, { flexDirection: "row", gap: 2 }]}
      >
        <CheckboxButton
          title="Interim Results"
          checked={Boolean(settings.interimResults)}
          onPress={() =>
            handleChange("interimResults", !settings.interimResults)
          }
        />
        <CheckboxButton
          title="Punctuation"
          checked={Boolean(settings.addsPunctuation)}
          onPress={() =>
            handleChange("addsPunctuation", !settings.addsPunctuation)
          }
        />
        <CheckboxButton
          title="OnDevice Recognition"
          checked={Boolean(settings.requiresOnDeviceRecognition)}
          onPress={() =>
            handleChange(
              "requiresOnDeviceRecognition",
              !settings.requiresOnDeviceRecognition,
            )
          }
        />
        <CheckboxButton
          title="Continuous"
          checked={Boolean(settings.continuous)}
          onPress={() => handleChange("continuous", !settings.continuous)}
        />

        <CheckboxButton
          title="Volume events"
          checked={Boolean(settings.volumeChangeEventOptions?.enabled)}
          onPress={() =>
            handleChange("volumeChangeEventOptions", {
              enabled: !settings.volumeChangeEventOptions?.enabled,
              intervalMillis: settings.volumeChangeEventOptions?.intervalMillis,
            })
          }
        />

        {Platform.OS === "ios" && (
          <CheckboxButton
            title="Voice Processing (iOS)"
            checked={Boolean(settings.iosVoiceProcessingEnabled)}
            onPress={() =>
              handleChange(
                "iosVoiceProcessingEnabled",
                !settings.iosVoiceProcessingEnabled,
              )
            }
          />
        )}
      </View>

      <View style={styles.textOptionContainer}>
        <Text style={styles.textLabel}>Max Alternatives</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          autoCorrect={false}
          defaultValue={String(settings.maxAlternatives)}
          onChangeText={(v) => handleChange("maxAlternatives", Number(v) || 1)}
        />
      </View>
      <View>
        <Text style={styles.textLabel}>Locale</Text>
        <Text style={[styles.textLabel, { color: "#999" }]}>
          Your {Platform.OS} device supports {supportedLocales.locales.length}{" "}
          locales ({supportedLocales.installedLocales.length} installed)
        </Text>

        <ScrollView contentContainerStyle={[styles.row, styles.flexWrap]}>
          {locales.map((locale) => {
            const isInstalled =
              Platform.OS === "android" &&
              supportedLocales.installedLocales.includes(locale);

            return (
              <OptionButton
                key={locale}
                color={isInstalled ? "#00c853" : "#999"}
                title={
                  isInstalled
                    ? `${locale} (${
                        supportedLocales.installedLocales.includes(locale)
                          ? "installed"
                          : "not installed"
                      })`
                    : locale
                }
                active={settings.lang === locale}
                onPress={() =>
                  handleChange(
                    "lang",
                    settings.lang === locale ? undefined : locale,
                  )
                }
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const fallbackLocales = [
  "cmn-Hans-CN",
  "cmn-Hant-TW",
  "de-AT",
  "de-BE",
  "de-CH",
  "de-DE",
  "en-AU",
  "en-CA",
  "en-GB",
  "en-IE",
  "en-IN",
  "en-SG",
  "en-US",
  "es-ES",
  "es-US",
  "fr-BE",
  "fr-CA",
  "fr-CH",
  "fr-FR",
  "hi-IN",
  "id-ID",
  "it-CH",
  "it-IT",
  "ja-JP",
  "ko-KR",
  "pl-PL",
  "pt-BR",
  "ru-RU",
  "th-TH",
  "tr-TR",
  "vi-VN",
];

const androidIntentNumberInputOptions = [
  "EXTRA_LANGUAGE_SWITCH_MAX_SWITCHES",
  "EXTRA_ORIGIN",
  "EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS",
  "EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS",
  "EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS",
] satisfies (keyof AndroidIntentOptions)[];

const androidIntentBooleanInputOptions = [
  "EXTRA_ENABLE_BIASING_DEVICE_CONTEXT",
  "EXTRA_ENABLE_LANGUAGE_DETECTION",
  "EXTRA_ENABLE_LANGUAGE_SWITCH",
  "EXTRA_HIDE_PARTIAL_TRAILING_PUNCTUATION",
  "EXTRA_MASK_OFFENSIVE_WORDS",
  "EXTRA_SECURE",
] satisfies (keyof AndroidIntentOptions)[];

function AndroidSettings(props: {
  value: ExpoSpeechRecognitionOptions;
  onChange: <T extends keyof ExpoSpeechRecognitionOptions>(
    key: T,
    value: ExpoSpeechRecognitionOptions[T],
  ) => void;
}) {
  const { value: settings, onChange: handleChange } = props;
  const defaultRecognitionService =
    ExpoSpeechRecognitionModule.getDefaultRecognitionService().packageName;
  const assistantService =
    ExpoSpeechRecognitionModule.getAssistantService().packageName;
  return (
    <View style={styles.gap1}>
      <View>
        <Card style={styles.mb2}>
          <View style={styles.gap1}>
            <Text style={styles.textLabel}>Device preferences</Text>
            {defaultRecognitionService ? (
              <Text style={styles.textSubtle}>
                Default Recognition Service: {defaultRecognitionService}
              </Text>
            ) : null}
            {assistantService ? (
              <Text style={styles.textSubtle}>
                Assistant Service: {assistantService}
              </Text>
            ) : null}
          </View>
        </Card>

        <Text style={styles.textLabel}>Android Recognition Service</Text>
        <View style={[styles.row, styles.flexWrap]}>
          {speechRecognitionServices.map((service) => (
            <OptionButton
              key={service}
              title={service}
              active={settings.androidRecognitionServicePackage === service}
              onPress={() => {
                handleChange("androidRecognitionServicePackage", service);
              }}
            />
          ))}
          {speechRecognitionServices.length === 0 && (
            <Text style={styles.text}>No services found</Text>
          )}
        </View>
      </View>

      <View>
        <Text style={[styles.textLabel, styles.mb2]}>
          Android Intent Options
        </Text>
        <View style={styles.gap1}>
          <View style={styles.flex1}>
            <Text style={styles.textLabel}>EXTRA_LANGUAGE_MODEL</Text>
            <View style={[styles.row, styles.flexWrap]}>
              {["free_form", "web_search"].map((model) => (
                <OptionButton
                  key={model}
                  title={model}
                  active={Boolean(
                    settings.androidIntentOptions?.EXTRA_LANGUAGE_MODEL ===
                    model,
                  )}
                  onPress={() =>
                    handleChange("androidIntentOptions", {
                      ...settings.androidIntentOptions,
                      EXTRA_LANGUAGE_MODEL:
                        model as AndroidIntentOptions["EXTRA_LANGUAGE_MODEL"],
                    })
                  }
                />
              ))}
            </View>
          </View>
          {androidIntentNumberInputOptions.map((key) => (
            <TextInput
              key={key}
              style={[styles.textInput, styles.flex1]}
              keyboardType="number-pad"
              autoCorrect={false}
              placeholder={key}
              defaultValue={
                settings.androidIntentOptions?.[key]
                  ? String(settings.androidIntentOptions?.[key])
                  : ""
              }
              onChangeText={(v) =>
                handleChange("androidIntentOptions", {
                  ...settings.androidIntentOptions,
                  [key]: Number(v) || 0,
                })
              }
            />
          ))}
          {androidIntentBooleanInputOptions.map((key) => (
            <CheckboxButton
              key={key}
              title={key}
              checked={Boolean(settings.androidIntentOptions?.[key]) ?? false}
              onPress={() =>
                handleChange("androidIntentOptions", {
                  ...settings.androidIntentOptions,
                  [key]: !settings.androidIntentOptions?.[key],
                })
              }
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function OtherSettings(props: {
  value: ExpoSpeechRecognitionOptions;
  onChange: <T extends keyof ExpoSpeechRecognitionOptions>(
    key: T,
    value: ExpoSpeechRecognitionOptions[T],
  ) => void;
}) {
  const { value: settings, onChange: handleChange } = props;

  const [recordingPath, setRecordingPath] = useState<string | null>(null);

  useSpeechRecognitionEvent("audiostart", (event) => {
    // Note: don't use this file until the "audioend" event is emitted
    // Note: event.uri will be null if `recordingOptions.persist` is not enabled
    console.log("Recording started for file:", event.uri);
  });

  useSpeechRecognitionEvent("audioend", (event) => {
    // Recording ended, the file is now safe to use
    console.log("Local file path:", event.uri);
    // Android: Will be saved as a .wav file
    // e.g. "file:///data/user/0/expo.modules.speechrecognition.example/cache/recording_1720678500903.wav"
    // iOS: Will be saved as a .wav file
    // e.g. "file:///path/to/Library/Caches/audio_CD5E6C6C-3D9D-4754-9188-D6FAF97D9DF2.wav"
    setRecordingPath(event.uri);
  });

  // Enable audio recording
  return (
    <View style={styles.gap1}>
      <Card style={[styles.row, styles.gap1, styles.flexWrap]}>
        <SmallButton
          title="Get permissions"
          onPress={() => {
            ExpoSpeechRecognitionModule.getPermissionsAsync().then((result) => {
              Alert.alert("Get Permissions result", JSON.stringify(result));
            });
          }}
        />
        <SmallButton
          title="Request permissions"
          onPress={() => {
            ExpoSpeechRecognitionModule.requestPermissionsAsync().then(
              (result) => {
                Alert.alert(
                  "RequestPermissions result",
                  JSON.stringify(result),
                );
              },
            );
          }}
        />
        <SmallButton
          title="Get microphone permissions"
          onPress={() => {
            ExpoSpeechRecognitionModule.getMicrophonePermissionsAsync().then(
              (result) => {
                Alert.alert("Result", JSON.stringify(result));
              },
            );
          }}
        />
        <SmallButton
          title="Request microphone permissions"
          onPress={() => {
            ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync().then(
              (result) => {
                Alert.alert("Result", JSON.stringify(result));
              },
            );
          }}
        />
        <SmallButton
          title="Get speech recognizer permissions"
          onPress={() => {
            ExpoSpeechRecognitionModule.getSpeechRecognizerPermissionsAsync().then(
              (result) => {
                Alert.alert("Result", JSON.stringify(result));
              },
            );
          }}
        />
        <SmallButton
          title="Request speech recognizer permissions"
          onPress={() => {
            ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync().then(
              (result) => {
                Alert.alert("Result", JSON.stringify(result));
              },
            );
          }}
        />
        <SmallButton
          title="Get speech recognizer state"
          onPress={() => {
            ExpoSpeechRecognitionModule.getStateAsync().then((state) => {
              console.log("Current state:", state);
              Alert.alert("Current state", state);
            });
          }}
        />
        <SmallButton
          title="Call isRecognitionAvailable()"
          onPress={() => {
            const isAvailable =
              ExpoSpeechRecognitionModule.isRecognitionAvailable();
            Alert.alert("isRecognitionAvailable()", isAvailable.toString());
          }}
        />
        {Platform.OS === "ios" && (
          <SmallButton
            title="Set audio session active state"
            onPress={() => {
              ExpoSpeechRecognitionModule.setAudioSessionActiveIOS(true, {
                notifyOthersOnDeactivation: false,
              });
            }}
          />
        )}
      </Card>

      <Card>
        <CheckboxButton
          title="Persist audio recording to filesystem"
          checked={Boolean(settings.recordingOptions?.persist)}
          onPress={() => {
            handleChange("recordingOptions", {
              persist: !settings.recordingOptions?.persist,
              outputDirectory: Paths.document.uri ?? undefined,
              outputFileName: "recording.wav",
              // for iOS if you'd like to downsample the audio, set the outputSampleRate + outputEncoding
              outputSampleRate: 16000,
              outputEncoding: "pcmFormatInt16",
            });
          }}
        />
        {settings.recordingOptions?.persist ? (
          <View
            style={{
              borderStyle: "dashed",
              borderWidth: 2,
              padding: 10,
              minHeight: 100,
              flex: 1,
            }}
          >
            {recordingPath ? (
              <View>
                <Text style={styles.text}>
                  Audio recording saved to {recordingPath}
                </Text>
                <BigButton
                  title="Transcribe the recording"
                  color="#539bf5"
                  onPress={() => {
                    ExpoSpeechRecognitionModule.start({
                      lang: "en-US",
                      interimResults: true,
                      audioSource: {
                        uri: recordingPath,
                        audioChannels: 1,
                        audioEncoding: AudioEncodingAndroid.ENCODING_PCM_16BIT,
                        sampleRate: 16000,
                      },
                    });
                  }}
                />
              </View>
            ) : (
              <Text style={styles.text}>
                Waiting for speech recognition to end...
              </Text>
            )}
          </View>
        ) : null}
      </Card>

      <WebSpeechAPIDemo />

      <TranscribeLocalAudioFileDemo />

      <TranscribeRemoteAudioFileDemo
        fileName="remote-en-us-sentence-16000hz-pcm_s16le.wav"
        remoteUrl="https://github.com/jamsch/expo-speech-recognition/raw/main/example/assets/audio-remote/remote-en-us-sentence-16000hz-pcm_s16le.wav"
        audioEncoding={AudioEncodingAndroid.ENCODING_PCM_16BIT}
        description="16000hz 16-bit 1-channel PCM audio file"
      />

      <TranscribeRemoteAudioFileDemo
        fileName="remote-en-us-sentence-16000hz.mp3"
        remoteUrl="https://github.com/jamsch/expo-speech-recognition/raw/main/example/assets/audio-remote/remote-en-us-sentence-16000hz.mp3"
        audioEncoding={AudioEncodingAndroid.ENCODING_MP3}
        description="16000hz MP3 1-channel audio file"
      />

      <TranscribeRemoteAudioFileDemo
        fileName="remote-en-us-sentence-16000hz.ogg"
        remoteUrl="https://github.com/jamsch/expo-speech-recognition/raw/main/example/assets/audio-remote/remote-en-us-sentence-16000hz.ogg"
        audioEncoding={AudioEncodingAndroid.ENCODING_OPUS}
        description="(May not work on iOS) 16000hz ogg vorbis 1-channel audio file"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  text: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  textLabel: {
    fontSize: 12,
    color: "#111",
    fontWeight: "bold",
  },
  textSubtle: {
    fontSize: 10,
    color: "#999",
    fontWeight: "bold",
  },
  textOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  textInput: {
    height: 30,
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
  },
  flex1: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
  },
  flexWrap: {
    flexWrap: "wrap",
  },
  mb2: {
    marginBottom: 8,
  },
  gap1: {
    gap: 4,
  },
  container: { flex: 1 },
  scrollWrapper: { flex: 1 },
  scrollContent: { paddingTop: 80, paddingBottom: 20 },

  // Carousel styles
  carouselWrapper: {
    marginTop: 20,
    marginBottom: 20,
  },
  promoCard: {
    height: 220,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  promoCardText: {
    color: "white",
    fontFamily: "Montserrat-ExtraBold",
    fontSize: 22,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Hero section
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 28,
    borderRadius: 24,
    overflow: "hidden",
  },
  heroGradient: {
    borderRadius: 24,
    padding: 24,
  },
  heroContent: {
    gap: 6,
  },
  greetingLabel: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#fff",
    fontFamily: "Montserrat-ExtraBold",
    fontSize: 24,
    lineHeight: 30,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  // Services section
  servicesSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    // color: "#1a1a2e",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceCard: {
    minWidth: "45%",
    maxWidth: "50%",
    // height: 170,
    borderRadius: 20,
    // overflow: "hi",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 10,
  },
  serviceImageBg: {
    // flex: 1,
    height: 220,
    justifyContent: "flex-end",
    borderRadius: 20,
    overflow: "hidden",
  },
  serviceCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  serviceCardContent: {
    padding: 16,
    zIndex: 2,
  },
  serviceCardTitle: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    fontWeight: 400,
    alignSelf: "flex-start",
    // backgroundColor: "rgba(0,0,0,0.2)",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 3.3 },
    textShadowRadius: 2,
    marginBottom: 10,
  },
  bookNowBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  bookNowText: {
    color: "#fff",
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    fontWeight: "700",
  },

  // Search bar
  stickySearch: {
    position: "absolute",
    top: 8,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: "PlusJakartaSans",
    includeFontPadding: false,
  },
  micContainer: { padding: 4 },
  floatingAiButton: {
    position: "absolute",
    bottom: 120,
    right: 20,
    width: 64,
    height: 64,
    borderWidth: 2,
    borderColor: "rgb(0,0,0,0.5)",
    borderRadius: 20,
    backgroundColor: "#1a73e8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1a73e8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
  },
  floatingAiButtonPressed: {
    transform: [{ scale: 0.92 }],
    shadowOpacity: 0.2,
  },
  floatingAiInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  floatingAiText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
});

export default HomeScreen;
