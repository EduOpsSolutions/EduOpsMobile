import { jwtVerify, decodeJwt } from "jose";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Decode JWT token
export const decodeToken = (token: string) => {
  try {
    return decodeJwt(token);
  } catch (error) {
    return null;
  }
};

// Verify JWT token
export const verifyJWT = async (
  token: string
): Promise<{ payload: any; expired: boolean }> => {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "noJWTsecret"
    );
    const { payload } = await jwtVerify(token, secret);
    return { payload, expired: false };
  } catch (error: any) {
    if (error?.code === "ERR_JWT_EXPIRED") {
      return { payload: null, expired: true };
    }
    return { payload: null, expired: false };
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Token storage operations
export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (error) {
    console.error("Error storing token:", error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.error("Error removing token:", error);
    throw error;
  }
};

// User data storage operations
export const setUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error storing user:", error);
    throw error;
  }
};

export const getUser = async (): Promise<any | null> => {
  try {
    const userString = await AsyncStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Error retrieving user:", error);
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("user");
  } catch (error) {
    console.error("Error removing user:", error);
    throw error;
  }
};

// Clear all auth data
export const clearAuthData = async (): Promise<void> => {
  try {
    await Promise.all([
      removeToken(),
      removeUser(),
      AsyncStorage.removeItem("profileImageCache"),
    ]);
  } catch (error) {
    console.error("Error clearing auth data:", error);
    throw error;
  }
};
