# Posts Feature - Setup & Implementation Guide

## Overview

The posts feature has been implemented for the EduOps Mobile App. This document provides setup instructions and details about the implementation.

## Required Packages

Before running the app, you need to install the following packages:

### 1. React Native Image Viewing

For full-screen image viewing with pinch-to-zoom and swipe gestures.

```bash
npm install react-native-image-viewing
```

### 2. Expo File System

For downloading files to the device.

```bash
npx expo install expo-file-system
```

### 3. Expo Sharing

For native share sheet functionality (save files to device).

```bash
npx expo install expo-sharing
```

## Installation Steps

1. **Navigate to the mobile app directory:**

   ```bash
   cd EduOpsMobile
   ```

2. **Install the required packages:**

   ```bash
   npm install react-native-image-viewing
   npx expo install expo-file-system expo-sharing
   ```

3. **Clear cache and restart (recommended):**

   ```bash
   npx expo start --clear
   ```

4. **Run the app:**
   - For Android: Press `a`
   - For iOS: Press `i`
   - For web: Press `w`

## Implementation Details

### Files Created

#### 1. **Types**

- `src/types/post.ts` - TypeScript interfaces for posts, files, and store state

#### 2. **API Utilities**

- `src/utils/postsApi.ts` - API functions for fetching posts
- `src/utils/fileDownload.ts` - File download utilities with confirmation dialogs

#### 3. **Store**

- `src/stores/postsStore.ts` - Zustand store for posts state management (read-only)

### Files Modified

#### 1. **HomeScreen**

- `src/screens/HomeScreen/HomeScreen.tsx` - Complete rewrite with:

  - Real data fetching from backend
  - Pull-to-refresh functionality
  - Loading state with spinner
  - Error state with retry button
  - Empty state message
  - Post tags (Global, Student, Teacher)
  - Image attachments with viewer
  - Document attachments with download

- `src/screens/HomeScreen/Homescreen.styles.ts` - Added styles for:
  - Post tags
  - Image attachments
  - Document attachments
  - Loading/error/empty states

## Features Implemented

### 1. **Posts Fetching**

- Fetches posts from `/api/v1/posts` endpoint
- Filters posts based on user role (student)
- Respects post tags (global, student, teacher)
- Hides archived posts from students

### 2. **Post Display**

- Author information with avatar
- Post title and content
- Formatted timestamps (e.g., "2 hours ago")
- Color-coded post tags
- File attachments

### 3. **Image Viewing**

- Tap on image to view full-screen
- Pinch to zoom
- Swipe between multiple images
- Close with X button or back gesture

### 4. **File Downloads**

- Confirmation dialog before download
- Shows file name and size
- Downloads using expo-file-system
- Opens native share sheet to save
- Supports all file types (PDF, DOC, XLSX, etc.)

### 5. **UI/UX Features**

- **Pull-to-refresh**: Swipe down to reload posts
- **Loading state**: Spinner with "Loading posts..." message
- **Error state**: Error icon with message and "Retry" button
- **Empty state**: "No posts as of the moment" when no posts available
- **Responsive**: Works on all screen sizes

### 6. **Post Tags**

Color-coded badges showing post visibility:

- **Blue**: Global (visible to everyone)
- **Green**: Student (visible to students only)
- **Orange**: Teacher (visible to teachers only)

## API Integration

### Endpoint

```
GET /api/v1/posts
```

### Response Format

