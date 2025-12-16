# PegPro Fishing Match Tracker - Design Guidelines

## Authentication
**No authentication required.** This is a single-user, local-first utility app. All match data persists locally using AsyncStorage.

**Profile/Settings Screen Required:**
- User avatar selection (generate 3 fishing-themed preset avatars: angler silhouette, fish icon, hook icon)
- Display name field (defaults to "Angler")
- App preferences: units (lb/oz vs kg/g), theme, haptics, sound, weather API key

## Navigation Architecture

**Stack-Only Navigation** - Linear flow optimized for active match usage:
1. **Onboarding Stack** (first-time users only): Welcome → Permissions
2. **Main Stack**: Match Setup → Live Match → End Match Summary
3. **Modal Overlays**: Manual Weight Edit, Alarm Management, Add/Edit Alarm, Weather Details, Settings, Lock Mode

**Flow:**
- App opens to Match Setup screen (or Live Match if match in progress)
- Live Match is the persistent core screen during active matches
- Modals slide up from bottom for quick actions
- Lock Mode is a full-screen overlay preventing accidental touches

## Screen Specifications

### 1. Welcome/Onboarding Screen
- **Purpose:** First-time intro and permissions request
- **Layout:**
  - Transparent header, no navigation buttons
  - Scrollable content area with 3 feature cards (timer tracking, multi-net monitoring, weather integration)
  - Bottom fixed area with "Get Started" CTA button
  - Safe area insets: top: insets.top + Spacing.xl, bottom: insets.bottom + Spacing.xl
- **Components:** Feature cards with Feather icons, permission request alerts (native modals)

### 2. Match Setup Screen
- **Purpose:** Configure new match parameters
- **Layout:**
  - Default header with title "New Match", right button: "Settings" (gear icon)
  - Scrollable form with sections
  - Bottom fixed "Start Match" button (coral-red, full-width with shadow)
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- **Form Fields:**
  - Match name (text input)
  - Duration (hour/minute picker)
  - Peg number (numeric input)
  - Number of nets (1-6 horizontal selector)
  - Per-net capacity (optional numeric input with unit suffix)
  - Units toggle (lb/oz or kg/g segmented control)
  - "Keep screen on" switch

### 3. Live Match Screen (Core)
- **Purpose:** Real-time match monitoring and weight tracking
- **Layout:**
  - Custom transparent header with:
    - Left: Lock icon button
    - Center: Large countdown timer (MM:SS)
    - Right: Weather icon button, Menu icon (3-dot)
  - Top status bar: Temperature, pressure trend (arrow icon), wind speed
  - Main content: 2×3 grid of net tiles (non-scrollable, fills screen)
  - Bottom fixed panel: Total weight display, alarm indicator, quick add alarm button
  - Safe area insets: top: headerHeight + Spacing.sm, bottom: insets.bottom + Spacing.md
- **Net Tile Components:**
  - Large weight display (center)
  - Subtract button (left, circular, teal)
  - Add button (right, circular, coral-red)
  - Progress bar below weight (color-coded: green < 80%, amber 80-100%, red > 100%)
  - Manual edit icon (small, top-right corner)
  - Tile background changes based on status (dark navy default, subtle glow when active)

### 4. Manual Weight Edit Modal
- **Purpose:** Quick numeric weight entry
- **Layout:**
  - Modal slides from bottom, 60% screen height
  - Header: "Edit Net X Weight", Close button
  - Large numeric keypad (3×4 grid)
  - Current weight display above keypad
  - Confirm (coral-red) and Cancel (gray) buttons at bottom
  - Safe area insets: bottom: insets.bottom + Spacing.md
- **Components:** Custom numeric keypad, decimal point support

### 5. Alarm Management Screen
- **Purpose:** View and manage all alarms
- **Layout:**
  - Default header with title "Alarms", left: Back, right: Add (plus icon)
  - Scrollable list of alarm cards
  - Empty state: "No alarms set" with illustration
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- **List Items:** Alarm time/pattern, sound icon, toggle switch, swipe-to-delete

