# Class Attendance and Student Management System

A comprehensive, responsive web application for managing student attendance records, academic backlogs, and contact information. Built with React, Vite, and Tailwind CSS.

---

## 🚀 Features

### 📊 Academic Management
- **Backlogs Tracking**: Detailed view of student backlogs across multiple semesters (1-1 to 3-1).
- **Distribution Breakdown**: Dynamic summary breakdown showing exactly how many members have 1 backlog, 2 backlogs, etc.
- **Subject-wise Analysis**: Visualization of backlog counts per subject to identify challenging areas.
- **Export to Excel**: Generate and download detailed backlog reports for the entire department.

### 👨‍💼 Admin & Faculty Tools
- **Attendance Marking**: Fast and easy daily attendance logging for the K12AIDHA room.
- **Parent Contact Portal**: Searchable database of parent contact details for quick communication.
- **Student Information**: Management of vital student data including ABC IDs and laptop availability.
- **Admin Settings**: Configuration for attendance policies and data management.
- **Direct Access Mode**: A powerful administrative mode enabling universal, real-time editing of:
  - **Student Records**: Add/delete members and modify Roll Numbers directly.
  - **Backlog Data**: Manage subject-wise failures and adjust individual counts.
  - **Attendance Records**: Direct override and deletion of historical reports.
  - **Contact Info**: Real-time updates to parent and student details.

### 📋 Attendance Log
- **Historical Records**: Review and filter past attendance reports by date.
- **Report Retrieval**: Instant access to previously submitted attendance sheets.

### 🖨️ Professional Reporting
- **Optimized PDF Export**: Advanced print engine logic ensures reports start on the first page without empty space.
- **Natural Pagination**: Large attendance sheets automatically flow across pages with persistent headers.
- **Clean Layout**: Automatically hides non-printable UI elements (navbars, buttons) for a professional look.
- **Dept Summary**: Automatic calculation of present/absent statistics for department records.

### 🔐 Secure Access
- **Premium Login UI**: Redesigned entry portal featuring a modern **White & Emerald Green** "Glassmorphism" theme.
- **Micro-Animations**: Smooth fade-ins and slide-up effects for a state-of-the-art user experience.
- **Admin Authentication**: Protected access with specific credentials (ID: k12AIDHA).
- **Session Management**: Secure logout and persistent session handling.

### 💾 Data Integrity
- **Traditional Typography**: Integrated **Times New Roman** for maximum professionalism and clarity in official records.
- **Local Persistence**: All data is saved to browser storage (LocalStorage), ensuring no data loss on page refresh.
- **Reactive UI**: State-of-the-art UI updates instantly as you modify records.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.2 (Hooks, Functional Components) |
| **Backend** | Node.js, Express (REST API) |
| **Database** | SQLite (better-sqlite3) |
| **Design** | Tailwind CSS 3.3 (responsive, mobile-first) |
| **Icons** | Lucide React |
| **Data Handling** | XLSX (Excel export integration) |
| **Build System** | Vite 5.0 (ultra-fast development) |

---

## ⚙️ Setup & Installation

### 1. Navigate to the project directory
```bash
cd smart
```

### 2. Install dependencies
```bash
# Install root and frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
cd ..
```


### 3. Run development server
```bash
# Starts both Frontend (Vite) and Backend (Node.js) concurrently
npm run dev
```

### 4. Open app
Navigate to **http://localhost:5173** and log in with:
- **Admin ID:** `k12AIDHA`
- **Password:** `k12AIDHA`

### 5. Build for production
```bash
npm run build
```

---

## 📁 Project Structure

## 📁 Project Architecture & Structured File Layout

```
smart/
├── api/                                # Serverless API Layer (Vercel)
│   └── index.js                        # Express server entry handling all REST endpoints & Supabase queries
│
├── server/                             # Backend Server & Cloud Seeding Layer
│   ├── index.js                        # Local Express dev server (mounts api/index.js)
│   ├── db.js                           # SQLite database connection & schema fallback
│   ├── backlog_data.js                 # Semester backlog mapping (s11..s31) for active students
│   ├── seed.js                         # Local SQLite initial seeding script
│   ├── supabaseSeed.js                 # Supabase Cloud Database seeding script
│   └── package.json                    # Backend dependencies
│
├── src/                                # React Frontend Application Layer
│   ├── App.jsx                         # Main Application Container, State & Navigation Router
│   ├── main.jsx                        # React Root Entry Point
│   ├── index.css                       # Global Tailwind CSS Styles & Custom Print Media Queries
│   │
│   ├── components/                     # Component Modules
│   │   ├── AdminDashboardView.jsx      # Super Admin System Overview Dashboard
│   │   ├── AdminSettingsView.jsx       # Admin Policy & Global Data Management View
│   │   ├── AnnouncementsView.jsx       # Student & Parent Announcement Feed Component
│   │   ├── BacklogsView.jsx            # Semester-wise Backlog Details & Student Analytics
│   │   ├── ChatBot.jsx                 # AI Assistant / Student Help Bot
│   │   ├── ClassMembersView.jsx        # Class Roll Roster & Student Profiles
│   │   ├── DailyAttendanceLogView.jsx  # Historical Daily Attendance Logs & Filters
│   │   ├── DailyMarkingView.jsx        # Daily Class Attendance Marking Matrix
│   │   ├── DashboardView.jsx           # Overview Dashboard View
│   │   ├── LoginView.jsx               # Multi-Role Authentication Portal (Admin/ClassAdmin/TeamLead)
│   │   ├── ParentDashboardView.jsx     # Parent Access Dashboard View
│   │   ├── ParentDetailsView.jsx       # Parent Contact Database & Directory
│   │   ├── PrintReportView.jsx         # Professional Printable Attendance Sheet & PDF Exporter
│   │   ├── StudentAttendanceReport.jsx # Individual Student Attendance Report Component
│   │   ├── StudentDashboardView.jsx    # Student Personal Dashboard View
│   │   ├── StudentInfoView.jsx         # Student Details, ABC IDs & Laptop Tracking View
│   │   ├── SubjectWiseView.jsx         # Subject-wise Backlog Distribution & Modal View
│   │   └── TeamLeadDashboardView.jsx   # Team Leader Attendance & Team Analytics View
│   │
│   ├── data/                           # Data Models & Initial Default Datasets
│   │   ├── crtStudentData.js           # CRT Training Student Roster Data
│   │   └── studentInfoData.js          # Core Student Master Dataset (56 Students, Teams, Contact & Backlogs)
│   │
│   ├── hooks/                          # Custom React Hooks
│   │   └── useLocalStorage.js          # React Hook syncing local state with Supabase API & LocalStorage
│   │
│   ├── lib/                            # External Libraries & Database Clients
│   │   └── supabase.js                 # Supabase Cloud Client & CRUD API Helper Functions
│   │
│   └── utils/                          # Utility Helper Functions
│       └── dateUtils.js                # Date Formatting & Timezone Helpers
│
├── .env                                # Local Environment Variables (Supabase Keys)
├── .env.example                        # Environment Variable Configuration Template
├── supabase_schema.sql                 # Supabase PostgreSQL Database Schema & RLS Policies
├── vercel.json                         # Vercel Deployment & Route Rewrite Configuration
├── vite.config.js                      # Vite Bundler & Development Server Settings
├── tailwind.config.js                  # Tailwind CSS Design System Theme Configuration
├── postcss.config.js                   # PostCSS Plugins Configuration
├── package.json                        # Root Dependencies & NPM Scripts
└── README.md                           # Project Documentation
```

---

**Last Updated:** August 2026  
**Status:** ✅ Cloud Ready & Supabase Connected  
