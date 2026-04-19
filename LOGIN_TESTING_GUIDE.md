# Login & Authentication Testing Guide

## Fixed Issues ✅

### 1. Routing Structure
- ✅ Fixed duplicate student/dashboard route
- ✅ Corrected all dashboard paths to use `/dashboard/[role]/[page]` format
- ✅ Updated getDefaultRoute() to use correct paths
- ✅ Fixed sidebar navigation links
- ✅ Fixed quick action button links in all dashboards

### 2. Authentication Flow
- ✅ Zustand store with persist middleware (localStorage caching)
- ✅ Protected routes with role-based access control
- ✅ Proper redirect after login
- ✅ Session persistence across page refreshes

## Testing Login for All Roles

### Prerequisites
1. Server running on `http://localhost:5000`
2. Client running on `http://localhost:5173`
3. Database with test users for each role

### Test Credentials
You need to create test users in your database for:
- **Admin**: admin@iiitg.ac.in
- **Faculty**: faculty@iiitg.ac.in
- **Student**: student@iiitg.ac.in

### Testing Steps

#### 1. Test Admin Login
```
1. Navigate to http://localhost:5173
2. Click "Login" button
3. Enter admin credentials
4. Should redirect to /dashboard/admin/dashboard
5. Verify sidebar shows admin menu items
6. Click different menu items to test navigation
7. Logout and verify redirect to /login
```

**Expected Admin Routes:**
- /dashboard/admin/dashboard
- /dashboard/admin/courses
- /dashboard/admin/enrollments
- /dashboard/admin/enrollment-management
- /dashboard/admin/course-allocation
- /dashboard/admin/timetable
- /dashboard/admin/exam-timetable
- /dashboard/admin/users
- /dashboard/admin/fee-verification
- /dashboard/admin/reports
- /dashboard/admin/attendance

#### 2. Test Faculty Login
```
1. Navigate to http://localhost:5173
2. Click "Login" button
3. Enter faculty credentials
4. Should redirect to /dashboard/faculty/dashboard
5. Verify sidebar shows faculty menu items
6. Test navigation between pages
7. Logout and verify redirect to /login
```

**Expected Faculty Routes:**
- /dashboard/faculty/dashboard
- /dashboard/faculty/timetable
- /dashboard/faculty/attendance
- /dashboard/faculty/grades
- /dashboard/faculty/quiz

#### 3. Test Student Login
```
1. Navigate to http://localhost:5173
2. Click "Login" button
3. Enter student credentials
4. Should redirect to /dashboard/student/dashboard
5. Verify sidebar shows student menu items
6. Test navigation between pages
7. Logout and verify redirect to /login
```

**Expected Student Routes:**
- /dashboard/student/dashboard
- /dashboard/student/registration
- /dashboard/student/fees
- /dashboard/student/electives
- /dashboard/student/attendance
- /dashboard/student/timetable
- /dashboard/student/exam-timetable
- /dashboard/student/grades
- /dashboard/student/feedback
- /dashboard/student/leaderboard

### Testing Session Persistence (Caching)

#### Test 1: Page Refresh
```
1. Login with any role
2. Navigate to dashboard
3. Refresh the page (F5 or Ctrl+R)
4. Should remain logged in
5. Should stay on the same page
```

#### Test 2: Browser Close/Reopen
```
1. Login with any role
2. Close the browser completely
3. Reopen browser
4. Navigate to http://localhost:5173
5. Should automatically redirect to dashboard
6. User should still be logged in
```

#### Test 3: Direct URL Access
```
1. Login with any role
2. Copy a dashboard URL (e.g., /dashboard/student/grades)
3. Logout
4. Paste the URL in browser
5. Should redirect to /login
6. After login, should redirect to dashboard
```

#### Test 4: Role-Based Access
```
1. Login as student
2. Try to access /dashboard/admin/courses
3. Should redirect to /dashboard/student/dashboard
4. Verify students cannot access admin/faculty routes
```

### Checking LocalStorage

Open browser DevTools (F12) and check:
```javascript
// In Console tab:
localStorage.getItem('academic-erp-storage')

// Should show something like:
{
  "state": {
    "user": {
      "id": 1,
      "email": "student@iiitg.ac.in",
      "role": "student",
      "name": "student"
    },
    "token": "cookie-auth",
    "isAuthenticated": true
  },
  "version": 0
}
```

### Testing Logout

```
1. Login with any role
2. Click logout button in topbar
3. Should redirect to /login
4. Check localStorage - should be cleared
5. Try to access dashboard URL directly
6. Should redirect to /login
```

## Common Issues & Solutions

### Issue 1: "Cannot read property 'role' of null"
**Solution**: User object not properly set in store
```javascript
// Check in Auth.tsx that login is called with correct data:
loginStore(
  { id: data.id, email: data.email, role: data.role, name: data.email.split('@')[0] },
  'cookie-auth'
);
```

### Issue 2: Infinite redirect loop
**Solution**: Check getDefaultRoute() function returns correct path format
```javascript
// Should be:
case 'admin': return '/dashboard/admin/dashboard';
// NOT:
case 'admin': return '/admin/dashboard';
```

### Issue 3: 404 on dashboard routes
**Solution**: Ensure all routes use correct path structure
```javascript
// Correct:
<Route path="admin/dashboard" element={<AdminDashboard />} />
// Under parent route: /dashboard
```

### Issue 4: Session not persisting
**Solution**: Check Zustand persist configuration
```javascript
// In store.ts:
persist(
  (set) => ({ /* state */ }),
  { name: 'academic-erp-storage' }
)
```

### Issue 5: Role-based access not working
**Solution**: Check ProtectedRoute component
```javascript
// Should check both authentication and role:
if (!isAuthenticated) return <Navigate to="/login" />;
if (allowedRoles && !allowedRoles.includes(user.role)) {
  return <Navigate to="/dashboard" />;
}
```

## API Endpoints to Test

### Login Endpoint
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "student@iiitg.ac.in",
  "password": "your_password"
}

# Expected Response:
{
  "id": 1,
  "email": "student@iiitg.ac.in",
  "role": "student"
}
```

### Test with cURL
```bash
# Admin Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iiitg.ac.in","password":"admin123"}' \
  -c cookies.txt

# Faculty Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty@iiitg.ac.in","password":"faculty123"}' \
  -c cookies.txt

# Student Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@iiitg.ac.in","password":"student123"}' \
  -c cookies.txt
```

## Debugging Tips

### 1. Check Browser Console
Look for errors related to:
- Failed API calls
- Routing issues
- State management errors

### 2. Check Network Tab
Verify:
- Login API call succeeds (200 status)
- Cookies are set properly
- Response contains user data

### 3. Check React DevTools
Inspect:
- Zustand store state
- Component props
- Route parameters

### 4. Check Server Logs
Look for:
- Authentication errors
- Database connection issues
- JWT token problems

## Success Criteria

✅ All three roles can login successfully
✅ Each role redirects to correct dashboard
✅ Session persists across page refreshes
✅ Session persists after browser close/reopen
✅ Role-based access control works
✅ Logout clears session properly
✅ Direct URL access requires authentication
✅ No console errors
✅ Smooth navigation between pages
✅ All sidebar links work correctly

## Next Steps After Testing

1. ✅ Verify all routes are accessible
2. ✅ Test all CRUD operations
3. ✅ Test file uploads
4. ✅ Test real-time features
5. ✅ Test on different browsers
6. ✅ Test on mobile devices
7. ✅ Performance testing
8. ✅ Security testing

---

**Note**: Make sure you have test users created in your database before testing. If you don't have test users, create them using the admin panel or directly in the database.
