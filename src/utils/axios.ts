import axios from "axios";
import { Alert } from "react-native";
import { getToken, isTokenExpired, clearAuthData } from "./jwt";

// Create axios instance with base URL from environment
const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.7:5555/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to requests and check expiration
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Get token from storage
      const token = await getToken();

      if (token) {
        // Check if token is expired before making request
        if (isTokenExpired(token)) {
          console.log("Token expired during request, clearing auth data");
          // Token expired - clear auth data
          await clearAuthData();

          // Don't show alert here as it might interrupt user flow
          // The response interceptor will handle showing appropriate messages

          // Reject the request
          return Promise.reject(new Error("Token expired"));
        }

        // Add valid token to Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401/403 errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 or 403 (Unauthorized/Forbidden)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Check if it's a token expiration issue
      const token = await getToken();

      if (token && isTokenExpired(token)) {
        console.log("Token expired in response, clearing auth data");
        // Token expired - clear auth data
        await clearAuthData();

        // Only show alert for user-initiated actions, not background requests
        if (originalRequest?.showExpirationAlert !== false) {
          Alert.alert(
            "Session Expired",
            "Your session has expired. Please login again.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Navigation will be handled by the auth store
                },
              },
            ]
          );
        }
      } else if (error.response?.status === 403) {
        // 403 without expired token might be a permission issue
        // Don't log out, just show error
        console.log("Permission denied:", error.response?.data?.message);
      }
    }

    // Reject the promise with the error
    return Promise.reject(error);
  }
);

// Helper function to make requests without showing expiration alerts
export const makeSilentRequest = (config: any) => {
  return axiosInstance({
    ...config,
    showExpirationAlert: false,
  });
};

export default axiosInstance;
