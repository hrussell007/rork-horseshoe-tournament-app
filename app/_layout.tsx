import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Image, StyleSheet, ActivityIndicator, View } from "react-native";
import { TournamentContext } from "@/contexts/TournamentContext";
import { AuthContext, useAuth } from "@/contexts/AuthContext";
import { ThemeContext } from "@/contexts/ThemeContext";
import { NotificationContext } from "@/contexts/NotificationContext";
import { DirectorLogContext } from "@/contexts/DirectorLogContext";
import { BroadcastContext } from "@/contexts/BroadcastContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="tournament/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="match/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="alerts" options={{ headerShown: true }} />
      <Stack.Screen name="bracket/[id]" options={{ headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext>
        <ThemeContext>
          <TournamentContext>
            <DirectorLogContext>
              <BroadcastContext>
                <NotificationContext>
                  <GestureHandlerRootView style={styles.container}>
                <Image 
                  source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/p4o4pqs5culigzv3eaida' }}
                  style={styles.backgroundLogo}
                  resizeMode="contain"
                />
                <RootLayoutNav />
                </GestureHandlerRootView>
                </NotificationContext>
              </BroadcastContext>
            </DirectorLogContext>
          </TournamentContext>
        </ThemeContext>
      </AuthContext>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundLogo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.08,
    zIndex: -1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});
