import { useAuthStore } from '../stores/authStore';

/**
 * Custom hook that provides easy access to authentication state and actions
 * This is a convenience wrapper around the auth store
 */
export const useAuth = () => {
  const store = useAuthStore();

  return {
    // State
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    login: store.login,
    logout: store.logout,
    register: store.register,
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,
    forgotPassword: store.forgotPassword,
    resetPassword: store.resetPassword,
    validateToken: store.validateToken,
    refreshToken: store.refreshToken,

    // Utility methods
    getUser: store.getUser,
    getToken: store.getToken,
    getUserFullName: store.getUserFullName,
    hasRole: store.hasRole,
    hasAnyRole: store.hasAnyRole,
    isAdmin: store.isAdmin,
    isTeacher: store.isTeacher,
    isStudent: store.isStudent,
    setError: store.setError,
    clearError: store.clearError,
  };
};
