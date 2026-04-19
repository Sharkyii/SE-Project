# Fix for All Pages - Dark Mode Compatibility

## Issue
All existing pages (CourseCreation, TimetableManager, etc.) have light-mode styling with:
- `text-gray-800`, `text-gray-700` (dark text on light background)
- `bg-white` backgrounds
- `border-gray-300` borders

These are NOT visible on the dark Aurora background.

## Solution
Each page needs to be updated with dark mode compatible styles:

### Replace These Classes:
```
text-gray-800 → text-white
text-gray-700 → text-gray-300
text-gray-600 → text-gray-400
bg-white → glass-effect (or bg-gray-900/50)
border-gray-300 → border-gray-700
border-gray-100 → border-gray-800
```

### For Input Fields:
```
Old: border border-gray-300 bg-white text-gray-900
New: border border-gray-700 bg-gray-900/50 text-white placeholder-gray-500
```

### For Buttons:
Keep gradient buttons as they are, but update text colors in other buttons.

## Quick Fix Script

Run this in each page file to update colors:

1. Replace all `text-gray-800` with `text-white`
2. Replace all `text-gray-700` with `text-gray-300`
3. Replace all `text-gray-600` with `text-gray-400`
4. Replace all `bg-white` with `glass-effect`
5. Replace all `border-gray-300` with `border-gray-700`
6. Replace all `border-gray-100` with `border-gray-800`

## Files That Need Updating

### Admin Pages:
- ✅ AdminDashboard.tsx (already updated)
- ❌ CourseCreation.tsx
- ❌ TimetableManager.tsx
- ❌ FeeVerification.tsx
- ❌ UserManagement.tsx
- ❌ AdminCourseEnrollment.tsx
- ❌ GradeApprovals.tsx
- ❌ EnrollmentManagement.tsx
- ❌ ExamTimetableManager.tsx
- ❌ CourseAllocation.tsx
- ❌ AdminAttendance.tsx

### Faculty Pages:
- ✅ FacultyDashboard.tsx (already updated)
- ❌ AttendanceManager.tsx
- ❌ GradeManager.tsx
- ❌ QuizUpload.tsx
- ❌ FacultyTimetable.tsx

### Student Pages:
- ✅ StudentDashboard.tsx (already updated)
- ❌ StudentRegistration.tsx
- ❌ Electives.tsx
- ❌ StudentGrades.tsx
- ❌ StudentTimetable.tsx
- ❌ StudentExamTimetable.tsx
- ❌ FeeManagement.tsx
- ❌ StudentAttendance.tsx

## Temporary Workaround

Add this to index.css to make all text visible:
```css
main * {
  color: white !important;
}
```

But this is NOT recommended - proper fix is to update each component.
