# Chatbot & Dashboard Setup Guide

## Overview
This guide will help you set up the AI-powered chatbot using Google's Gemini 2.5 model and the new dashboard features.

## Features Added

### 1. AI Chatbot
- Powered by Google Gemini 2.5 Flash
- Knows about IIIT Gwalior (campus, facilities, programs)
- Can answer questions about courses from your database
- Provides guidance on using the ERP system
- Accessible from all pages via floating button

### 2. Landing Page
- Professional welcome page at root URL (/)
- Information about IIIT Gwalior
- Feature highlights
- Direct login access

### 3. Role-Specific Dashboards
- **Student Dashboard**: Shows enrolled courses, attendance, CGPA, fees, quick actions
- **Faculty Dashboard**: Shows courses teaching, students, pending grades, schedule
- **Admin Dashboard**: System overview, statistics, recent activities, department info

## Setup Instructions

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key

### Step 2: Configure Environment

1. Open `server/.env` file
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```

### Step 3: Install Dependencies

The Google Generative AI package has already been installed. If you need to reinstall:

```bash
cd server
npm install @google/generative-ai
```

### Step 4: Start the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Using the Chatbot

### Accessing the Chatbot
- Look for the blue circular button with a chat icon in the bottom-right corner
- Click it to open the chatbot interface
- Available on all pages (landing page and dashboard)

### What You Can Ask

**About IIIT Gwalior:**
- "Tell me about IIIT Gwalior"
- "What programs are offered?"
- "What facilities are available on campus?"
- "How do I get admission?"

**About Courses:**
- "What courses are available?"
- "Tell me about CSE courses"
- "What are the elective courses?"
- "Show me semester 3 courses"

**ERP System Help:**
- "How do I enroll in courses?"
- "Where can I check my grades?"
- "How do I pay fees?"
- "How do I view my timetable?"

**General Queries:**
- "What is the fee structure?"
- "Where is the library?"
- "What sports facilities are available?"

## Dashboard Features

### Student Dashboard
- **Stats Cards**: Enrolled courses, attendance %, CGPA, fee status
- **Quick Actions**: View timetable, enroll courses, check grades, pay fees
- **Academic Progress**: Semester-wise performance chart
- **Upcoming Events**: Exams, assignments, registration deadlines

### Faculty Dashboard
- **Stats Cards**: Courses teaching, total students, pending grades, upcoming classes
- **Quick Actions**: Mark attendance, enter grades, view timetable, upload quiz
- **Today's Schedule**: Class timings and rooms
- **Pending Tasks**: Grading and other tasks with priority levels

### Admin Dashboard
- **Stats Cards**: Total students, faculty, courses, pending approvals, fee collection, enrollments
- **Quick Actions**: Manage users, create courses, verify fees, manage enrollments
- **Recent Activities**: System activity log
- **System Status**: Database, API, storage health
- **Department Overview**: Department-wise statistics

## Customization

### Chatbot Context
Edit `server/src/controllers/chatbotController.ts` to customize:
- IIIT Gwalior information
- Response style
- Additional features

### Dashboard Data
Update the dashboard components to fetch real data:
- `client/src/pages/student/StudentDashboard.tsx`
- `client/src/pages/faculty/FacultyDashboard.tsx`
- `client/src/pages/admin/AdminDashboard.tsx`

Replace mock data with actual API calls to your Supabase database.

## API Endpoints

### Chatbot Endpoints
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/courses` - Get course information
- `GET /api/chatbot/stats` - Get public statistics

## Troubleshooting

### Chatbot Not Responding
1. Check if Gemini API key is correctly set in `.env`
2. Verify the server is running on port 5000
3. Check browser console for errors
4. Ensure you have internet connection (API calls to Google)

### Dashboard Not Loading
1. Check if user is authenticated
2. Verify role-based routing is working
3. Check browser console for errors

### CORS Issues
If you see CORS errors:
1. Verify `CLIENT_URL` in server `.env` matches your frontend URL
2. Check CORS configuration in `server/src/app.ts`

## Notes

- The chatbot uses Gemini 2.5 Flash (free tier)
- Conversation history is maintained during the session
- The chatbot can access public course data from your database
- Private student information is NOT accessible to the chatbot
- All routes are protected based on user roles

## Next Steps

1. Add more IIIT Gwalior specific information to the chatbot context
2. Connect dashboard stats to real database queries
3. Add more interactive features to dashboards
4. Implement notification system
5. Add analytics and reporting features

## Support

For issues or questions:
1. Check the console logs (browser and server)
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check that the database is accessible
