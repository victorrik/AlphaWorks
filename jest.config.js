module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-vector-icons|@react-navigation|react-native-screens)/)',
  ],
  // LokiJS (test-only DB adapter) keeps a handle open; let Jest exit anyway.
  forceExit: true,
};
