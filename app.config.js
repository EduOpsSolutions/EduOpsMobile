const { withAndroidManifest } = require('@expo/config-plugins');

const withCleartextTraffic = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];

    // Add usesCleartextTraffic to application tag
    application.$['android:usesCleartextTraffic'] = 'true';

    return config;
  });
};

module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      withCleartextTraffic
    ]
  };
};