```json
{
  "data": [
    {
      "id": 1,
      "title": "Post Title",
      "content": "Post content...",
      "tag": "global",
      "status": "published",
      "isArchived": false,
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "role": "admin",
        "profilePicLink": "https://example.com/avatar.jpg"
      },
      "files": [
        {
          "id": 1,
          "fileName": "document.pdf",
          "fileType": "application/pdf",
          "fileSize": 1024000,
          "url": "https://example.com/files/document.pdf",
          "postId": 1,
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

## Post Visibility Rules

Students can see:

- ✅ Posts with tag "global"
- ✅ Posts with tag "student"
- ❌ Posts with tag "teacher"
- ❌ Archived posts

Teachers can see:

- ✅ Posts with tag "global"
- ✅ Posts with tag "teacher"
- ❌ Posts with tag "student"
- ❌ Archived posts

Admins can see:

- ✅ All posts (including archived)

## File Download Flow

1. User taps on document attachment
2. Confirmation dialog appears:

   ```
   Download File
   Do you want to download this file?

   document.pdf
   Size: 1.5 MB

   [Cancel] [Download]
   ```

3. If confirmed:
   - File downloads to app's document directory
   - Native share sheet opens
   - User can save to Files, Drive, etc.

## Image Viewing Flow

1. User taps on image attachment
2. Full-screen image viewer opens
3. User can:
   - Pinch to zoom
   - Swipe to view next/previous images
   - Tap X button to close
   - Use back gesture to close

## Error Handling

### Network Errors

- Shows error message with retry button
- Clears error when user taps retry
- Maintains previous posts in store

### Download Errors

- Shows alert with error message
- User can try again

### Empty States

- "No posts as of the moment" when no posts available
- Encourages pull-to-refresh

## Performance Considerations

### Optimizations

- Uses separate loading states for initial load vs refresh
- Caches images automatically (React Native default)
- Downloads files only when requested
- Efficient re-renders with React.memo (can be added if needed)

### Future Improvements

- Pagination for large post lists
- Image caching with react-native-fast-image
- Offline support with AsyncStorage
- Post search and filters

## Troubleshooting

### Issue: Images not loading

**Solution**: Check API URL in `.env` file and ensure images are publicly accessible.

### Issue: File downloads not working

**Solution**: Ensure expo-file-system and expo-sharing are installed. Check file URL is accessible.

### Issue: Posts not fetching

**Solution**:

1. Check network connection
2. Verify API endpoint is correct
3. Check authentication token is valid
4. Use retry button to reload

### Issue: "Module not found" errors

**Solution**:

1. Clear cache: `npx expo start --clear`
2. Reinstall packages: `npm install`
3. Restart Metro bundler

## Testing Checklist

### Functional Testing

- [ ] Posts load on app start
- [ ] Pull-to-refresh reloads posts
- [ ] Loading spinner shows during fetch
- [ ] Error state shows on network failure
- [ ] Retry button reloads posts
- [ ] Empty state shows when no posts
- [ ] Post tags display correctly
- [ ] Images open in full-screen viewer
- [ ] Image viewer supports pinch-to-zoom
- [ ] Swipe between multiple images works
- [ ] File download confirmation shows
- [ ] Files download and save successfully
- [ ] User role filtering works correctly

### UI/UX Testing

- [ ] Smooth scrolling performance
- [ ] Images load progressively
- [ ] Pull-to-refresh animation smooth
- [ ] Error messages are clear
- [ ] Colors match app theme
- [ ] Text is readable
- [ ] Touch targets are adequate
- [ ] Responsive on different screen sizes

## Code Structure

```
EduOpsMobile/
├── src/
│   ├── types/
│   │   └── post.ts              # Post type definitions
│   ├── utils/
│   │   ├── postsApi.ts          # Posts API functions
│   │   └── fileDownload.ts      # File download utilities
│   ├── stores/
│   │   └── postsStore.ts        # Posts Zustand store
│   └── screens/
│       └── HomeScreen/
│           ├── HomeScreen.tsx   # Main screen component
│           └── Homescreen.styles.ts  # Styles
└── POSTS_FEATURE_SETUP.md       # This file
```

## Notes

- This is a **read-only** implementation for students
- Students cannot create, edit, or delete posts
- Posts are fetched from the backend on each app start
- Pull-to-refresh manually reloads posts
- File downloads use device storage (downloads folder)
- Images are cached automatically by React Native

## Related Documentation

- [Enrollment Feature](./ENROLLMENT_TRACKING_FEATURE.md)
- [Mobile Security](./MOBILE_SECURITY.md)
- [API Documentation](../EduOps/api/README.md)
