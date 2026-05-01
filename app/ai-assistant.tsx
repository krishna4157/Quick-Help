import { ThemedText } from "@/components/themed-text";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ImageBackground } from "expo-image";
import { useNavigation } from "expo-router";
import * as Speech from "expo-speech";
import type { ExpoSpeechRecognitionOptions } from "expo-speech-recognition";
import {
  ExpoSpeechRecognitionModule,
  SpeechRecognizerErrorAndroid,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Chat message type
type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

// const getSystemInstruction = () => ({
//   role: "system",
//   content: `You are the in-app voice booking assistant for DeliveryApp.

// CURRENT DATE AND TIME (for reference only, do not treat as user input): ${new Date().toString()}

// SUPPORTED LANGUAGES:
// - English
// - Telugu

// IMPORTANT LANGUAGE RULES:
// - Always reply in the same language the user speaks.
// - If the user speaks in Telugu, respond fully in Telugu.
// - Service category names should ALWAYS be spoken exactly as in English (do NOT translate them to Telugu).
//   Example:
//   - Say "Electric Services" not Telugu translation
//   - Say "Laundry Services" not Telugu translation

// Your ONLY job is to help users book these services:
// 1. Electric Services (Fan repair, AC service, lights, wiring, etc.)
// 2. Home/Beauty Services (salon, cleaning, plumbing, etc.)
// 3. Laundry Services
// 4. Care Takers

// STRICT FLOW:
// 1. Ask what service the user needs.
// 2. Identify the category and confirm it with the user.
// 3. Ask for preferred date and time.
// 4. Wait for the user to explicitly provide date/time.

// BOOKING TIME RULES:
// - Never use system time as user input.
// - If service date is today → time must be at least 30 minutes later than current time.
// - If user gives less than 30 minutes:
//   Ask (in user language):
//   "We cannot schedule immediate service. Do you want me to set it 30 minutes later from now?"
// - If user agrees → proceed with adjusted time.
// - If user rejects → ask for another time.

// ONLY call 'book_service' AFTER:
// 1. Service identified
// 2. User confirmed
// 3. Valid time provided
// 4. 30-minute rule satisfied

// TELUGU UNDERSTANDING RULE:
// - Users may speak Telugu but mention services in English words.
// - Example inputs:
//   - "AC repair kavali"
//   - "fan fix cheyyali"
//   - "laundry ivvali"
// - Correctly map these to service categories.

// FALLBACK:
// If user asks unrelated questions:
// Reply exactly:
// "This is out of context, please ask about the services we are offering."
// Then list available services.`,
// });
// const getSystemInstruction = () => ({
//   role: "system",
//   content: `You are the in-app voice booking assistant for DeliveryApp.

// CURRENT DATE AND TIME (for reference only, do not treat as user input): ${new Date().toString()}

// SUPPORTED LANGUAGES:
// - English
// - Telugu

// IMPORTANT LANGUAGE RULES:
// - Always reply in the same language the user speaks.
// - If the user speaks in Telugu, respond fully in Telugu.
// - Service category names should ALWAYS be spoken exactly as in English (do NOT translate them).

// SERVICES:
// 1. Electric Services
// 2. Home/Beauty Services
// 3. Laundry Services
// 4. Care Takers

// -----------------------------------
// 🚨 STRICT STATE-BASED FLOW (MANDATORY)
// -----------------------------------

// STATE 1: SERVICE IDENTIFICATION
// - Ask what service user needs.
// - If user says "Laundry" or similar → map to "Laundry Services"
// - ALWAYS confirm:
//   Example:
//   EN: "You want Laundry Services, correct?"
//   TE: "మీకు Laundry Services కావాలా?"

// 👉 DO NOT ask date/time yet.

// -----------------------------------

// STATE 2: DATE & TIME COLLECTION
// - ONLY after user CONFIRMS service

// 👉 CRITICAL RULE:
// - If user did NOT provide date/time → YOU MUST ASK for it.
// - NEVER assume, generate, or auto-fill date/time.
// - NEVER use system time as booking time.

// Example:
// EN: "Please tell me your preferred date and time."
// TE: "మీకు కావాల్సిన తేదీ మరియు సమయం చెప్పండి."

// -----------------------------------

// 🚫 STRICT PROHIBITIONS (VERY IMPORTANT)

// - DO NOT auto-fill time
// - DO NOT assume "now"
// - DO NOT use system time as booking time
// - DO NOT proceed to booking without explicit user-provided date & time

// If user only says:
// 👉 "Laundry"
// 👉 "AC repair kavali"

// YOU MUST:
// ✔ Identify service
// ✔ Confirm service
// ❌ DO NOT set time
// ❌ DO NOT proceed

// -----------------------------------

// BOOKING TIME VALIDATION
// -----------------------------------

// - If date is today → time must be at least 30 mins later
// - If invalid:
// Ask:
// EN: "We cannot schedule immediate service. Do you want me to set it 30 minutes later from now?"
// TE: "ఇప్పుడే సర్వీస్ బుక్ చేయలేము. 30 నిమిషాల తర్వాత పెట్టాలా?"

// -----------------------------------

// FUNCTION CALL RULE 🚨
// -----------------------------------

// ONLY call 'book_service' IF ALL ARE TRUE:
// 1. Service identified
// 2. User confirmed
// 3. User PROVIDED date
// 4. User PROVIDED time
// 5. Time passes 30-min rule

// 👉 If ANY of these missing → DO NOT CALL FUNCTION

// -----------------------------------

// TELUGU UNDERSTANDING
// -----------------------------------

// - "AC repair kavali" → Electric Services
// - "laundry ivvali" → Laundry Services
// - "fan fix cheyyali" → Electric Services

// -----------------------------------

// FALLBACK
// -----------------------------------

// If unrelated:
// "This is out of context, please ask about the services we are offering."
// Then list services.

// - You are NOT allowed to call 'book_service' if ANY required information is missing.
// - Required information:
//   1. service_name
//   2. date (from user)
//   3. time (from user)

// - If date or time is missing:
//   👉 DO NOT generate placeholders like:
//      - "YYYYMMDD"
//      - "HH:mm"
//      - "now"
//      - "2026-04-25T??:??:??Z"
//      - system time
// It should be compatible param for new Date() constructor in javascript, and also avoid booking less than 30 min from current time if date is today.

// Return booking time in local timezone Asia/Kolkata.
// Example:
// if user scheduled time is "Today 5:30 PM" output should be "2026-04-25T12:00:00.000Z"

// - If user has not explicitly provided date/time:
//   👉 You MUST ask for it
//   👉 You MUST NOT call function

// - Any violation is considered incorrect behavior.
// CRITICAL RULE:

// If the user has NOT explicitly provided date and time:
// - You MUST ask for it
// - You MUST NOT generate or assume any time
// - You MUST NOT call any function

// Even if you know current time, DO NOT use it.

// If user provides a time less than 30 minutes from now:
// DO NOT proceed.
// Ask user if they want to schedule 30 minutes later.
// `,
// });
const getSystemInstruction = () => ({
  role: "system",
  content: `You are the in-app voice booking assistant for DeliveryApp.

CURRENT DATE AND TIME (for reference only, do not treat as user input): ${new Date().toString()}

SUPPORTED LANGUAGES:
- English
- Telugu

IMPORTANT LANGUAGE RULES:
- Always reply in the same language the user speaks.
- If the user speaks in Telugu, respond fully in Telugu.
- Service category names should ALWAYS be spoken exactly as in English (do NOT translate them).
- Below is the Data of What Services we are offering and which services comes inside which one:
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
  {
    category: "Pet Services",
    workTypes: ["petCareTaker", "petGroomer", "dogWalker"],
  },
];


STRICT RULES:
- Ask what service the user needs.
- If the service is mentioned, confirm it.
- If date/time is not explicitly provided by the user, ask for it.
- Never invent, assume, or auto-fill a booking time.
- Never use the current system time as the booking time.
- Never call book_service without explicit user-provided date and time.
- If a booking time is less than 30 minutes from now and the date is today, do not proceed.
- In that case ask whether the user wants to move it to 30 minutes later.
- If the user replies with another explicit time, use that new time and revalidate it.
- If the user only confirms "yes" to the 30-minute suggestion, use the current time with 30 mintutes added.
- Return booking time in local timezone Asia/Kolkata. Example: if user scheduled time is "Today 5:30 PM" output should be "2026-04-25T12:00:00.000Z"


TELUGU UNDERSTANDING:
- "AC repair kavali" -> Electric Services
- "laundry ivvali" -> Laundry Services
- "fan fix cheyyali" -> Electric Services

FALLBACK:
If unrelated:
"This is out of context, thank you for using this service."`,
});

const OPENROUTER_API_KEY =
  "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"; // Move this to .env later

const parseAiTimeAsLocalIfNeeded = (time?: string) => {
  if (!time) return null;
  const cleaned = time.endsWith("Z") ? time.replace(/Z$/i, "") : time;
  const parsed = new Date(cleaned);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const extractDateTimeFromText = async (
  text: string,
): Promise<string | null> => {
  // Best-effort local parser for explicit phrases.
  // Replace with your own parser if you already have one.
  // If the model/tool returns a time string, prefer that over this helper.
  const trimmed = text.trim();
  if (!trimmed) return null;

  const now = new Date();
  const lower = trimmed.toLowerCase();

  const base = new Date(now);

  if (
    lower.includes("tomorrow") ||
    lower.includes("repu") ||
    lower.includes("రేపు")
  ) {
    base.setDate(base.getDate() + 1);
  } else if (lower.includes("today") || lower.includes("ఈ రోజు")) {
    // keep today
  }

  const timeMatch = trimmed.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3].toLowerCase();

    if (meridian === "pm" && hour !== 12) hour += 12;
    if (meridian === "am" && hour === 12) hour = 0;

    base.setHours(hour, minute, 0, 0);
    return base.toISOString();
  }

  return null;
};

