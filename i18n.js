import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import te from "./te.json";

const resources = {
  en: { translation: en },
  te: { translation: te },
};

i18n.use(initReactI18next).init({
  resources,
  // Automatically detect device language or fallback to English
  lng: Localization.getLocales()[0].languageCode,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
