# EduOps Mobile App - Security & Origin Validation

## Overview

The EduOps Mobile App is configured to work with the backend's `webClientValidator` middleware, which validates that requests are coming from authorized clients (web browsers and mobile apps).

## How It Works

### 1. Backend Middleware (`webClientValidator.js`)

The backend uses the `validateWebClientOrigin` middleware to:
- Verify requests are from authorized clients
- Prevent abuse of guest endpoints (like file uploads and enrollment)
- Support both web browsers and React Native/Expo mobile apps

### 2. Allowed Origins for Mobile App

The middleware allows the following origins for mobile apps:

```javascript
const allowedOrigins = [
  // Mobile app origins
  "null",                    // React Native default (used by mobile apps)
  "exp://localhost:8081",    // Expo development
  "exp://localhost:19000",   // Expo development alternative
  "exp://127.0.0.1:8081",    // Expo localhost
  "exp://127.0.0.1:19000",   // Expo localhost alternative
  "myapp://",                // Legacy mobile app scheme
  "eduopsmobile://",         // Current mobile app scheme (see app.json)
];
```

### 3. Mobile App Configuration

#### app.json
```json
{
  "expo": {
    "scheme": "eduopsmobile",
    ...
  }
}
```

The `scheme` defines the URL scheme for the mobile app. This is used for deep linking and origin validation.

#### axios.ts

The axios instance is configured to work seamlessly with the middleware:

```typescript
const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.7:5555/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Important:**
- React Native automatically sends `Origin: null` (which is explicitly allowed)
- The middleware skips User-Agent validation for mobile apps (when origin is "null")
- No additional headers or configuration needed

## Guest Endpoints

Guest endpoints (unauthenticated) that use the validator:
- `/enrollment/enroll` - Create new enrollment
- `/enrollment/track` - Track enrollment status
- `/upload/guest` - Upload files without authentication
- `/courses` - Get available courses
- `/academic-periods` - Get enrollment periods

These endpoints are protected by the `validateWebClientOrigin` middleware to prevent abuse.

## File Uploads

### How Mobile File Uploads Work

1. **User selects image** using `expo-image-picker`
2. **File is uploaded** to Firebase Storage via `/upload/guest` endpoint
3. **Middleware validates** the request is from the mobile app:
   - Checks Origin header (expects "null" from React Native)
   - Validates User-Agent (skipped for mobile apps)
   - Allows request if origin is "null"

4. **File URL returned** and stored in enrollment data

### Upload Directories

- **Valid ID**: `proof-ids/`
- **2x2 ID Photo**: `enrollment/`
- **Payment Proof**: `payment-proofs/`

## Development Setup

### 1. Configure Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5555/api/v1
EXPO_PUBLIC_API_BASE=http://YOUR_LOCAL_IP:5555/
JWT_SECRET=YOUR_JWT_SECRET
```

**Important:**
- Use your computer's local network IP address (not localhost)
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Example: `http://192.168.1.100:5555/api/v1`

### 2. Backend Configuration

Ensure the backend `.env` includes:

```bash
# Allow mobile app scheme
MOBILE_APP_SCHEME=eduopsmobile://

# Enable development mode for debugging
NODE_ENV=development
```

### 3. Testing Mobile Origin Validation

In development mode, the middleware logs validation details:

```javascript
console.log("Origin validation:");
console.log("Request origin:", requestOrigin);      // "null" for React Native
console.log("Normalized origin:", normalizedOrigin); // "null"
console.log("Allowed origins:", allowedOrigins);    // [...includes "null"...]
```

Check your API server logs to verify mobile requests are being accepted.

## Production Deployment

### 1. Update Backend Environment

```bash
# Production API
PRODUCTION_CLIENT_URL=https://eduops.com

# Mobile app scheme (matches app.json)
MOBILE_APP_SCHEME=eduopsmobile://

# Enable strict validation
NODE_ENV=production
```

### 2. Update Mobile App Environment

```bash
EXPO_PUBLIC_API_URL=https://api.eduops.com/api/v1
EXPO_PUBLIC_API_BASE=https://api.eduops.com/
```

### 3. Build & Deploy

```bash
# Build for production
eas build --platform android
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## Troubleshooting

### Issue: "Access denied: Unauthorized origin"

**Cause:** The backend middleware is rejecting the mobile app's origin.

**Solutions:**
1. **Check backend logs** to see what origin the mobile app is sending
2. **Verify middleware configuration** includes "null" in allowedOrigins
3. **Check NODE_ENV** - in development mode, more debugging info is logged
4. **Restart backend server** after changing middleware configuration

### Issue: File uploads failing

**Possible Causes:**
1. **Origin validation failing** - See above
2. **CORS issues** - Ensure CORS is configured to allow "null" origin
3. **File size limits** - Check backend upload size limits
4. **Network issues** - Verify mobile device can reach the API

**Debug Steps:**
```typescript
// In fileApi.guestUploadFile, add logging:
console.log('Uploading file:', { directory, fileName: file.name });

try {
  const response = await axiosInstance.post(...);
  console.log('Upload successful:', response.data);
} catch (error) {
  console.error('Upload failed:', error.response?.data || error.message);
}
```

### Issue: Enrollment creation failing

**Possible Causes:**
1. **Missing required fields** - Check form validation
2. **File uploads not complete** - Ensure validIdPath and idPhotoPath are set
3. **Course ID vs Name mismatch** - Mobile sends course ID, converted to name before API call
4. **Origin validation** - Same as above

**Verify:**
```typescript
// Before submission in handleSubmit():
console.log('Enrollment Data:', {
  ...enrollmentData,
  hasValidId: !!enrollmentData.validIdPath,
  hasIdPhoto: !!enrollmentData.idPhotoPath,
  courseName: selectedCourse?.name,
});
```

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` file to version control
- ✅ Use `.env.example` for documentation
- ✅ Keep JWT_SECRET in sync with backend
- ✅ Use HTTPS in production

### 2. Origin Validation
- ✅ Backend validates all guest endpoint requests
- ✅ Mobile apps send "null" origin (standard React Native behavior)
- ✅ User-Agent validation skipped for mobile (prevents false positives)
- ✅ Production mode enforces stricter validation

### 3. File Uploads
- ✅ Files uploaded to Firebase Storage with authentication
- ✅ Only specific directories allowed
- ✅ Backend validates file types and sizes
- ✅ URLs stored in database, files in secure storage

### 4. API Communication
- ✅ All authenticated requests use JWT tokens
- ✅ Tokens validated on every request
- ✅ Expired tokens automatically cleared
- ✅ User redirected to login on authentication failure

## Additional Resources

- [Expo Deep Linking](https://docs.expo.dev/guides/deep-linking/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Axios Configuration](https://axios-http.com/docs/config_defaults)
- [Firebase Storage Security](https://firebase.google.com/docs/storage/security)
