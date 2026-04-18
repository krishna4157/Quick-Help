const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAndroidXComponentFactory(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const app = androidManifest.manifest.application[0];

    // Ensure the tools namespace exists
    if (!androidManifest.manifest.$["xmlns:tools"]) {
      androidManifest.manifest.$["xmlns:tools"] =
        "http://schemas.android.com/tools";
    }

    // Append or set tools:replace for appComponentFactory
    if (app.$["tools:replace"]) {
      if (!app.$["tools:replace"].includes("android:appComponentFactory")) {
        app.$["tools:replace"] += ",android:appComponentFactory";
      }
    } else {
      app.$["tools:replace"] = "android:appComponentFactory";
    }

    // Force AndroidX CoreComponentFactory
    app.$["android:appComponentFactory"] =
      "androidx.core.app.CoreComponentFactory";

    return config;
  });
};