### 6. Add/Edit Alarm Screen
- **Purpose:** Create or edit alarm with three modes
- **Layout:**
  - Default header, title: "New Alarm" or "Edit Alarm", left: Cancel, right: Save
  - Scrollable form
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- **Form Sections:**
  - Alarm mode selector (segmented control): One-time, Repeat, Duration Pattern
  - Conditional inputs based on mode (time picker, interval input, pattern configuration)
  - Sound/vibration toggles

### 7. Weather Details Screen
- **Purpose:** Comprehensive weather information
- **Layout:**
  - Default header, title: "Weather", left: Back, right: Refresh icon
  - Scrollable content
  - Last update timestamp at top
  - Offline indicator banner when no connection
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- **Components:** Weather metric cards, pressure trend line chart, humidity/wind speed indicators

### 8. End Match Summary Screen
- **Purpose:** Review completed match data
- **Layout:**
  - Default header, title: "Match Complete", right: Share icon
  - Scrollable content
  - Bottom fixed buttons: "Export" and "New Match" (coral-red)
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- **Components:** Total weight card (large), per-net breakdown list, over-capacity warnings (red badges)

### 9. Settings Screen
- **Purpose:** App configuration
- **Layout:**
  - Default header, title: "Settings", left: Back
  - Scrollable list with sections
  - Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl
- **Sections:** Profile (avatar, name), Units, Appearance (theme options), Sound/Haptics, Weather API Key

### 10. Lock Mode Overlay
- **Purpose:** Prevent accidental touches during match
- **Layout:**
  - Full-screen semi-transparent dark overlay
  - Center: Large "Locked" text with padlock icon
  - Bottom: "Tap 3 times to unlock" instruction
  - Triple-tap gesture to dismiss

## Design System

### Color Palette
**Primary (Coral Red):** `#FF6B5A` - CTAs, add buttons, progress warnings
**Secondary (Teal Blue):** `#4ECDC4` - subtract buttons, accents, links
**Background (Dark Navy):** `#1A2332` - app background
**Surface (Charcoal):** `#2D3748` - cards, tiles, modals
**Success (Green):** `#48BB78` - progress bars < 80%
**Warning (Amber):** `#F6AD55` - progress bars 80-100%
**Error (Red):** `#FC8181` - over-capacity, critical alerts
**Text Primary:** `#FFFFFF` - main text
**Text Secondary:** `#A0AEC0` - labels, metadata
**Border:** `#4A5568` - dividers, input borders

### Typography
- **Heading 1 (Timer):** 48px, Bold, Tabular Numbers
- **Heading 2 (Totals):** 32px, Bold
- **Heading 3 (Section):** 20px, Semibold
- **Body Large (Weight):** 24px, Medium
- **Body:** 16px, Regular
- **Caption:** 14px, Regular
- **System Font:** Use platform default (SF Pro for iOS, Roboto for Android)

### Component Specifications

**Net Tile:**
- Size: Flexible (fills 1/3 width × 1/2 height of grid)
- Border radius: 12px
- Background: Surface color
- Padding: Spacing.md
- Add/Subtract buttons: 44×44px circular, floating 8px from edges
- Drop shadow on buttons: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2

**Primary Button:**
- Height: 56px
- Border radius: 12px
- Background: Primary color
- Text: White, 16px, Semibold
- Pressed state: Opacity 0.8 with haptic feedback

**Progress Bar:**
- Height: 4px
- Border radius: 2px
- Animated width change with easing
- Color changes dynamically based on percentage

**Haptic Feedback:**
- Weight increment/decrement: Light impact
- Button press: Selection feedback
- Alarm trigger: Heavy impact
- Match start/end: Success notification

### Critical Assets
1. **User Avatars (3 presets):** Stylized fishing-themed icons (angler, fish, hook) matching app aesthetic
2. **Weather Icons:** Sun, cloud, rain, wind (use Feather icon set)
3. **App Icon:** Based on provided PegPro logo

### Accessibility
- Minimum touch target: 44×44px
- Text contrast ratio: 4.5:1 minimum
- Support VoiceOver/TalkBack for screen readers
- Large text support (Dynamic Type on iOS)
- Haptic feedback as alternative to audio cues
- Color is not sole indicator (use icons + color for progress states)