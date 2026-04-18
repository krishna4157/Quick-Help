export default ({ config }) => {
  // If the EAS build environment variable exists, use its temporary file path
  if (process.env.GOOGLE_SERVICES_JSON) {
    if (!config.android) config.android = {};
    config.android.googleServicesFile = process.env.GOOGLE_SERVICES_JSON;
  }

  return config;
};