// const buildSystemPrompt = () => [SYSTEM_INSTRUCTION];

export default function AIAssistantScreen() {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const newLang = i18n.language === "en" ? "en" : "te";

  const [error, setError] = useState<{ error: string; message: string } | null>(
    null,
  );
  const transcriptTallyRef = useRef<string>("");
  const [transcription, setTranscription] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string; reasoning_details?: any }[]
  >([getSystemInstruction()]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "starting" | "recognizing">(
    "idle",
  );
  const [settings, setSettings] = useState<ExpoSpeechRecognitionOptions>({
    lang: "en-IN",
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
  const [scaleAnim] = useState(new Animated.Value(1));
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Refs for duplicate-prevention & cancellation ───
  const abortControllerRef = useRef<AbortController | null>(null);
  const processingLockRef = useRef(false);
  const lastProcessedTranscriptRef = useRef<string>("");
  const pendingBookingRef = useRef<{
    service_name: string;
    proposedTimeISO: string;
    awaiting30MinConfirm: boolean;
  } | null>(null);

  const hasExplicitTime = (text: string) =>
    /(\d{1,2}(:\d{2})?\s?(am|pm)|today|tomorrow|repu|ఈ రోజు|రేపు|morning|evening|night|noon|midnight)/i.test(
      text,
    );

  // const isAffirmative = (text: string) =>
  //   /^(yes|yeah|ok|okay|proceed|continue|sure|ha|avunu|sare|yes proceed)$/i.test(
  //     text.trim(),
  //   );
  const isAffirmative = (text: string) =>
    /\b(yes|yeah|ok|okay|proceed|continue|sure|avunu|sare|yep)\b/i.test(
      text.trim(),
    );

  const isNegative = (text: string) =>
    /^(no|nope|cancel|vaddu|ledu|stop|not now|don't)$/i.test(text.trim());

  const startListeningForAI = async (ignoreStatus?: boolean) => {
    Speech.stop();
    // If an API call is in progress and user clicks mic → cancel it and restart fresh
    if (isAiThinking || processingLockRef.current) {
      console.log("Cancelling in-progress API and restarting listening");
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      Speech.stop();
      ExpoSpeechRecognitionModule.stop();
      setIsAiThinking(false);
      processingLockRef.current = false;
      setStatus("idle");
      transcriptTallyRef.current = "";
      setTranscription("");
      setSearchQuery("");
      // Small delay to let state settle before starting fresh
      setTimeout(() => {
        startListeningForAI(true);
      }, 200);
      return;
    }

    if (status !== "idle" && !ignoreStatus) {
      alert(JSON.stringify({ status, error }));
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

    console.log(settings.lang);

    ExpoSpeechRecognitionModule.start(settings);
    setTimeout(() => {
      ExpoSpeechRecognitionModule.stop();
    }, 8000);
  };

  const speakResponse = (text: string, languageCode: string) => {
    Speech.speak(text, {
      language: languageCode,
      onDone: () => {
        console.log("Speech finished");
        setSearchQuery("");
        // Only restart listening if we are not still processing (safety check)
        if (!processingLockRef.current && !isAiThinking) {
          console.log("Starting listener again");
          if (transcription.trim().length > 0) {
            startListeningForAI(true);
          }
        }
      },
    });
  };

  const MIN_DELAY_MINUTES = 30;

  const isValidFutureTime = (timeISO: string) => {
    const now = new Date();
    const bookingTime = new Date(timeISO);

    const diffMinutes = (bookingTime.getTime() - now.getTime()) / (1000 * 60);

    return diffMinutes >= MIN_DELAY_MINUTES;
  };

  const processAIResponse = async (userText: string) => {
    //     const handledPending = await handlePendingBooking(userText);
    // if (handledPending) return;
    if (!userText.trim()) return;
    const pending = pendingBookingRef.current;

    if (pending) {
      const trimmed = userText.trim();

      // User gives a NEW explicit time/date -> replace previous pending time
      if (hasExplicitTime(trimmed)) {
        const newTimeISO = await extractDateTimeFromText(trimmed);

        if (newTimeISO) {
          if (!isValidFutureTime(newTimeISO)) {
            pendingBookingRef.current = {
              service_name: pending.service_name,
              proposedTimeISO: newTimeISO,
              awaiting30MinConfirm: true,
            };

            speakResponse(
              newLang === "te"
                ? "ఇప్పుడే సర్వీస్ బుక్ చేయలేము. 30 నిమిషాల తర్వాత పెట్టాలా?"
                : "We cannot schedule immediate service. Do you want me to set it 30 minutes later from now?",
              newLang === "en" ? "en-US" : "te-IN",
            );
            return;
          }

          pendingBookingRef.current = null;

          alert("CALLED");
          speakResponse(
            `All set. Scheduling ${pending.service_name} for ${new Date(
              newTimeISO,
            ).toLocaleString("en-IN")}. Proceeding to checkout.`,
            newLang === "en" ? "en-US" : "te-IN",
          );

          navigation.navigate("schedule-details", {
            amountInRupees: 500,
            service: pending.service_name,
            time: newTimeISO,
          });
          setChatHistory([getSystemInstruction()]);

          setChatMessages([]);
          return;
        }
      }

      // User confirms the suggested 30-minute later time
      if (pending.awaiting30MinConfirm && isAffirmative(trimmed)) {
        const adjusted = new Date(pending.proposedTimeISO);
        adjusted.setMinutes(adjusted.getMinutes() + 30);

        pendingBookingRef.current = null;
        alert("CALLED 2");
        speakResponse(
          `All set. Scheduling ${pending.service_name} for ${adjusted.toLocaleString(
            "en-IN",
          )}. Proceeding to checkout.`,
          newLang === "en" ? "en-US" : "te-IN",
        );

        navigation.navigate("schedule-details", {
          amountInRupees: 500,
          service: pending.service_name,
          time: adjusted.toISOString(),
        });
        setChatHistory([getSystemInstruction()]);

        setChatMessages([]);

        return;
      }

      // User rejects the suggestion
      if (isNegative(trimmed)) {
        pendingBookingRef.current = null;
        speakResponse(
          newLang === "te"
            ? "సరే. దయచేసి మరో సమయం చెప్పండి."
            : "Okay. Please tell me another preferred time.",
          newLang === "en" ? "en-US" : "te-IN",
        );
        return;
      }
    }

    // Prevent duplicate processing
    if (processingLockRef.current) {
      console.log("processAIResponse already running, ignoring duplicate call");
      return;
    }

    processingLockRef.current = true;
    setIsAiThinking(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userText,
      isUser: true,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);

    const updatedHistory = [
      ...chatHistory,
      { role: "user", content: userText },
    ];
    setChatHistory(updatedHistory);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://deliveryapp.com",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b:free",
            // model: "nvidia/nemotron-3-super-120b-a12b:free",
            messages: updatedHistory,
            reasoning: { enabled: true },
            tools: [
              {
                type: "function",
                function: {
                  name: "book_service",
                  description:
                    "Trigger this when the user confirms the service and time.",
                  parameters: {
                    type: "object",
                    properties: {
                      service_name: { type: "string" },
                      time: {
                        type: "string",
                        description:
                          "The scheduled time converted to a strict ISO 8601 string format (e.g., 'YYYY-MM-DDTHH:mm:ssZ'). Calculate this relative to the CURRENT DATE AND TIME provided in the system prompt.",
                      },
                    },
                    required: ["service_name", "time"],
                  },
                },
              },
            ],
          }),
          signal: abortControllerRef.current.signal,
        },
      );

      // If the request was aborted, exit early
      if (abortControllerRef.current?.signal.aborted) {
        console.log("API call was aborted");
        return;
      }

      const data = await response.json();

      if (data.error) {
        console.error("OPENROUTER ERROR:", JSON.stringify(data.error, null, 2));
        speakResponse(
          "Sorry, there is an issue with the AI server right now.",
          newLang === "en" ? "en-US" : "te-IN",
        );
        return;
      }

      if (!data.choices || data.choices.length === 0) {
        console.error("NO CHOICES RETURNED:", JSON.stringify(data, null, 2));
        return;
      }

      const aiMessage = data.choices[0].message;

      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        try {
          const args = JSON.parse(aiMessage.tool_calls[0].function.arguments);
          if (args.time === undefined || args.service_name === undefined) {
            speakResponse(
              "I still didnt got your scheduled service or time, can you please repeat again to confirm",
              newLang === "en" ? "en-US" : "te-IN",
            );
            return;
          }
          // if (!isValidFutureTime(args.time)) {
          //   console.log("❌ Immediate booking blocked");

          //   speakResponse(
          //     newLang === "te"
          //       ? "ఇప్పుడే సర్వీస్ బుక్ చేయలేము. 30 నిమిషాల తర్వాత పెట్టాలా?"
          //       : "We cannot schedule immediate service. Do you want me to set it 30 minutes later from now?",
          //     newLang === "en" ? "en-US" : "te-IN",
          //   );

          //   return; // 🚫 STOP here
          // }
          if (!isValidFutureTime(args.time)) {
            console.log("❌ Immediate booking blocked");

            pendingBookingRef.current = {
              service_name: args.service_name,
              proposedTimeISO: args.time,
              awaiting30MinConfirm: true,
            };

            speakResponse(
              newLang === "te"
                ? "ఇప్పుడే సర్వీస్ బుక్ చేయలేము. 30 నిమిషాల తర్వాత పెట్టాలా?"
                : "We cannot schedule immediate service. Do you want me to set it 30 minutes later from now?",
              newLang === "en" ? "en-US" : "te-IN",
            );

            return;
          }
          alert("CALLED 3");
          speakResponse(
            `All set. Scheduling ${args.service_name} for ${args.time.toLocaleString(
              "en-IN",
            )}. Proceeding to checkout.`,
            newLang === "en" ? "en-US" : "te-IN",
          );
          setChatHistory([getSystemInstruction()]);
          console.log("Function call arguments:", args);
          pendingBookingRef.current = null;
          // speakResponse(
          //   `All set. Scheduling ${args.service_name} for ${args.time}. Proceeding to checkout.`,
          //   newLang === "en" ? "en-US" : "te-IN",
          // );
          pendingBookingRef.current = null;
          console.log("Function call arguments:", args);
          navigation.navigate("schedule-details", {
            amountInRupees: 500,
            service: args.service_name,
            time: args.time,
          });

          setChatHistory([getSystemInstruction()]);

          setChatMessages([]);

          return;
        } catch (parseError) {
          console.error("Failed to parse tool arguments:", parseError);
        }
      }

      const aiTextResponse = aiMessage.content || "I didn't catch that.";

      setChatHistory([
        ...updatedHistory,
        {
          role: "assistant",
          content: aiTextResponse,
          reasoning_details: aiMessage.reasoning_details,
        },
      ]);

      const aiMessageUI: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiTextResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessageUI]);

      console.log("AI Response:", aiTextResponse);

      speakResponse(aiTextResponse, newLang === "en" ? "en-US" : "te-IN");
    } catch (error: any) {
      if (error?.name === "AbortError" || error?.message?.includes("aborted")) {
        console.log("Fetch aborted by user");
        return;
      }
      console.error("Network/Fetch Error:", error);
      speakResponse(
        "Sorry, I am having trouble connecting to the AI server.",
        newLang === "en" ? "en-US" : "te-IN",
      );
    } finally {
      setIsAiThinking(false);
      processingLockRef.current = false;
      abortControllerRef.current = null;
    }
  };

  useSpeechRecognitionEvent("result", (ev) => {
    console.log("[event]: result", {
      isFinal: ev.isFinal,
      transcripts: ev.results.map((result) => result.transcript),
    });

    // Use the last result to avoid duplicate accumulation issues
    const lastResult = ev.results[ev.results.length - 1];
    const transcript = lastResult?.transcript || "";

    if (ev.isFinal) {
      transcriptTallyRef.current += transcript;
      setTranscription(transcriptTallyRef.current);
    } else {
      setTranscription(transcriptTallyRef.current + transcript);
    }

    setSearchQuery(transcriptTallyRef.current + transcript);
  });

  useSpeechRecognitionEvent("start", () => {
    transcriptTallyRef.current = "";
    setTranscription("");
    setStatus("recognizing");
  });

  useSpeechRecognitionEvent("end", () => {
    console.log("[event]: end");
    setStatus("idle");
    if (transcription.trim().length > 0 && !processingLockRef.current) {
      // Prevent processing the exact same transcript twice
      if (transcription !== lastProcessedTranscriptRef.current) {
        lastProcessedTranscriptRef.current = transcription;
        processAIResponse(transcription);
      } else {
        console.log("Skipping duplicate transcript processing");
      }
    }
    // Reset transcription after processing to prevent re-processing on next end event
    transcriptTallyRef.current = "";
    setTranscription("");
  });

  useSpeechRecognitionEvent("error", (ev) => {
    console.log(
      "[event]: error",
      ev.error,
      ev.message,
      ev.code ? `code: ${ev.code}` : "",
    );

    switch (ev.code) {
      case SpeechRecognizerErrorAndroid.ERROR_NETWORK_TIMEOUT:
        break;
      case SpeechRecognizerErrorAndroid.ERROR_TOO_MANY_REQUESTS:
        break;
      case -1:
        break;
    }

    setError(ev);
  });

  useSpeechRecognitionEvent("nomatch", () => {
    console.log("[event]: nomatch");
  });

  useSpeechRecognitionEvent("languagedetection", (ev) => {
    console.log("[event]: languagedetection", ev);
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ImageBackground
        source={
          !isAiThinking
            ? require("../ai_background_b.gif")
            : require("../ai_background.gif")
        }
        style={styles.background}
        blurRadius={100}
      >
        {/* Dark overlay to enhance blur effect */}
        <View style={styles.overlay} />

        {/* Language switcher - top right */}
        {/* <Pressable
          onPress={() => {
            i18n.changeLanguage(newLang == "en" ? "te" : "en").then(() => {
              alert(newLang);
              setSettings((prev) => ({
                ...prev,
                lang: newLang === "en" ? "te-IN" : "en-US",
              }));
            });
          }}
          style={styles.langSwitcher}
        >
          <Text style={styles.langText}>
            {i18n.language.toUpperCase() == "TE" ? "Telugu" : "English"}
          </Text>
        </Pressable> */}
        {chatMessages.length === 0 && (
          <View style={styles.welcomeContainer}>
            <ThemedText style={styles.welcomeText}>
              {newLang === "en"
                ? "Hello! How can I help you today?"
                : "Namaste! EMI kavali? (What do you need?)"}
            </ThemedText>
          </View>
        )}
        {/* Chat Messages Display */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          ref={(ref) => ref?.scrollToEnd({ animated: true })}
        >
          {/* Welcome message if no chat yet */}

          {/* Chat messages */}
          {chatMessages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.chatBubbleContainer,
                message.isUser
                  ? styles.userBubbleContainer
                  : styles.aiBubbleContainer,
              ]}
            >
              <View
                style={[
                  styles.chatBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <ThemedText
                  style={[
                    styles.chatBubbleText,
                    // message.isUser
                    //   ? styles.userBubbleText
                    //   : styles.aiBubbleText,
                  ]}
                >
                  {message.text}
                </ThemedText>
                <Text style={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          ))}

          {/* Show current speech-to-text result while listening */}
          {searchQuery && status !== "idle" && (
            <View
              style={[styles.chatBubbleContainer, styles.userBubbleContainer]}
            >
              <View style={[styles.chatBubble, styles.userBubble]}>
                <ThemedText style={[styles.chatBubbleText]}>...</ThemedText>
                <Text style={styles.listeningIndicator}>🎤 Listening...</Text>
              </View>
            </View>
          )}

          {/* Loader shown after text cards when AI is thinking */}
          {isAiThinking && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#1a73e8" />
              <Text style={styles.loaderText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom button bar - Google Phone UI style */}
        <View style={styles.bottomBar}>
          {/* Close button - pill shape */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.pillButton,
              {
                backgroundColor: "red",
              },
              styles.closeButton,
              pressed && styles.pillButtonPressed,
            ]}
          >
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </Pressable>
          //
          {/* <Pressable
          onPress={() => {
            i18n.changeLanguage(newLang == "en" ? "te" : "en").then(() => {
              alert(newLang);
              setSettings((prev) => ({
                ...prev,
                lang: newLang === "en" ? "te-IN" : "en-US",
              }));
            });
          }}
          style={styles.langSwitcher}
        >
          <Text style={styles.langText}>
            {i18n.language.toUpperCase() == "TE" ? "Telugu" : "English"}
          </Text>
        </Pressable> */}
          //
          {/* Mic button - large circular */}
          {status === "idle" ? (
            <Pressable
              onPress={() => startListeningForAI()}
              style={({ pressed }) => [
                styles.micButton,
                isAiThinking && styles.micButtonThinking,
                pressed && styles.micButtonPressed,
              ]}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <FontAwesome
                  name={isAiThinking ? "microphone-slash" : "microphone"}
                  size={28}
                  color="#fff"
                />
              </Animated.View>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => ExpoSpeechRecognitionModule.stop()}
              style={({ pressed }) => [
                styles.micButton,
                styles.micButtonActive,
                pressed && styles.micButtonPressed,
              ]}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <FontAwesome name="microphone" size={28} color="#fff" />
              </Animated.View>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              i18n.changeLanguage(newLang == "en" ? "te" : "en").then(() => {
                alert(newLang);
                setSettings((prev) => ({
                  ...prev,
                  lang: newLang === "en" ? "te-IN" : "en-US",
                }));
              });
            }}
            style={({ pressed }) => [
              styles.pillButton,
              {
                // backgroundColor: "red",
              },
              styles.closeButton,
              pressed && styles.pillButtonPressed,
            ]}
          >
            <Text style={[styles.closeButtonText, { color: "black" }]}>
              {i18n.language.toUpperCase() == "TE" ? "Telugu" : "English"}
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 0,
  },
  langSwitcher: {
    position: "absolute",
    top: 50,
    right: 20,
    // width: 80,
    // height: 80,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: "grey",
    elevation: 5,
    borderWidth: 1,
    borderColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
  },
  langText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 20,
  },
  welcomeContainer: {
    position: "absolute",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    // height: "100%",
    // backgroundColor: "green",
  },
  welcomeText: {
    fontSize: 18,
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "rgb(0,0,0,0.4)",
    padding: 15,
    borderRadius: 26,
    // color: "#666",
    textAlign: "center",
  },
  chatBubbleContainer: {
    marginVertical: 6,
    maxWidth: "80%",
  },
  userBubbleContainer: {
    alignSelf: "flex-start",
    marginRight: "20%",
  },
  aiBubbleContainer: {
    alignSelf: "flex-end",
    marginLeft: "20%",
  },
  chatBubble: {
    padding: 14,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "rgb(0,0,0,0.5)",
    borderBottomLeftRadius: 4,
  },
  aiBubble: {
    backgroundColor: "rgb(0,0,0,0.5)",
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  chatBubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userBubbleText: {
    color: "#000",
  },
  aiBubbleText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  listeningIndicator: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 10,
    marginLeft: 10,
    gap: 8,
  },
  loaderText: {
    fontSize: 13,
    color: "#666",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    gap: 16,
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    // width: 240,
    // paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 14,
    backgroundColor: "#E8EAED",
    minHeight: 48,
  },
  pillButtonPressed: {
    backgroundColor: "#DADCE0",
    transform: [{ scale: 0.96 }],
  },
  closeButton: {
    // flex: 1,
    width: 100,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#1a73e8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1a73e8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micButtonActive: {
    backgroundColor: "#FF4444",
    shadowColor: "#FF4444",
  },
  micButtonThinking: {
    backgroundColor: "#F4B400",
    shadowColor: "#F4B400",
  },
  micButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
});
