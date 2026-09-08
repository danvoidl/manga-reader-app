import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Hokusai Manga",
  slug: "reader-app",
  scheme: "expo-starter",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/android-icon-with-bg.png",
  userInterfaceStyle: "dark",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.danvoidl.hokusaimanga",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
    },
    softwareKeyboardLayoutMode: "pan",
    package: "com.danvoidl.hokusaimanga",
    allowBackup: true,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-font",
      {
        fonts: [
          "./node_modules/@react-native-vector-icons/material-design-icons/fonts/MaterialDesignIcons.ttf",
        ],
      },
    ],
    "expo-image",
    "expo-status-bar",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        image: "./assets/android-icon-splash.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#262626",
      },
    ],
    "./plugins/withReleaseSigning",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "03ec70f3-3577-4385-94a7-56cfe979a5a8",
    },
  },
  owner: "danvoidl",
};

export default config;
