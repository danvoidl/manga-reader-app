import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/store/AuthContext";
import { SyncProvider } from "@/store/SyncContext";
import { queryClient } from "@/services/queryClient";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../../global.css";

// Hold the splash until we know whether a session was restored, so a logged-in
// user never sees the login screen flash before the guard resolves.
SplashScreen.preventAutoHideAsync();

// Lives inside AuthProvider so it can read auth state and drive the route guards.
function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  // Keep the splash up while the persisted session is being restored.
  if (loading) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#262626" },
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="manga" />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <AuthProvider>
            <SyncProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </SyncProvider>
          </AuthProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
