import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../utils/axios';
import {
  decodeToken,
  setToken,
  getToken,
  setUser,
  getUser,
  clearAuthData,
  isTokenExpired,
} from '../utils/jwt';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { clearProfilePictureCache } from '../components/UserAvatar';

interface User {
  id: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: string;
  status: string;
  profilePicLink?: string;
  course?: string;
  phoneNumber?: string;
  birthmonth?: number;
  birthdate?: number;
  birthyear?: number;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: (redirectToLogin?: boolean) => Promise<void>;
  register: (userData: any) => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  validateToken: () => Promise<boolean>;
  refreshToken: () => Promise<void>;

  // Utility methods
  getUser: () => User | null;
  getToken: () => string | null;
  getUserFullName: () => string;
  getBirthday: () => string;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Make login request
          console.log('Login request:', email, password);
          const response = await axiosInstance.post('/auth/login', {
            email,
            password,
          });

          // Extract token from response
          const token = response.data.token?.token || response.data.token;

          if (!token) {
            throw new Error('No token received from server');
          }

          // Store token in AsyncStorage
          await setToken(token);

          // Decode token to get user data
          const decodedToken = decodeToken(token);

          if (!decodedToken || !decodedToken.data) {
            throw new Error('Invalid token format');
          }

          const userData = decodedToken.data;

          // Check if user is active
          if ((userData as User).status !== 'active') {
            throw new Error(
              'Your account is not active. Please contact support.'
            );
          }

          if ((userData as User).role !== 'student') {
            throw new Error('Only students can access the app');
          }

          // Store user data in AsyncStorage
          await setUser(userData);

          // Update store state
          set({
            token,
            user: userData as User,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('Login successful:', (userData as User).email);
        } catch (error: any) {
          console.log('Login error:', JSON.stringify(error));
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Login failed. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });

          // Clear stored data on error
          await clearAuthData();

          throw new Error(errorMessage);
        }
      },

      // Logout action
      logout: async (redirectToLogin = true) => {
        try {
          // Get user ID before clearing auth data
          const userId = get().user?.id;

          // Clear all auth data from AsyncStorage
          await clearAuthData();

          // Clear cached profile picture
          await clearProfilePictureCache(userId);

          // Reset store state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });

          console.log('Logout successful');

          if (redirectToLogin) {
            router.replace('/');
          }
        } catch (error) {
          console.error('Error during logout:', error);
        }
      },

      // Register action
      register: async (userData: any) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axiosInstance.post('/auth/register', userData);

          Alert.alert(
            'Registration Successful',
            'Your account has been created. Please login.',
            [{ text: 'OK' }]
          );

          set({ isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Registration failed. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
          });

          throw new Error(errorMessage);
        }
      },

      // Update profile
      updateProfile: async (userData: any) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axiosInstance.put('/users/profile', userData);

          const updatedUser = response.data.data || response.data;

          // Update user data in storage and state
          await setUser(updatedUser);

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });

          Alert.alert('Success', 'Profile updated successfully', [
            { text: 'OK' },
          ]);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Profile update failed. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
          });

          throw new Error(errorMessage);
        }
      },

      // Change password
      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          await axiosInstance.post('/auth/change-password', {
            currentPassword,
            newPassword,
          });

          set({ isLoading: false, error: null });

          Alert.alert('Success', 'Password changed successfully', [
            { text: 'OK' },
          ]);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Password change failed. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
          });

          throw new Error(errorMessage);
        }
      },

      // Forgot password
      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          await axiosInstance.post('/auth/forgot-password', { email });

          set({ isLoading: false, error: null });

          Alert.alert(
            'Success',
            'Password reset link has been sent to your email.',
            [{ text: 'OK' }]
          );
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to send reset link. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
          });

          throw new Error(errorMessage);
        }
      },

      // Reset password
      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          await axiosInstance.post('/auth/reset-password', {
            token,
            newPassword,
          });

          set({ isLoading: false, error: null });

          Alert.alert('Success', 'Password reset successfully. Please login.', [
            { text: 'OK' },
          ]);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Password reset failed. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
          });

          throw new Error(errorMessage);
        }
      },

      // Validate token
      validateToken: async (): Promise<boolean> => {
        try {
          const token = await getToken();

          if (!token) {
            return false;
          }

          // Check if token is expired
          if (isTokenExpired(token)) {
            await get().logout(false);
            return false;
          }

          // Optionally verify with server
          try {
            await axiosInstance.get('/auth/verify');
            return true;
          } catch (error) {
            await get().logout(false);
            return false;
          }
        } catch (error) {
          console.error('Token validation error:', error);
          return false;
        }
      },

      // Refresh token
      refreshToken: async () => {
        try {
          const response = await axiosInstance.post('/auth/refresh-token');
          const newToken = response.data.token?.token || response.data.token;

          if (newToken) {
            await setToken(newToken);
            set({ token: newToken });
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          await get().logout(false);
        }
      },

      // Utility methods
      getUser: () => get().user,

      getToken: () => get().token,

      getUserFullName: () => {
        const user = get().user;
        if (!user) return '';

        const { firstName, middleName, lastName } = user;
        return `${firstName || ''} ${middleName || ''} ${
          lastName || ''
        }`.trim();
      },

      getBirthday: () => {
        const user = get().user;
        if (!user || !user.birthyear || !user.birthmonth || !user.birthdate) {
          return '';
        }

        try {
          const date = new Date(
            user.birthyear,
            user.birthmonth - 1,
            user.birthdate
          );
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } catch (error) {
          console.error('Error formatting birthday:', error);
          return '';
        }
      },

      hasRole: (role: string) => {
        const user = get().user;
        return user?.role?.toLowerCase() === role.toLowerCase();
      },

      hasAnyRole: (roles: string[]) => {
        const user = get().user;
        return roles.some(
          (role) => user?.role?.toLowerCase() === role.toLowerCase()
        );
      },

      isAdmin: () => get().hasRole('admin'),

      isTeacher: () => get().hasRole('teacher'),

      isStudent: () => get().hasRole('student'),

      setUser: (user: User) => set({ user }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'eduops-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // This runs after the store is rehydrated from storage
        if (state?.token && state?.isAuthenticated) {
          // Check if the persisted token is expired
          if (isTokenExpired(state.token)) {
            console.log('Persisted token is expired, clearing auth data');
            // Clear expired token and user data
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            // Also clear from AsyncStorage
            clearAuthData().catch(console.error);
          } else {
            console.log('Persisted token is valid, user remains authenticated');
            // Token is valid, keep user authenticated
            // The AuthWrapper will handle server validation
          }
        } else {
          console.log('No persisted auth data found');
        }
      },
    }
  )
);
