import axios from 'axios';
import { Alert } from 'react-native';
import { getToken, isTokenExpired, clearAuthData } from './jwt';
import { router } from 'expo-router';
import { getLoggingOut } from './logoutState';

/**
 * Axios instance configured for EduOps Mobile App
 *
 * IMPORTANT: This configuration works with the webClientValidator middleware on the backend.
 * The middleware validates requests from authorized clients (web and mobile).
 *
 * Mobile App Origin Validation:
 * - React Native automatically sends Origin: null (allowed by middleware)
 * - App scheme: "eduopsmobile://" (configured in app.json, allowed by middleware)
 * - User-Agent: React Native default (validated by middleware)
 *
 * Guest Endpoints:
 * - Guest endpoints (like /upload/guest, /enrollment/enroll) use validateWebClientOrigin
 * - Mobile apps are allowed because:
 *   1. Origin is "null" (React Native default) - explicitly allowed
 *   2. User-Agent check is skipped for mobile apps (origin === "null")
 *
 * Allowed Origins in Backend:
 * - "null" (React Native/Expo default)
 * - "exp://localhost:8081" (Expo dev)
 * - "exp://localhost:19000" (Expo dev alternative)
 * - "eduopsmobile://" (production app scheme)
 * - "myapp://" (legacy scheme, also supported)
 */
const apiUrl =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5555/api/v1';
const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
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
          // Token expired - clear auth data
          await clearAuthData();

          // Show alert and redirect to login
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace('/');
                },
              },
            ],
            { cancelable: false }
          );

          // Also redirect after a short delay in case alert is dismissed
          setTimeout(() => {
            router.replace('/');
          }, 100);

          // Reject the request
          return Promise.reject(new Error('Token expired'));
        }

        // Add valid token to Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
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
        // Token expired - clear auth data
        await clearAuthData();

        // Show alert and redirect to login
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/');
              },
            },
          ],
          { cancelable: false }
        );

        // Also redirect after a short delay in case alert is dismissed
        setTimeout(() => {
          router.replace('/');
        }, 100);
      } else if (error.response?.status === 401) {
        // Skip session invalid alert for login endpoint - 401 is expected for wrong credentials
        const isLoginRequest = originalRequest?.url?.includes('/auth/login');
        // Skip alert if user is intentionally logging out
        const isLoggingOut = getLoggingOut();

        if (!isLoginRequest && !isLoggingOut) {
          // 401 without expired token - possibly invalid token (but not a login attempt)
          await clearAuthData();

          Alert.alert(
            'Session Invalid',
            'Your session is no longer valid. Please login again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace('/');
                },
              },
            ],
            { cancelable: false }
          );

          setTimeout(() => {
            router.replace('/');
          }, 100);
        }
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
