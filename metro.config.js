// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// mqtt.js relies on package "exports" resolution.
// Only needed on Expo SDK 53 and below — SDK 54+ enables this by default.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
