const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure proper file resolution for Expo Router
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config; 