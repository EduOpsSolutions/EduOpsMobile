# Enrollment Tracking - UI/UX Guide

## Login Screen Layout

```
┌─────────────────────────────────────┐
│        [SPRACHINS LOGO]             │  ← Red header
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│                                     │
│        ┌───────────────────┐        │
│        │   WELCOME TO      │        │
│        │  [LOGO IMAGE]     │        │  ← Dark red card
│        │                   │        │
│        │  [📧 Email]       │        │
│        │                   │        │
│        │  [🔒 Password]    │        │
│        │                   │        │
│        │  Forgot password? │        │  ← Yellow link
│        │                   │        │
│        │    [Login]        │        │  ← Red button
│        │                   │        │
│        ├───────────────────┤        │
│        │                   │        │
│        │ Don't have an     │        │  ← Cream text
│        │    account?       │        │
│        │                   │        │
│        │ [Sign Up/Enroll]  │        │  ← Red button
│        │                   │        │
│        │ Already enrolled? │        │  ← Cream text ✨ NEW
│        │                   │        │
│        │[Track Enrollment] │        │  ← Yellow button ✨ NEW
│        │                   │        │
│        │ By using this...  │        │  ← Terms
│        │   Terms Privacy   │        │
│        └───────────────────┘        │
│                                     │
└─────────────────────────────────────┘
```

## Track Enrollment Modal

```
                    ↓ (Taps "Track Enrollment")

┌─────────────────────────────────────┐
│ ████████████████████████████████████│  ← Semi-transparent overlay
│ ██                                ██│
│ ██  ┌──────────────────────────┐ ██│
│ ██  │ Track Enrollment      [X]│ ██│  ← Red header with close
│ ██  ├──────────────────────────┤ ██│
│ ██  │                          │ ██│
│ ██  │ Enter your Enrollment ID │ ██│
│ ██  │ or Email to track...     │ ██│  ← Description
│ ██  │                          │ ██│
│ ██  │ Enrollment ID            │ ██│
│ ██  │ ┌────────────────────┐   │ ██│
│ ██  │ │ 🏷️ [Input field]   │   │ ██│  ← ID input
│ ██  │ └────────────────────┘   │ ██│
│ ██  │                          │ ██│
│ ██  │      ─── OR ───          │ ██│  ← Divider
│ ██  │                          │ ██│
│ ██  │ Email Address            │ ██│
│ ██  │ ┌────────────────────┐   │ ██│
│ ██  │ │ 📧 [Input field]   │   │ ██│  ← Email input
│ ██  │ └────────────────────┘   │ ██│
│ ██  │                          │ ██│
│ ██  │ Forgot enrollment ID?    │ ██│  ← Red link
│ ██  │                          │ ██│
│ ██  │    [Track Now]           │ ██│  ← Red button
│ ██  │                          │ ██│
│ ██  │ ℹ️  You can track using  │ ██│  ← Info box (blue bg)
│ ██  │    either method...      │ ██│
│ ██  │                          │ ██│
│ ██  └──────────────────────────┘ ██│
│ ██                                ██│
└─────────────────────────────────────┘
```

## Loading State

```
┌─────────────────────────────────────┐
│  Track Enrollment               [X] │
├─────────────────────────────────────┤
│                                     │
│  Enrollment ID                      │
│  ┌──────────────────────────────┐   │
│  │ 🏷️ ENR-2024-12345            │   │  ← Filled input
│  └──────────────────────────────┘   │
│                                     │
│            ─── OR ───               │
│                                     │
│  Email Address                      │
│  ┌──────────────────────────────┐   │
│  │ 📧                           │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │   ⟳ Searching...            │   │  ← Loading button
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## Forgot Enrollment ID Modal

```
                    ↓ (Taps "Forgot enrollment ID?")

┌─────────────────────────────────────┐
│  Forgot Enrollment ID           [X] │  ← Red header
├─────────────────────────────────────┤
│                                     │
│  Enter the email address you used  │
│  during enrollment and we'll send   │
│  you your enrollment ID.            │  ← Description
│                                     │
│  Email Address                      │
│  ┌──────────────────────────────┐   │
│  │ 📧 johndoe@email.com         │   │  ← Email input
│  └──────────────────────────────┘   │
│                                     │
│         [Send Email]                │  ← Red button
│                                     │
└─────────────────────────────────────┘
```

## Success Flow

```
1. User enters enrollment ID or email
2. Taps "Track Now"
3. Button shows: "⟳ Searching..."
4. Modal automatically closes
5. Navigates to: /enrollment/status
6. Shows enrollment details
```

## Color Palette

```
Primary Colors:
┌─────────────────┐
│  #de0000        │  Red (primary buttons, headers)
└─────────────────┘

┌─────────────────┐
│  #700A06        │  Dark Red (card backgrounds, text on yellow)
└─────────────────┘

