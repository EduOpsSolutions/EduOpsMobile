import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { LoginScreen } from "../screens/LoginScreen";
import { getToken, isTokenExpired } from "../utils/jwt";

export const AuthWrapper: React.FC = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { isAuthenticated, validateToken, user } = useAuthStore();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Small delay to ensure store is fully rehydrated
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get token from storage
        const token = await getToken();

        if (token && !isTokenExpired(token)) {
          // Token exists and is valid locally
          console.log("Valid token found, validating with server...");

          // Validate token with server
          const isValid = await validateToken();

          if (isValid && user) {
            console.log("Token validated successfully, redirecting to home");
            router.replace("/home");
            return;
          } else {
            console.log(
              "Token validation failed or no user data, staying on login"
            );
          }
        } else {
          console.log("No valid token found, staying on login");
        }

        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [router, validateToken, user]);

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  // Show login screen if not authenticated
  return <LoginScreen />;
};
