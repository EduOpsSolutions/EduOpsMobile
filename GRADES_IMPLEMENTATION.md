# Grades Implementation for Mobile App

## Overview
This document describes the implementation of the grades feature in the EduOps Mobile App, mirroring the functionality from the EduOps web application.

## Implementation Date
October 31, 2025

## Features Implemented

### 1. API Integration (`src/utils/api.ts`)
- Added `getStudentGrades(studentId)` method to `gradesApi`
- Fetches student grades from `/grades/student/${studentId}` endpoint
- Integrates with existing axios instance and authentication

### 2. File Preview Modal (`src/components/modals/FilePreviewModal.tsx`)
- **Purpose**: Display grade certificates/files in a modal
- **Features**:
  - Full-screen modal with header and close button
  - WebView integration for document preview
  - Loading state with spinner
  - Error handling for missing files
  - Platform-specific PDF rendering:
    - Android: Uses Google Docs Viewer for better PDF support
    - iOS: Direct file URL rendering

### 3. Grades Screen (`src/screens/GradesScreen/GradesScreen.tsx`)
- **Data Fetching**:
  - Fetches all courses and student grades in parallel
  - Maps courses with grade status (PASS, FAIL, NO GRADE)
  - Sorts courses alphabetically
  - Uses authenticated student ID from auth store

- **UI Features**:
  - Loading state with spinner and message
  - Error state with retry button
  - Empty state for no grades
  - Displays student name from auth store
  - Table with columns: Course, Status, Date, Details

- **Interactions**:
  - Tap on grade row to view details
  - Shows alert for courses not taken
  - Opens certificate preview modal for completed courses
  - Displays latest certificate file if multiple exist

### 4. Styling (`src/screens/GradesScreen/GradesScreen.styles.ts`)
- Added styles for:
  - Date column in grade rows
  - Loading container and text
  - Error container, text, and retry button
  - Empty state container and text
- Updated flex layout for proper column sizing

## Data Flow

```
1. User opens Grades screen
2. Screen fetches user ID from auth store
3. Parallel API calls:
   - GET /courses (all courses)
   - GET /grades/student/${studentId} (student grades)
4. Data mapping:
   - Courses sorted alphabetically
   - Grades mapped by courseId
   - Status determined (PASS/FAIL/NO GRADE)
5. Display in table format
6. User taps on grade:
   - If NO GRADE: Show alert
   - If has grade: Check for files
     - If files exist: Show latest file in modal
     - If no files: Show alert
```

## API Endpoints Used

### GET /courses
- **Purpose**: Fetch all available courses
- **Authentication**: Required (Bearer token)
- **Response**: Array of course objects with id and name

### GET /grades/student/:studentId
- **Purpose**: Fetch grades for specific student
- **Authentication**: Required (Bearer token)
- **Response**: Array of grade objects with:
  - id
  - courseId
  - grade (Pass/Fail)
  - updatedAt
  - files array (url, uploadedAt)

## File Structure

```
EduOpsMobile/
├── src/
│   ├── components/
│   │   └── modals/
│   │       ├── FilePreviewModal.tsx (NEW)
│   │       └── index.ts (UPDATED)
│   ├── screens/
│   │   └── GradesScreen/
│   │       ├── GradesScreen.tsx (UPDATED)
│   │       └── GradesScreen.styles.ts (UPDATED)
│   └── utils/
│       └── api.ts (UPDATED)
```

## Dependencies

All required dependencies are already installed in `package.json`:
- `react-native-webview`: ^13.13.5 (for document preview)
- `@react-native-async-storage/async-storage`: ^2.1.2 (for auth storage)
- `axios`: ^1.12.2 (for API requests)
- `zustand`: ^5.0.8 (for state management)

## Differences from Web App

### Similarities
1. Same API endpoints and data structure
2. Same grade status mapping (PASS/FAIL/NO GRADE)
3. Same alert messages for courses not taken
4. Same logic for displaying latest certificate

### Differences
1. **UI Framework**: React Native vs React (web)
2. **File Preview**: 
   - Web: Uses CommonModal with iframe
   - Mobile: Uses FilePreviewModal with WebView
3. **Date Formatting**: Simplified for mobile (less space)
4. **Navigation**: Mobile uses native navigation instead of web routing

## Testing Checklist

- [ ] Grades fetch on screen load
- [ ] Loading state displays correctly
- [ ] Error state shows with retry button
- [ ] Empty state shows when no grades
- [ ] Student name displays correctly
- [ ] Courses sorted alphabetically
- [ ] Status badges show correct colors
- [ ] Date formatting works
- [ ] Alert shows for NO GRADE courses
- [ ] Certificate preview opens for graded courses
- [ ] Alert shows when no file available
- [ ] Modal closes properly
- [ ] WebView loads documents correctly

## Future Enhancements

1. **Pull to Refresh**: Add refresh control to reload grades
2. **Filter by Status**: Add filter buttons (All, Pass, Fail, No Grade)
3. **Search**: Add search bar to filter courses by name
4. **Download**: Add option to download certificate files
5. **Share**: Add share button for certificates
6. **Offline Support**: Cache grades for offline viewing
7. **Notifications**: Notify when new grades are posted

## Known Limitations

1. **PDF Rendering**: 
   - Android uses Google Docs Viewer (requires internet)
   - iOS direct rendering may not work for all PDF formats
2. **File Types**: Only tested with PDF files
3. **Large Files**: May be slow to load large documents

## Troubleshooting

### Issue: Grades not loading
**Cause**: User not authenticated or API error
**Solution**: Check auth token, verify API endpoint, check network connection

### Issue: Certificate preview not working
**Cause**: File URL invalid or WebView issue
**Solution**: Verify file URL format, check WebView permissions

### Issue: Wrong student data showing
**Cause**: Auth store not properly hydrated
**Solution**: Check auth store initialization, verify token decode

## Related Documentation

- [Authentication Implementation](./AUTH_IMPLEMENTATION.md)
- [Mobile Security](./Documentation/MOBILE_SECURITY.md)
- Web App Grades: `EduOps/client/src/pages/student/Grades.js`
- API Controller: `EduOps/api/controller/grades_controller.js`