┌─────────────────┐
│  #ffcf00        │  Yellow (track button, links)
└─────────────────┘

┌─────────────────┐
│  #fffdf2        │  Cream/White (text, backgrounds)
└─────────────────┘

Secondary Colors:
┌─────────────────┐
│  #f9f9f9        │  Light Gray (input backgrounds)
└─────────────────┘

┌─────────────────┐
│  #666           │  Medium Gray (icons, placeholders)
└─────────────────┘

┌─────────────────┐
│  #f0f9ff        │  Light Blue (info box background)
└─────────────────┘

┌─────────────────┐
│  #1e40af        │  Blue (info box text)
└─────────────────┘
```

## Typography

```
Headers (Modal titles):
- Font Size: 18-20px
- Font Weight: Bold
- Color: #fff (on red background)

Body Text:
- Font Size: 14px
- Font Weight: Normal
- Color: #666

Button Text:
- Font Size: 15-16px
- Font Weight: 600 (Semi-bold)
- Color: #fff (red button) or #700A06 (yellow button)

Labels:
- Font Size: 14px
- Font Weight: 600
- Color: #333

Input Text:
- Font Size: 14px
- Font Weight: Normal
- Color: #333
```

## Spacing & Sizing

```
Buttons:
- Height: 48-52px (touch-friendly)
- Border Radius: 5-8px
- Padding: 10-16px vertical

Inputs:
- Height: 44-48px
- Border Radius: 8px
- Padding: 12px horizontal

Modals:
- Border Radius: 12-20px (top corners for bottom sheet)
- Padding: 16-20px
- Max Height: 90% of screen

Spacing:
- Between sections: 16-24px
- Between elements: 8-12px
- Between buttons and content: 16-20px
```

## Animations

```
Track Modal:
- Animation: Slide from bottom
- Duration: ~300ms
- Easing: Smooth/ease-out

Forgot ID Modal:
- Animation: Fade in
- Duration: ~200ms
- Easing: Linear

Loading Spinner:
- Rotation: Continuous
- Color: #fff (on buttons)

Button Press:
- Opacity: 0.6 when disabled
- Opacity: 0.8 on press (brief)
```

## Accessibility

```
Touch Targets:
✅ All buttons: Minimum 44x44 points
✅ Close buttons: Minimum 44x44 points
✅ Input fields: Minimum 44 points height

Labels:
✅ All inputs have visible labels
✅ Placeholders provide examples
✅ Error messages clear and specific

Contrast:
✅ Text on backgrounds meets WCAG AA
✅ White text (#fff) on red (#de0000) = 4.8:1
✅ Dark red text (#700A06) on yellow (#ffcf00) = 7.2:1

Keyboard:
✅ Modal closes on overlay tap
✅ Keyboard doesn't cover inputs
✅ Submit on Enter/Return key
✅ Dismissible with hardware back button (Android)
```

## Responsive Behavior

```
Small Screens (< 375px):
- Modal width: 95% of screen
- Smaller font sizes
- Reduced padding
- Single column layout

Medium Screens (375px - 768px):
- Modal width: 90% of screen
- Standard font sizes
- Normal padding
- Optimal touch targets

Large Screens (> 768px):
- Modal max width: 400px
- Centered on screen
- Increased padding
- Better use of space
```

## Error States

```
Empty Input:
┌──────────────────────────────────┐
│  Alert                           │
│  ────────────────────────────── │
│  Input Required                  │
│                                  │
│  Please provide either           │
│  Enrollment ID or Email address. │
│                                  │
│              [OK]                │
└──────────────────────────────────┘

Invalid Email:
┌──────────────────────────────────┐
│  Alert                           │
│  ────────────────────────────── │
│  Invalid Email                   │
│                                  │
│  Please enter a valid            │
│  email address.                  │
│                                  │
│              [OK]                │
└──────────────────────────────────┘

Not Found:
┌──────────────────────────────────┐
│  Alert                           │
│  ────────────────────────────── │
│  Error                           │
│                                  │
│  Enrollment Not Found            │
│  Please check your enrollment    │
│  ID or email and try again.      │
│                                  │
│              [OK]                │
└──────────────────────────────────┘
```

## Best Practices Used

✅ **Mobile-First Design**
- Bottom sheet modal (natural mobile pattern)
- Large touch targets
- Thumb-friendly button placement

✅ **Progressive Disclosure**
- Only shows necessary info
- "Forgot ID?" link appears when needed
- Clear, focused task flow

✅ **Clear Visual Hierarchy**
- Red header draws attention
- Yellow button stands out
- Info box provides context

✅ **Forgiving Input**
- Accept either ID or email
- Trim whitespace automatically
- Clear error messages

✅ **Feedback & Status**
- Loading states
- Success/error alerts
- Disabled states when loading

✅ **Native Feel**
- Uses platform conventions
- Smooth animations
- Proper keyboard handling
- Hardware back button support
