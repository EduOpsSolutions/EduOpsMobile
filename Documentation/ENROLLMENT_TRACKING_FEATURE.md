# Enrollment Tracking Feature - Mobile App

## Overview

The enrollment tracking feature allows users to check their enrollment status from the login screen by entering either their Enrollment ID or Email address.

## Implementation Details

### Components Created

#### 1. `TrackEnrollmentModal.tsx`
**Location:** `/src/components/modals/TrackEnrollmentModal.tsx`

**Features:**
- Bottom sheet modal (mobile-optimized)
- Two input methods: Enrollment ID OR Email
- Validation for at least one field
- Email format validation
- Loading states with spinner
- "Forgot Enrollment ID?" link
- Info section explaining usage
- Red theme matching app design

**Props:**
```typescript
interface TrackEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Flow:**
1. User opens modal from login screen
2. Enters Enrollment ID or Email
3. Clicks "Track Now"
4. API call via `useEnrollmentStore().trackEnrollment()`
5. On success: Navigate to `/enrollment/status`
6. On error: Show alert with error message

#### 2. `ForgotEnrollmentIdModal.tsx`
**Location:** `/src/components/modals/ForgotEnrollmentIdModal.tsx`

**Features:**
- Simple modal for ID recovery
- Email input field
- Sends enrollment ID to user's email
- Red theme matching app design

**Props:**
```typescript
interface ForgotEnrollmentIdModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Flow:**
1. User clicks "Forgot enrollment ID?" in TrackEnrollmentModal
2. Enters email address
3. Clicks "Send Email"
4. Success message shown
5. Email sent with enrollment ID

**Note:** The actual email sending API is not yet implemented. Currently shows success message as placeholder.

### Modified Files

#### 1. `LoginScreen.tsx`
**Changes:**
- Added state: `trackModalOpen`
- Added import: `TrackEnrollmentModal`
- Added "Track Enrollment" button section
- Added modal component at bottom of screen

**UI Structure:**
```
Login Form
  ↓
[Login Button]
  ↓
Don't have an account?
[Sign Up / Enroll]
  ↓
Already enrolled?
[Track Enrollment] ← NEW
  ↓
Terms & Privacy
```

#### 2. `LoginScreen.styles.ts`
**New Styles:**
- `trackButtonWrapper` - Container for track section
- `trackButton` - Yellow button (distinguishes from red login)
- `trackButtonText` - Bold dark red text

**Design:**
- Yellow button (`#ffcf00`) for visual distinction
- Dark red text (`#700A06`) for contrast
- Same elevation/shadow as login button

### Color Scheme

The feature uses the app's existing color palette:
- **Primary Red**: `#de0000` (headers, primary actions)
- **Dark Red**: `#700A06` (backgrounds, text)
- **Yellow**: `#ffcf00` (Track button, links)
- **White/Cream**: `#fffdf2` (text, backgrounds)

### API Integration

Both modals use the existing enrollment store methods:

```typescript
// Track enrollment
const { trackEnrollment } = useEnrollmentStore();
await trackEnrollment(enrollmentId, email);

// Store already handles:
// - API call to /enrollment/track
// - Setting enrollment data in store
// - Error handling with Alert
// - Navigation (handled in modal)
```

## User Flow

### Happy Path
1. **User on Login Screen**
   - Sees "Already enrolled?" section
   - Taps "Track Enrollment" button

2. **Track Modal Opens**
   - Bottom sheet animation
   - Two input fields visible
   - Info message explaining usage

3. **User Enters Details**
   - Option A: Enters Enrollment ID
   - Option B: Enters Email
   - Optional: Taps "Forgot enrollment ID?"

4. **Submit**
   - Taps "Track Now"
   - Loading spinner shows
   - "Searching..." text appears

5. **Success**
   - Modal closes automatically
   - Navigates to `/enrollment/status`
   - Enrollment data loaded and displayed

### Error Paths

#### Invalid Input
- No input: Alert "Please provide either Enrollment ID or Email address."
- Invalid email: Alert "Please enter a valid email address."

#### Enrollment Not Found
- Alert from store: "Enrollment Not Found" with message
- User can retry or tap "Forgot enrollment ID?"

#### Network Error
- Alert from store with error message
- User can retry

## Testing Checklist

### Functional Testing
- [ ] Track modal opens when button tapped
- [ ] Track modal closes on X button
- [ ] Track modal closes on overlay tap
- [ ] Validation works (no input)
- [ ] Validation works (invalid email)
- [ ] Successful tracking navigates to status screen
- [ ] Error shows appropriate alert
- [ ] Forgot ID modal opens from track modal
- [ ] Forgot ID modal closes properly
- [ ] Forgot ID sends email (when implemented)

### UI/UX Testing
- [ ] Bottom sheet animation smooth
- [ ] Keyboard doesn't cover inputs
- [ ] Loading states show properly
- [ ] Colors match app theme
- [ ] Text readable on all backgrounds
- [ ] Touch targets large enough (min 44px)
- [ ] Modal scrollable if content long
- [ ] Info section helpful and clear

### Device Testing
- [ ] Works on small screens (iPhone SE)
- [ ] Works on large screens (iPad)
- [ ] Works on Android
- [ ] Works on iOS
- [ ] Keyboard behavior correct on both platforms

## Future Enhancements

### Short Term
1. **Implement Forgot ID Email API**
   - Add backend endpoint
   - Update ForgotEnrollmentIdModal to call real API
   - Add rate limiting

2. **Loading States**
   - Add skeleton loaders
   - Better error messages
   - Retry functionality

### Long Term
1. **Biometric Authentication**
   - Save enrollment ID securely
   - Quick track with fingerprint/face

2. **Push Notifications**
   - Notify on status changes
   - Deep link to enrollment status

3. **QR Code Tracking**
   - Generate QR code for enrollment
   - Scan to track

## Code Examples

### Opening Track Modal
```typescript
const [trackModalOpen, setTrackModalOpen] = useState(false);

<TouchableOpacity onPress={() => setTrackModalOpen(true)}>
  <Text>Track Enrollment</Text>
</TouchableOpacity>

<TrackEnrollmentModal
  isOpen={trackModalOpen}
  onClose={() => setTrackModalOpen(false)}
/>
```

### Using Enrollment Store
```typescript
const { trackEnrollment } = useEnrollmentStore();

try {
  await trackEnrollment(enrollmentId, email);
  // Success - data stored in zustand
  router.push("/enrollment/status");
} catch (error) {
  // Error handled by store with Alert
  console.error(error);
}
```

## Related Files

### Components
- `/src/components/modals/TrackEnrollmentModal.tsx`
- `/src/components/modals/ForgotEnrollmentIdModal.tsx`
- `/src/components/modals/index.ts`

### Screens
- `/src/screens/LoginScreen/LoginScreen.tsx`
- `/src/screens/LoginScreen/LoginScreen.styles.ts`
- `/src/screens/Enrollment/EnrollmentStatusScreen.tsx`

### Stores
- `/src/stores/enrollmentStore.ts`

### Utils
- `/src/utils/api.ts` (enrollmentApi.trackEnrollment)

## Dependencies

All dependencies already installed:
- `react-native` - Core components
- `react-native-vector-icons` - Icons
- `expo-router` - Navigation
- `zustand` - State management

No new packages needed!

## Notes

- Mobile-first design with bottom sheet modal
- Matches web app functionality
- Uses existing store and API methods
- Yellow track button for visual distinction
- Smooth animations and transitions
- Accessible and user-friendly
