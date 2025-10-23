# Authentication Implementation Guide

This document describes the authentication, API, and state management implementation in the EduOpsMobile app, mirroring the EduOps webapp architecture.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Configuration](#setup--configuration)
4. [File Structure](#file-structure)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The mobile app now includes:

- **Axios HTTP Client** with request/response interceptors
- **JWT Token Management** with automatic expiration handling
- **Zustand State Management** with persistence
- **AsyncStorage** for secure token storage
- **Protected Routes** with automatic redirection
- **Comprehensive API Services** for all backend endpoints
- **Role-Based Access Control** (Student, Teacher, Admin)

---

## Architecture

### Authentication Flow

```
1. User enters credentials in LoginScreen
2. App calls authStore.login(email, password)
3. Axios sends POST request to /auth/login
4. Server validates credentials and returns JWT token
5. Token is decoded and stored in AsyncStorage
6. User data is extracted from token and stored in Zustand
7. User is redirected to appropriate screen based on role
8. All subsequent API calls include Bearer token in headers
9. Token expiration is checked before each request
10. On expiration, user is automatically logged out
```

### Request/Response Flow

```
Component → Zustand Store → Axios Instance → API Server
                ↓                   ↓
          AsyncStorage      Interceptors (Token, Error Handling)
```

---

## Setup & Configuration

### 1. Environment Variables

Create or update `.env` file in project root:

```env
EXPO_PUBLIC_API_URL=http://localhost:5555/api/v1
EXPO_PUBLIC_API_BASE=http://localhost:5555
JWT_SECRET=3Du0p$2024
```

**Important:** Replace with your actual API URL and JWT secret in production.

### 2. Dependencies

All required dependencies have been installed:

```json
{
  "axios": "^1.x",
  "zustand": "^5.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "jose": "^6.x"
}
```

### 3. Start the Backend Server

Ensure the EduOps backend API is running:

```bash
cd ../EduOps/api
npm start
```

The API should be accessible at `http://localhost:5555/api/v1`

---

## File Structure

```
src/
├── stores/
│   └── authStore.ts              # Zustand auth state management
│
├── utils/
│   ├── axios.ts                  # Axios instance with interceptors
│   ├── jwt.ts                    # JWT utilities & AsyncStorage helpers
│   └── api.ts                    # API service functions
│
├── hooks/
│   ├── useAuth.ts                # Custom auth hook
│   └── index.ts                  # Hook exports
│
├── components/
│   └── ProtectedRoute.tsx        # Route protection component
│
├── screens/
│   └── LoginScreen/
│       └── LoginScreen.tsx       # Updated with auth logic
│
└── .env                          # Environment configuration
```

---

## Usage Examples

### 1. Login

```tsx
import { useAuth } from "../hooks";

function LoginScreen() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Success - navigation handled automatically
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
      {isLoading ? <ActivityIndicator /> : <Text>Login</Text>}
    </TouchableOpacity>
  );
}
```

### 2. Logout

```tsx
import { useAuth } from "../hooks";

function ProfileScreen() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout(true); // true = redirect to login
  };

  return (
    <View>
      <Text>Welcome, {user?.firstName}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
```

### 3. Get User Data

```tsx
import { useAuth } from "../hooks";

function HomeScreen() {
  const { user, getUserFullName, isStudent, isAdmin } = useAuth();

  return (
    <View>
      <Text>Hello, {getUserFullName()}</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Role: {user?.role}</Text>

      {isStudent() && <StudentMenu />}
      {isAdmin() && <AdminMenu />}
    </View>
  );
}
```

### 4. Protected Routes

```tsx
// In app/_layout.tsx
import { ProtectedRoute } from "../components/ProtectedRoute";

export default function Layout() {
  return (
    <ProtectedRoute>
      <Stack>
        <Stack.Screen name="home" />
        <Stack.Screen name="profile" />
      </Stack>
    </ProtectedRoute>
  );
}
```

### 5. API Calls

```tsx
import api from "../utils/api";

// Get posts
const posts = await api.posts.getPosts({ page: 1, limit: 10 });

// Create enrollment
const enrollment = await api.enrollment.createEnrollmentRequest({
  program: "Computer Science",
  semester: "Fall 2024",
});

// Get grades
const grades = await api.grades.getGrades();

// Upload file
const formData = new FormData();
formData.append("file", file);
const result = await api.file.uploadFile(formData, "documents");
```

### 6. Change Password

```tsx
import { useAuth } from "../hooks";

function ChangePasswordScreen() {
  const { changePassword } = useAuth();

  const handleChangePassword = async () => {
    try {
      await changePassword(currentPassword, newPassword);
      // Success alert shown automatically
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return <Button title="Change Password" onPress={handleChangePassword} />;
}
```

### 7. Forgot Password

```tsx
import { useAuth } from "../hooks";

function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth();

  const handleForgotPassword = async () => {
    try {
      await forgotPassword(email);
      // Success - reset link sent to email
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return <Button title="Send Reset Link" onPress={handleForgotPassword} />;
}
```

---

## API Reference

### Auth Store Methods

#### State

- `user: User | null` - Current user object
- `token: string | null` - JWT token
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message

#### Actions

- `login(email, password)` - Login user
- `logout(redirectToLogin?)` - Logout user
- `register(userData)` - Register new user
- `updateProfile(userData)` - Update user profile
- `changePassword(currentPassword, newPassword)` - Change password
- `forgotPassword(email)` - Send password reset email
- `resetPassword(token, newPassword)` - Reset password with token
- `validateToken()` - Validate current token
- `refreshToken()` - Refresh JWT token

#### Utility Methods

- `getUser()` - Get current user
- `getToken()` - Get current token
- `getUserFullName()` - Get user's full name
- `hasRole(role)` - Check if user has specific role
- `hasAnyRole(roles)` - Check if user has any of the roles
- `isAdmin()` - Check if user is admin
- `isTeacher()` - Check if user is teacher
- `isStudent()` - Check if user is student
- `setError(error)` - Set error message
- `clearError()` - Clear error message

### API Services

All API services are available in `src/utils/api.ts`:

#### Enrollment API

- `trackEnrollment(enrollmentId, email)`
- `createEnrollmentRequest(enrollmentData)`
- `getEnrollmentStatus(enrollmentId)`
- `getEnrollmentHistory()`

#### Posts API

- `getPosts(params)`
- `getPost(postId)`
- `createPost(formData)`
- `updatePost(postId, data)`
- `deletePost(postId)`
- `getMyPosts(params)`

#### Profile API

- `getProfile()`
- `updateProfile(userData)`
- `uploadProfilePicture(file)`

#### Documents API

- `getDocuments(params)`
- `requestDocument(documentType, reason)`
- `downloadDocument(documentId)`

#### Grades API

- `getGrades(params)`
- `getGradesBySemester(semester, schoolYear)`

#### Assessment API

- `getAssessment()`
- `getPaymentHistory(params)`
- `makePayment(paymentData)`

#### Schedule API

- `getSchedule(params)`
- `getScheduleBySemester(semester, schoolYear)`

#### File API

- `uploadFile(file, directory)`
- `guestUploadFile(file, directory)`

---

## Security Features

### 1. Token Expiration Handling

- Tokens are checked for expiration before **every** API request
- Expired tokens trigger automatic logout with alert
- User is redirected to login screen

### 2. Secure Storage

- Tokens stored in AsyncStorage (React Native's secure storage)
- User data stored separately
- All auth data cleared on logout

### 3. Request Interceptors

- Automatically adds Bearer token to all requests
- Validates token before sending request
- Handles 401/403 errors globally

### 4. Protected Routes

- Routes automatically check authentication status
- Unauthenticated users redirected to login
- Authenticated users redirected from login to home

### 5. Role-Based Access

- User role stored in JWT token
- Helper methods for role checking
- Easy to implement role-based UI

---

## Token Format

JWT tokens contain the following structure:

```json
{
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "M",
    "role": "student",
    "status": "active",
    "profilePicLink": "https://...",
    ...
  },
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## Troubleshooting

### Issue: "Network Error" or "No response from server"

**Solution:**

1. Ensure backend API is running
2. Check API URL in `.env` file
3. For Android emulator, use `http://10.0.2.2:5555/api/v1` instead of `localhost`
4. For iOS simulator, use `http://localhost:5555/api/v1`
5. For physical device, use your computer's IP address

### Issue: "Token expired" immediately after login

**Solution:**

1. Check system time on device/emulator
2. Ensure backend JWT_EXPIRATION_TIME is reasonable (e.g., "7d")
3. Verify JWT_SECRET matches between frontend and backend

### Issue: Login succeeds but navigation doesn't work

**Solution:**

1. Check that routes exist in `app/` directory
2. Ensure Expo Router is properly configured
3. Verify user role is being returned from backend

### Issue: AsyncStorage not working

**Solution:**

1. Clear app data: `npx react-native start --reset-cache`
2. Reinstall app on device/emulator
3. Check AsyncStorage permissions

### Issue: CORS errors

**Solution:**

1. Ensure backend has CORS enabled
2. Check allowed origins in backend CORS config
3. Use proper API URL format (include protocol)

---

## Testing Credentials

Use these test credentials from the webapp:

- **Student Account:**

  - Email: `student@example.com`
  - Password: (check with backend admin)

- **Admin Account:**
  - Email: `admin@example.com`
  - Password: (check with backend admin)

---

## Next Steps

1. **Implement Forgot Password Screen** - Create UI for password reset
2. **Add Registration Screen** - Allow new user registration
3. **Create Profile Screen** - Display and edit user profile
4. **Add Logout Button** - Implement logout in navigation/menu
5. **Test with Real API** - Connect to actual backend server
6. **Handle Network Errors** - Add offline detection and retry logic
7. **Add Token Refresh** - Implement automatic token refresh before expiration
8. **Implement Role-Based Screens** - Create separate screens for different roles

---

## Additional Resources

- [Axios Documentation](https://axios-http.com/docs/intro)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [JWT Documentation](https://jwt.io/introduction)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

---

## Support

For issues or questions:

1. Check this documentation
2. Review the webapp implementation in `../EduOps/client/src`
3. Check backend API documentation
4. Contact the development team

---

**Last Updated:** 2025-10-23
