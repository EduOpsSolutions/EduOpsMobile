// Simple state to track if user is logging out
// This avoids circular dependency between authStore and axios

let isLoggingOut = false;

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

export const getLoggingOut = () => isLoggingOut;
