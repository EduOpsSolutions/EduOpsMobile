import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, validateToken } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Validate token on mount
    const checkAuth = async () => {
      const isValid = await validateToken();

      // Check if we're in a protected route
      const inAuthGroup = segments[0] === "auth" || segments[0] === "auth";

      if (!isValid && !inAuthGroup) {
        // User is not authenticated and trying to access protected route
        router.replace("/");
      } else if (isValid && segments[0] === "index") {
        // User is authenticated and on root/login screen, redirect to home
        router.replace("/home");
      }
    };

    checkAuth();
  }, [isAuthenticated, segments]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#de0000" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fffdf2",
  },
});
