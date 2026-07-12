const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);
// watchman can't watch ~/Desktop (macOS privacy restriction); use Node's watcher
config.resolver.useWatchman = false;
module.exports = withNativeWind(config, { input: "./global.css" });
