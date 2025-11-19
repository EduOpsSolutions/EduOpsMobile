# Mobile Enrollment Enhancements Documentation

**Date:** 2025-11-19
**Task:** Align mobile app enrollment screen with web app enhanced enrollment flow

---

## Table of Contents
1. [Overview](#overview)
2. [Features Implemented](#features-implemented)
3. [Files Created/Modified](#files-createdmodified)
4. [Technical Implementation](#technical-implementation)
5. [API Endpoints](#api-endpoints)
6. [User Experience](#user-experience)
7. [Testing Guidelines](#testing-guidelines)

---

## Overview

The mobile app enrollment screen has been enhanced to match the web app's enrollment flow, providing feature parity between both platforms. The enhancements include:

- Multi-course selection with prerequisite/co-requisite validation
- Automatic field prefilling for logged-in users
- Visual lock icons on non-editable fields
- Course pricing display
- Bidirectional co-requisite auto-selection

---

## Features Implemented

### 1. MultiSelectField Component
**Location:** `EduOpsMobile/src/components/form/MultiSelectField.tsx`

A fully functional React Native multi-select component with:
- ✅ Search functionality with real-time filtering
- ✅ Chip-based display of selected courses
- ✅ Modal-based dropdown with checkboxes
- ✅ Bidirectional co-requisite auto-selection/removal
- ✅ Disabled state support for courses with unmet prerequisites
- ✅ Helper text display for prerequisites and co-requisites
- ✅ Individual course pricing display

**Key Features:**
```typescript
interface Option {
  value: string;        // Course ID
  label: string;        // Course name
  disabled?: boolean;   // If course cannot be selected
  price?: number;       // Course price
  helperText?: string;  // Prerequisite/co-requisite info
  corequisites?: string[]; // Co-requisite course IDs
}
```

---

### 2. Prerequisite & Co-requisite Validation

#### For Logged-in Users:
- Fetches student's grades from `student_grade` table
- Checks if prerequisites have been passed
- Only disables courses with **unmet prerequisites**
- Shows helper text: `"Prerequisites not met: [course names]"`
- Enables enrollment in courses with satisfied prerequisites

#### For Guest Users:
- Disables **ALL** courses with prerequisites or co-requisites
- Shows helper text: `"Requires: [course names] (Login to check eligibility)"`
- Prevents enrollment without prerequisite verification
- Encourages users to log in for eligibility checking

**Implementation:**
```typescript
// Logged-in users
if (eligibility && !eligibility.eligible) {
  opt.disabled = true;
  opt.helperText = `Prerequisites not met: ${missingNames}`;
}

// Guest users
if (requisites?.prerequisites && requisites.prerequisites.length > 0) {
  opt.disabled = true;
  opt.helperText = `Requires: ${prereqNames} (Login to check eligibility)`;
}
```

---

### 3. Co-requisite Auto-Selection

**Bidirectional Behavior:**
- Selecting Course A automatically selects Course B (if B is a co-requisite of A)
- Selecting Course B automatically selects Course A (if A is a co-requisite of B)
- Unchecking Course A automatically unchecks Course B
- Clicking X on Course A chip automatically removes Course B

**Helper Text:**
- Shows: `"Co-requisite: [course names] (will be auto-selected)"`

**Implementation Logic:**
```typescript
// When selecting a course
if (selectedOption?.corequisites) {
  selectedOption.corequisites.forEach((coreqId) => {
    if (!newValue.includes(coreqId) && !isDisabled(coreqId)) {
      newValue.push(coreqId);
    }
  });
}

// When removing a course
if (selectedOption?.corequisites) {
  selectedOption.corequisites.forEach((coreqId) => {
    newValue = newValue.filter((v) => v !== coreqId);
  });
}
```

---

### 4. Field Prefill & Lock for Logged-in Users

**Prefilled Fields:**
| Field | Source | Locked? |
|-------|--------|---------|
| First Name | `user.firstName` | ✅ Yes |
| Middle Name | `user.middleName` | ✅ Yes |
| Last Name | `user.lastName` | ✅ Yes |
| Birth Date | `user.birthyear/birthmonth/birthdate` | ✅ Yes |
| Preferred Email | `user.email` | ✅ Yes |
| Contact Number | `user.phoneNumber` | ❌ No (editable) |

**Visual Indicators:**
- 🔒 Lock icon displayed on disabled fields
- Gray background (`#f3f4f6`) on locked fields
- Blue info banner explaining prefilled fields

**Info Banner Text:**
> "Some fields have been pre-filled with your account information. Fields marked with a lock cannot be edited."

**Implementation:**
```typescript
const [lockedFields, setLockedFields] = useState({
  firstName: false,
  middleName: false,
  lastName: false,
  birthDate: false,
  preferredEmail: false,
});

// Prefill logic
if (isAuthenticated && user) {
  setFormData((prev) => ({
    ...prev,
    firstName: user.firstName || '',
    middleName: user.middleName || '',
    lastName: user.lastName || '',
    // ... etc
  }));

  setLockedFields({
    firstName: true,
    middleName: true,
    lastName: true,
    birthDate: true,
    preferredEmail: true,
  });
}
```

---

### 5. Course Pricing Display

Shows real-time calculation of total enrollment cost:
- Displays count of selected courses
- Shows formatted total price: `₱X,XXX`
- Updates dynamically as courses are selected/deselected
- Blue-themed info card design

**Example Display:**
```
┌─────────────────────────────────┐
│ 3 courses selected              │
│ Total Price: ₱15,000            │
└─────────────────────────────────┘
```

**Implementation:**
```typescript
const calculateTotalPrice = () => {
  return courses
    .filter((c) => selectedCourses.includes(c.id))
    .reduce((sum, c) => sum + parseFloat(c.price?.toString() || '0'), 0);
};
```

---

### 6. Enhanced Form Submission

**Multi-Course Handling:**
- Accepts array of course IDs from MultiSelectField
- Converts to comma-separated course names for API submission
- Validates at least one course is selected
- Matches web app's enrollment data structure

**Submission Logic:**
```typescript
const selectedCourseObjects = courses
  .filter((course) => selectedCourses.includes(course.id))
  .map((course) => ({
    id: course.id,
    name: course.name,
    price: course.price,
  }));

const enrollmentData = {
  ...formData,
  coursesToEnroll: selectedCourseObjects.map((c) => c.name).join(', '),
};

await createEnrollment(enrollmentData);
```

---

### 7. Enrollment Menu Access

**Location:** `EduOpsMobile/components/EnrollmentDropdown.tsx`

Added "New Enrollment" option to the Enrollment dropdown menu in bottom navigation.

**Menu Items:**
1. 🆕 **New Enrollment** → `/enrollment/form`
2. Study Load → `/studyload`
3. Schedule → `/schedule`

**Changes:**
- Increased dropdown height from `120px` to `180px` (3 items)
- Added navigation to enrollment form for logged-in users
- Active state highlighting for selected menu item

---

## Files Created/Modified

### Created Files:
1. **`EduOpsMobile/src/components/form/MultiSelectField.tsx`** (new)
   - Multi-select component with search, chips, and co-requisite handling
   - 500+ lines of TypeScript/React Native code

### Modified Files:
2. **`EduOpsMobile/src/screens/Enrollment/EnrollmentFormScreen.tsx`**
   - Complete rewrite with multi-course support
   - Added prerequisite/co-requisite validation
   - Field prefill and lock logic
   - Course pricing display
   - 1,282 lines total

3. **`EduOpsMobile/src/screens/Enrollment/EnrollmentFormScreen.styles.ts`**
   - Added lock icon styles
   - Info banner styles
   - Course pricing container styles
   - Disabled input styles
   - 455 lines total

4. **`EduOpsMobile/src/utils/api.ts`**
   - Added `getCourseRequisites()` API call
   - Added `checkStudentEligibility()` API call
   - Added `getAcademicPeriodCourses()` API call

5. **`EduOpsMobile/components/EnrollmentDropdown.tsx`**
   - Added "New Enrollment" menu option
   - Increased dropdown height for 3 items

---

## Technical Implementation

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens Enrollment Form                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  Check Authentication Status  │
         └───────┬──────────────┬────────┘
                 │              │
        ┌────────▼────┐    ┌───▼──────┐
        │  Logged In  │    │  Guest   │
        └────────┬────┘    └───┬──────┘
                 │              │
                 │              │
    ┌────────────▼──────────────▼────────────┐
    │   Check Enrollment Period Availability │
    └────────────┬────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ Fetch Courses for Period       │
    │ (academic_period_courses)      │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Fetch Course Prerequisites &   │
    │ Co-requisites for All Courses  │
    └────────┬───────────────────────┘
             │
   ┌─────────▼─────────┐
   │   Logged In?      │
   └─────┬──────┬──────┘
         │      │
    ┌────▼──┐ ┌▼─────┐
    │ Yes   │ │ No   │
    └───┬───┘ └┬─────┘
        │      │
        │      └──────────────────┐
        │                         │
        ▼                         ▼
┌───────────────────────┐  ┌──────────────────────────┐
│ Check Student         │  │ Disable ALL courses with │
│ Eligibility API       │  │ prerequisites/co-reqs    │
│ (grades validation)   │  │                          │
└───────┬───────────────┘  └──────────┬───────────────┘
        │                             │
        ▼                             │
┌───────────────────────┐             │
│ Disable only courses  │             │
│ with unmet prereqs    │             │
└───────┬───────────────┘             │
        │                             │
        └──────────┬──────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Render Form with     │
        │ - Course options     │
        │ - Prefilled fields   │
        │ - Lock icons         │
        │ - Helper text        │
        └──────────────────────┘
```

### Prerequisite Checking Logic

```typescript
// Step 1: Fetch course requisites
const requisitesRes = await coursesApi.getCourseRequisites(courseIds);

// Step 2: Build requisites map
const requisitesMap = {};
requisitesRes.forEach((req) => {
  if (req.type === 'prerequisite') {
    requisitesMap[req.courseId].prerequisites.push({...});
  } else if (req.type === 'corequisite') {
    requisitesMap[req.courseId].corequisites.push({...});
  }
});

// Step 3: For logged-in users, check eligibility
if (isAuthenticated && user?.id) {
  const eligibilityRes = await coursesApi.checkStudentEligibility(
    user.id,
    courseIds
  );

  // Step 4: Disable courses based on eligibility
  courseOpts.forEach((opt) => {
    const eligibility = eligibilityMap[opt.value];
    if (eligibility && !eligibility.eligible) {
      opt.disabled = true;
      opt.helperText = `Prerequisites not met: ${missingNames}`;
    }
  });
}
```

### Co-requisite Auto-Selection Algorithm

```typescript
const handleToggle = (optionValue: string) => {
  let newValue: string[];

  if (value.includes(optionValue)) {
    // REMOVING - remove co-requisites bidirectionally
    newValue = value.filter((v) => v !== optionValue);

    // Remove direct co-requisites
    option.corequisites?.forEach((coreqId) => {
      newValue = newValue.filter((v) => v !== coreqId);
    });

    // Remove reverse co-requisites (courses that list this as co-req)
    options.forEach((opt) => {
      if (opt.corequisites?.includes(optionValue)) {
        newValue = newValue.filter((v) => v !== opt.value);
      }
    });
  } else {
    // ADDING - add co-requisites bidirectionally
    newValue = [...value, optionValue];

    // Add direct co-requisites
    option.corequisites?.forEach((coreqId) => {
      if (!newValue.includes(coreqId) && !isDisabled(coreqId)) {
        newValue.push(coreqId);
      }
    });

    // Add reverse co-requisites
    options.forEach((opt) => {
      if (opt.corequisites?.includes(optionValue) && !opt.disabled) {
        if (!newValue.includes(opt.value)) {
          newValue.push(opt.value);
        }
      }
    });
  }

  onChange(newValue);
};
```

---

## API Endpoints

### 1. Get Course Requisites
```
GET /course-requisites?courseIds={id1,id2,id3}
```

**Response:**
```json
[
  {
    "courseId": "course-123",
    "requisiteCourseId": "course-456",
    "type": "prerequisite",
    "requisiteCourse": {
      "id": "course-456",
      "name": "Introduction to Programming"
    }
  },
  {
    "courseId": "course-789",
    "requisiteCourseId": "course-790",
    "type": "corequisite",
    "requisiteCourse": {
      "id": "course-790",
      "name": "Data Structures Lab"
    }
  }
]
```

---

### 2. Check Student Eligibility
```
GET /course-requisites/check-student?studentId={userId}&courseIds={id1,id2,id3}
```

**Response:**
```json
[
  {
    "courseId": "course-123",
    "eligible": true,
    "missingPrerequisites": []
  },
  {
    "courseId": "course-456",
    "eligible": false,
    "missingPrerequisites": [
      {
        "id": "course-789",
        "name": "Algebra I",
        "grade": null
      }
    ]
  }
]
```

---

### 3. Get Academic Period Courses
```
GET /academic-period-courses/{periodId}/courses
```

**Response:**
```json
[
  {
    "id": "apc-123",
    "courseId": "course-456",
    "periodId": "period-789",
    "course": {
      "id": "course-456",
      "name": "Web Development",
      "price": 5000
    }
  }
]
```

---

## User Experience

### For Guest Users

**What They See:**
1. Enrollment form with all fields empty
2. Course selector showing available courses
3. Courses with prerequisites/co-requisites are **disabled**
4. Helper text: `"Requires: [courses] (Login to check eligibility)"`
5. Cannot select disabled courses
6. Encouraged to create account or login

**User Journey:**
```
Guest visits /enrollment/form
    │
    ▼
Sees enrollment period info
    │
    ▼
Views course list
    │
    ▼
Some courses are grayed out
    │
    ▼
Reads helper text explaining why
    │
    ▼
Can only select courses without prerequisites
    │
    ▼
Fills form and submits
```

---

### For Logged-in Users

**What They See:**
1. Blue info banner about prefilled fields
2. Name, email, birth date prefilled with lock icons 🔒
3. Contact number prefilled but editable
4. Course selector with eligibility-based filtering
5. Only courses with **unmet prerequisites** are disabled
6. Helper text shows specific missing prerequisites
7. Co-requisite courses auto-select when selected
8. Total price calculation displayed

**User Journey:**
```
Student taps Enrollment → New Enrollment
    │
    ▼
Sees prefilled personal info (locked)
    │
    ▼
Views course list with eligibility status
    │
    ▼
Selects Course A
    │
    ▼
Course B (co-requisite) auto-selects
    │
    ▼
Sees total price update: ₱10,000
    │
    ▼
Fills remaining fields
    │
    ▼
Submits enrollment
    │
    ▼
Navigates to enrollment status page
```

---

## Testing Guidelines

### Test Scenarios

#### 1. Guest User Testing

**Test Case 1.1: View Courses with Prerequisites**
- [ ] Open enrollment form as guest
- [ ] Verify courses with prerequisites are disabled
- [ ] Check helper text displays: "Requires: [courses] (Login to check eligibility)"
- [ ] Verify cannot click/select disabled courses
- [ ] Confirm only courses without prerequisites are selectable

**Test Case 1.2: Submit Enrollment as Guest**
- [ ] Select available courses (no prerequisites)
- [ ] Fill all required fields
- [ ] Upload valid ID and 2x2 photo
- [ ] Verify total price calculation is correct
- [ ] Submit form
- [ ] Confirm navigation to status page
- [ ] Verify enrollment created with correct course names

---

#### 2. Logged-in User Testing

**Test Case 2.1: Field Prefill Verification**
- [ ] Login as student
- [ ] Navigate to Enrollment → New Enrollment
- [ ] Verify blue info banner displays
- [ ] Check following fields are prefilled:
  - [ ] First Name (locked 🔒)
  - [ ] Middle Name (locked 🔒)
  - [ ] Last Name (locked 🔒)
  - [ ] Birth Date (locked 🔒)
  - [ ] Preferred Email (locked 🔒)
  - [ ] Contact Number (prefilled but NOT locked)
- [ ] Verify locked fields cannot be edited
- [ ] Verify contact number CAN be edited

**Test Case 2.2: Prerequisite Eligibility - Student WITH Passed Prerequisites**
- [ ] Login as student who passed "Intro to Programming"
- [ ] Open enrollment form
- [ ] Verify "Advanced Programming" course is **enabled** (not grayed out)
- [ ] Check helper text shows co-requisites if applicable
- [ ] Confirm course can be selected

**Test Case 2.3: Prerequisite Eligibility - Student WITHOUT Passed Prerequisites**
- [ ] Login as student who has NOT passed "Algebra I"
- [ ] Open enrollment form
- [ ] Verify "Calculus I" course is **disabled** (grayed out)
- [ ] Check helper text: "Prerequisites not met: Algebra I"
- [ ] Verify course cannot be selected

**Test Case 2.4: Co-requisite Auto-Selection**
- [ ] Assume: "Data Structures" and "Data Structures Lab" are co-requisites
- [ ] Select "Data Structures"
- [ ] Verify "Data Structures Lab" is **automatically selected**
- [ ] Check both courses appear as chips
- [ ] Verify total price includes both courses
- [ ] Now select "Data Structures Lab" first (after deselecting all)
- [ ] Verify "Data Structures" is automatically selected (bidirectional)

**Test Case 2.5: Co-requisite Auto-Removal**
- [ ] Select a course with co-requisites (e.g., "Physics I" + "Physics Lab")
- [ ] Verify both are selected
- [ ] Uncheck "Physics I" from dropdown
- [ ] Verify "Physics Lab" is **automatically unchecked**
- [ ] Verify both removed from chips
- [ ] Verify total price updated correctly
- [ ] Re-select both courses
- [ ] Click X button on "Physics I" chip
- [ ] Verify "Physics Lab" chip is also removed

**Test Case 2.6: Course Pricing Calculation**
- [ ] Select 3 courses with prices: ₱5,000, ₱3,000, ₱2,000
- [ ] Verify display shows: "3 courses selected"
- [ ] Verify total: "Total Price: ₱10,000"
- [ ] Remove one course (₱2,000)
- [ ] Verify display updates: "2 courses selected"
- [ ] Verify total updates: "Total Price: ₱8,000"

**Test Case 2.7: Search Functionality**
- [ ] Open course dropdown
- [ ] Type "Web" in search box
- [ ] Verify only courses with "Web" in name display
- [ ] Clear search
- [ ] Verify all courses display again

**Test Case 2.8: Complete Enrollment Submission**
- [ ] Login as student
- [ ] Navigate to enrollment form
- [ ] Verify prefilled fields
- [ ] Select multiple courses (mix of regular and co-requisite courses)
- [ ] Fill remaining required fields
- [ ] Upload valid ID and photo
- [ ] Submit form
- [ ] Verify navigation to status page
- [ ] Check database: enrollment_request record created
- [ ] Verify coursesToEnroll field contains comma-separated course names

---

#### 3. Navigation Testing

**Test Case 3.1: Enrollment Dropdown Menu**
- [ ] Login as student
- [ ] Tap "Enrollment" tab in bottom navigation
- [ ] Verify dropdown opens with 3 options:
  - [ ] New Enrollment
  - [ ] Study Load
  - [ ] Schedule
- [ ] Tap "New Enrollment"
- [ ] Verify navigation to `/enrollment/form`
- [ ] Verify route is highlighted as active

**Test Case 3.2: Guest Access**
- [ ] Logout (guest mode)
- [ ] Navigate directly to `/enrollment/form`
- [ ] Verify enrollment form loads
- [ ] Verify NO prefilled fields
- [ ] Verify NO lock icons
- [ ] Verify courses with prerequisites are disabled

---

#### 4. Edge Cases

**Test Case 4.1: No Ongoing Enrollment Period**
- [ ] Ensure no active enrollment period in database
- [ ] Open enrollment form
- [ ] Verify "Enrollment Currently Unavailable" message
- [ ] Check "Return to Home" button works

**Test Case 4.2: Empty Course List**
- [ ] Create enrollment period with no associated courses
- [ ] Open enrollment form
- [ ] Verify course dropdown shows: "No courses available"
- [ ] Verify cannot submit form

**Test Case 4.3: All Courses Disabled (Guest with All Prerequisites)**
- [ ] As guest, open enrollment form
- [ ] If all courses have prerequisites
- [ ] Verify all courses are disabled
- [ ] Verify helper text encourages login

**Test Case 4.4: Disabled Co-requisite Course**
- [ ] Assume: Course A has co-requisite Course B
- [ ] Course B has unmet prerequisites (disabled)
- [ ] Select Course A
- [ ] Verify Course B does NOT auto-select (because disabled)
- [ ] Verify only Course A is selected

---

### Performance Testing

**Test Case 5.1: Large Course List**
- [ ] Create 100+ courses in system
- [ ] Open enrollment form
- [ ] Verify search functionality works smoothly
- [ ] Scroll through course list
- [ ] Verify no lag or freezing

**Test Case 5.2: Multiple Co-requisites Chain**
- [ ] Create courses with complex co-requisite chains
- [ ] Select a course with 5+ co-requisites
- [ ] Verify all co-requisites select correctly
- [ ] Verify removal works bidirectionally
- [ ] Check total price calculation is accurate

---

### API Integration Testing

**Test Case 6.1: Course Requisites API**
- [ ] Ensure courses have prerequisites/co-requisites in database
- [ ] Monitor network tab
- [ ] Verify `GET /course-requisites?courseIds=...` is called
- [ ] Check response contains requisite data
- [ ] Verify courses are disabled/enabled correctly

**Test Case 6.2: Student Eligibility API**
- [ ] Login as student with grades in database
- [ ] Monitor network tab
- [ ] Verify `GET /course-requisites/check-student?studentId=...` is called
- [ ] Check response contains eligibility data
- [ ] Verify only courses with unmet prerequisites are disabled

**Test Case 6.3: Enrollment Submission**
- [ ] Fill and submit enrollment form
- [ ] Monitor network tab
- [ ] Verify `POST /enrollment/enroll` is called
- [ ] Check request payload:
  - [ ] coursesToEnroll is comma-separated course names
  - [ ] All other fields present
- [ ] Verify response returns enrollmentId
- [ ] Check database for created record

---

## Summary

The mobile app enrollment screen now has **full feature parity** with the web app's enhanced enrollment flow. Key achievements:

✅ Multi-course selection with search
✅ Prerequisite validation (logged-in users only)
✅ Co-requisite auto-selection (bidirectional)
✅ Field prefill with lock icons
✅ Course pricing display
✅ Accessible from Enrollment dropdown menu
✅ Works for both guest and logged-in users

**Estimated Lines of Code:** ~2,500+ lines across all files

**Development Time:** Single session implementation

**Compatibility:** React Native (Expo), TypeScript, iOS/Android

---

## Related Documentation

- **Web App Enrollment Flow:** `EduOps/Documentations/ENROLLMENT_ENHANCED_FLOW.md`
- **API Documentation:** (To be created)
- **Database Schema:** `api/prisma/schema.prisma`

---

**End of Documentation**
