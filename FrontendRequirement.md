# ECV Learning Solutions - Frontend Requirement Specification
## Custom LMS Portal with AWS Cognito Authentication

**Document Version:** 2.0
**Date:** 2026-02-23
**Project:** ECV Moodle LMS - Frontend Portal & Authentication Layer
**Related Documents:**
- REQUIREMENT_SPEC.md (Infrastructure SRS)
- .kiro/specs/moodle-aws-deployment/ (Backend Infrastructure Spec)
- .kiro/steering/ (Product, Tech Stack, Structure)

---

## 1. Executive Summary

This document defines the requirements for building a custom frontend portal that integrates with the ECV Moodle LMS backend. The frontend provides a modern, branded user experience with authentication powered by **AWS Cognito** via **AWS Amplify SDK v6**, and communicates with Moodle through its **Web Services REST API**.

### 1.1 Why a Custom Frontend?

The existing Kiro spec (`.kiro/steering/structure.md`) explicitly states the project does **not** contain frontend/UI code — Moodle provides its own UI. However, the business requirement from ECV Learning Solutions presentation states:

> "We rebuilt Moodle the way educators think, not how developers code."

A custom frontend portal serves as:
- **Branded entry point** for all users (learners, educators, admins)
- **Unified authentication hub** using AWS Cognito (SSO into Moodle)
- **Modern dashboard** that surfaces Moodle data through a better UX
- **Role-based experience** with different views per user type

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CUSTOM FRONTEND PORTAL                     │
│                   (Next.js + Amplify SDK v6)                  │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐  │
│  │  Auth UI   │  │  Dashboard │  │  Course/Content Views  │  │
│  │  (Cognito) │  │  (Role-    │  │  (Moodle Web Services) │  │
│  │            │  │   based)   │  │                        │  │
│  └─────┬──────┘  └─────┬──────┘  └───────────┬────────────┘  │
│        └────────────────┴─────────────────────┘               │
└──────────────────────────────┬────────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                      │
            v                                      v
┌──────────────────────┐            ┌──────────────────────────┐
│   AWS COGNITO        │            │   MIDDLEWARE / BFF        │
│   USER POOL          │            │   (Next.js API Routes)   │
│                      │            │                          │
│  - Authentication    │            │  - Validates Cognito JWT │
│  - User Groups       │            │  - Holds Moodle WS Token │
│  - MFA               │            │  - Proxies Moodle API    │
│  - Social Login      │            │  - Role Mapping          │
│  - Lambda Triggers   │            │  - Response Caching      │
│                      │            │                          │
└──────────┬───────────┘            └────────────┬─────────────┘
           │                                      │
           │  ┌───────────────────────────────┐   │
           └──│  SSO (OAuth2/OIDC)            │   │
              └───────────────┬───────────────┘   │
                              │                   │
                              v                   v
                    ┌──────────────────────────────────┐
                    │         MOODLE LMS BACKEND        │
                    │      (ECS Fargate on AWS)         │
                    │                                   │
                    │  - OAuth2 Auth Plugin (Cognito)   │
                    │  - Web Services REST API          │
                    │  - User Auto-Provisioning         │
                    │  - Course/Content/Grade Engine     │
                    │                                   │
                    └──────────────────────────────────┘
```

### 2.2 Authentication Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌─────────┐
│  User   │────>│ Frontend │────>│ Cognito  │────>│ Moodle  │
│         │     │ (Next.js)│     │ User Pool│     │  LMS    │
└─────────┘     └──────────┘     └──────────┘     └─────────┘

1. User opens frontend portal
2. Frontend redirects to Cognito (Amplify signIn)
3. Cognito authenticates user (password, MFA, social, etc.)
4. Cognito returns JWT tokens (id_token, access_token, refresh_token)
5. Frontend stores tokens (Amplify manages automatically)
6. Frontend calls Middleware (BFF) with Cognito access_token
7. Middleware validates JWT and proxies to Moodle Web Services
8. For direct Moodle access: SSO via OAuth2/OIDC (seamless, no re-login)
```

---

## 3. Technology Stack

### 3.1 Frontend Framework

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | Next.js (App Router) | 15.x | SSR, API routes as BFF, React Server Components |
| **Language** | TypeScript | 5.x | Type safety, matches CDK backend |
| **UI Library** | React | 19.x | Component-based, large ecosystem |
| **Auth SDK** | AWS Amplify v6 | 6.x | Official AWS SDK for Cognito, tree-shakable |
| **Auth UI** | @aws-amplify/ui-react | Latest | Pre-built Authenticator component |
| **Styling** | Tailwind CSS | 4.x | Utility-first, fast prototyping, responsive |
| **State Management** | React Context + Tanstack Query | Latest | Auth context + server state caching |
| **HTTP Client** | fetch (native) | - | Built-in, no extra dependencies |
| **Form Handling** | React Hook Form + Zod | Latest | Type-safe forms with validation |
| **Icons** | Lucide React | Latest | Clean, consistent iconography |

### 3.2 Backend-for-Frontend (BFF)

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **API Layer** | Next.js Route Handlers | Collocated with frontend, no separate server |
| **JWT Validation** | aws-jwt-verify | AWS-maintained JWT verification library |
| **Moodle Client** | Custom REST client | Wraps Moodle Web Services API calls |
| **Caching** | In-memory / Redis | Cache Moodle API responses for performance |

### 3.3 AWS Services (Frontend-Specific)

| Service | Purpose |
|---------|---------|
| **Cognito User Pool** | User authentication, MFA, groups, social login |
| **Cognito Identity Pool** | (Optional) Federated identity for AWS resource access |
| **CloudFront** | CDN for frontend static assets |
| **S3** | Frontend static file hosting (Next.js static export) or via Amplify Hosting |
| **Lambda** | Cognito triggers (pre/post auth, user sync to Moodle) |
| **Amplify Hosting** | (Alternative) Managed hosting for Next.js SSR |

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-AUTH-001 | Email/Password Sign-Up | Users register with email, password, first name, last name | Critical |
| FE-AUTH-002 | Email/Password Sign-In | Standard authentication with email and password | Critical |
| FE-AUTH-003 | Email Verification | Verify email via OTP code during registration | Critical |
| FE-AUTH-004 | Forgot Password | Self-service password reset via email verification code | Critical |
| FE-AUTH-005 | Sign Out | Local and global sign-out (invalidate all sessions) | Critical |
| FE-AUTH-006 | MFA - TOTP | Optional TOTP-based multi-factor authentication (authenticator app) | High |
| FE-AUTH-007 | MFA - SMS | Optional SMS-based multi-factor authentication | Medium |
| FE-AUTH-008 | Social Login - Google | Sign in with Google account | High |
| FE-AUTH-009 | Social Login - Facebook | Sign in with Facebook account | Medium |
| FE-AUTH-010 | Social Login - Apple | Sign in with Apple ID | Low |
| FE-AUTH-011 | Role-Based Access | Different UI/features based on Cognito group (ADMIN, TEACHER, STUDENT) | Critical |
| FE-AUTH-012 | Session Management | Auto-refresh tokens, persistent sessions, session timeout | Critical |
| FE-AUTH-013 | SSO to Moodle | Seamless SSO into Moodle LMS without re-authentication | Critical |
| FE-AUTH-014 | Protected Routes | Route guards that redirect unauthenticated users to login | Critical |
| FE-AUTH-015 | Custom Sign-In UI | Branded sign-in page (not Cognito Hosted UI) using Amplify SDK | High |

### 4.2 User Dashboard

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-DASH-001 | Student Dashboard | Overview of enrolled courses, progress, upcoming deadlines, recent activity | Critical |
| FE-DASH-002 | Teacher Dashboard | Course management, student progress, pending submissions, announcements | Critical |
| FE-DASH-003 | Admin Dashboard | System overview, user management, course statistics, infrastructure health | High |
| FE-DASH-004 | Course Cards | Visual course cards with progress indicators, thumbnails, and quick actions | High |
| FE-DASH-005 | Notification Center | In-app notifications for assignments, grades, messages, system alerts | High |
| FE-DASH-006 | Calendar Widget | Upcoming events, deadlines, and course schedule | Medium |
| FE-DASH-007 | Quick Actions | Shortcuts: "Go to Moodle", "View Grades", "Submit Assignment" | Medium |

### 4.3 Course Integration (via Moodle Web Services)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-COURSE-001 | Course Listing | Display available courses with categories, search, and filters | Critical |
| FE-COURSE-002 | Course Detail | Show course description, contents, activities, and enrollment status | Critical |
| FE-COURSE-003 | Self-Enrollment | Enroll in available courses from the portal | High |
| FE-COURSE-004 | Course Progress | Visual progress bars, completion status per activity | High |
| FE-COURSE-005 | Grade Overview | Display grades for enrolled courses (summary view) | High |
| FE-COURSE-006 | Course Search | Full-text search across courses with category filtering | Medium |
| FE-COURSE-007 | Deep Link to Moodle | Navigate directly to specific course/activity in Moodle with SSO | Critical |

### 4.4 User Profile

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-PROF-001 | View Profile | Display user profile with avatar, name, email, role, enrolled courses | High |
| FE-PROF-002 | Edit Profile | Update profile fields (synced to both Cognito and Moodle) | High |
| FE-PROF-003 | Change Password | Self-service password change via Cognito | High |
| FE-PROF-004 | MFA Settings | Enable/disable MFA, manage TOTP setup, backup codes | Medium |
| FE-PROF-005 | Language Preference | Switch between Thai and English | High |

### 4.5 User Management System

#### 4.5.1 User Management Overview

The User Management System is a comprehensive module for managing all platform users across three roles: **Learners (Students)**, **Teachers (Instructors)**, and **Admins**. It synchronizes user data between AWS Cognito (authentication) and Moodle (LMS operations).

#### 4.5.2 Student (Learner) Management

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-UM-001 | Student List View | Paginated, searchable table of all students with name, email, enrollment count, last login, status | Critical |
| FE-UM-002 | Student Profile View | Detailed profile: personal info, enrolled courses, progress, grades, badges, certificates, learning history | Critical |
| FE-UM-003 | Student Registration | Admin or self-registration with email verification; optional admin approval workflow | Critical |
| FE-UM-004 | Student Invitation | Send email invitations with pre-configured role and cohort; bulk invite via CSV | High |
| FE-UM-005 | Student Profile Edit | Update name, email, phone, avatar, language preference, notification settings (sync to Cognito + Moodle) | High |
| FE-UM-006 | Student Enrollment View | View all enrolled courses, enrollment date, progress %, completion status, grades per course | High |
| FE-UM-007 | Student Learning History | Transcript view: completed courses, grades achieved, certificates earned, total hours | High |
| FE-UM-008 | Student Badge Portfolio | Display all earned badges (Open Badges 2.0), issue dates, criteria met | Medium |
| FE-UM-009 | Student Certificate Viewer | View/download digital certificates; verify via unique URL | Medium |
| FE-UM-010 | Student Suspension | Admin suspends student: account disabled, data preserved, enrollments frozen | High |
| FE-UM-011 | Student Reactivation | Admin reactivates suspended student; restore full access | High |
| FE-UM-012 | Student Deletion | Admin deletes/archives student with data retention options (PDPA/GDPR compliance) | Medium |

**Student Profile Data Model:**

```
Student Profile
├── Personal Info
│   ├── First Name, Last Name (Cognito: given_name, family_name)
│   ├── Email (Cognito: email, verified)
│   ├── Phone (optional)
│   ├── Avatar / Profile Picture
│   ├── Language Preference (th / en)
│   ├── Timezone
│   └── Custom Fields (institution, department, student_id)
├── Academic Info
│   ├── Enrolled Courses [] (from Moodle)
│   ├── Completed Courses [] (from Moodle)
│   ├── Current GPA / Average Grade
│   ├── Total Learning Hours
│   ├── Certificates Earned []
│   └── Badges Earned []
├── Learning Plans
│   ├── Active Plans []
│   ├── Completed Plans []
│   └── Competencies Achieved []
└── Account Status
    ├── Status: active | suspended | archived
    ├── Created Date
    ├── Last Login Date
    └── Cognito Sub ID (unique identifier)
```

#### 4.5.3 Teacher (Instructor) Management

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-UM-020 | Teacher List View | Paginated table: name, email, courses managed, student count, last login, status | Critical |
| FE-UM-021 | Teacher Profile View | Professional profile: bio, qualifications, expertise areas, assigned courses, teaching statistics | Critical |
| FE-UM-022 | Teacher Creation | Admin creates teacher account; assign to TEACHERS Cognito group; sync to Moodle with editingteacher role | Critical |
| FE-UM-023 | Teacher Course Assignment | Assign/remove teacher from courses; roles: primary instructor, co-instructor, teaching assistant | High |
| FE-UM-024 | Teacher Student Analytics | Per-course: enrollment count, completion rate, average grade, at-risk students, submission status | High |
| FE-UM-025 | Teacher Content Permissions | Configure per-teacher: can create courses, can edit enrolled courses, can manage grades, can manage enrollments | High |
| FE-UM-026 | Teacher Performance Dashboard | My courses overview, total students, average completion rate, pending submissions count, recent activity | High |
| FE-UM-027 | Teacher Schedule | Office hours, availability calendar, upcoming deadlines across all managed courses | Medium |
| FE-UM-028 | Teacher Export Reports | Export student grades, completion data, engagement metrics as CSV/PDF per course | Medium |

**Teacher Dashboard Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  Teacher Dashboard                                          │
├──────────────┬──────────────┬───────────────┬───────────────┤
│  My Courses  │  Total       │  Avg.         │  Pending      │
│  [5]         │  Students    │  Completion   │  Submissions  │
│              │  [234]       │  [72%]        │  [18]         │
├──────────────┴──────────────┴───────────────┴───────────────┤
│                                                             │
│  ┌─── Course Cards ──────────────────────────────────────┐  │
│  │ [Course A]  85 students  78% complete  3 pending      │  │
│  │ [Course B]  42 students  65% complete  8 pending      │  │
│  │ [Course C]  107 students 81% complete  7 pending      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─── At-Risk Students ───┐  ┌─── Recent Submissions ───┐  │
│  │ Student X - 15% prog   │  │ Alice - Assignment 3     │  │
│  │ Student Y - No login   │  │ Bob - Quiz 2             │  │
│  │ Student Z - 2 overdue  │  │ Carol - Essay 1          │  │
│  └────────────────────────┘  └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### 4.5.4 Admin Management

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-UM-040 | Admin Dashboard | System overview: total users, active users (24h), courses, enrollments, storage usage, system health | Critical |
| FE-UM-041 | User Search & Filter | Search all users by name/email; filter by role, status, cohort, enrollment, last login range | Critical |
| FE-UM-042 | Single User Creation | Form: create user with email, name, password, role, cohort assignment | Critical |
| FE-UM-043 | Bulk User Import (CSV) | Upload CSV to create/update multiple users; template download; validation preview; error report | High |
| FE-UM-044 | Bulk User Export | Export user list to CSV/Excel with selected fields; filter by role, status, cohort, date range | High |
| FE-UM-045 | Role Assignment | Assign/remove Cognito groups (ADMINS, TEACHERS, STUDENTS); real-time sync to Moodle roles | Critical |
| FE-UM-046 | Cohort Management | Create, edit, delete cohorts; add/remove members; cohort-based auto-enrollment in courses | High |
| FE-UM-047 | Batch Enrollment | Enroll multiple users into one or more courses simultaneously; support CSV upload for bulk | High |
| FE-UM-048 | Batch Unenrollment | Remove multiple users from courses; confirm dialog with affected count | Medium |
| FE-UM-049 | User Approval Queue | Review pending registrations; approve, reject, or request more info; configurable auto-approval rules | High |
| FE-UM-050 | Audit Log Viewer | View login/logout events, role changes, enrollment changes, content modifications with date/user filters | High |
| FE-UM-051 | System Reports | User stats (registrations over time, active users), course stats (completion rates, enrollment trends), login patterns | High |
| FE-UM-052 | Notification Broadcast | Send announcements to all users, specific roles, or specific cohorts | Medium |
| FE-UM-053 | Data Retention Management | Configure retention periods; handle deletion requests (PDPA/GDPR); export user data on request | Medium |

**Admin Dashboard Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                            │
├──────────┬──────────┬───────────┬───────────┬───────────────┤
│  Total   │  Active  │  Total    │  Active   │  Pending      │
│  Users   │  Today   │  Courses  │  Enroll.  │  Approvals    │
│  [1,234] │  [342]   │  [56]     │  [3,891]  │  [7]          │
├──────────┴──────────┴───────────┴───────────┴───────────────┤
│                                                             │
│  ┌─── User Registration Trend (Chart) ────────────────────┐ │
│  │  📈 Line chart: new registrations per week             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─── Role Distribution ─┐  ┌─── Top Courses ────────────┐ │
│  │ 🟢 Students: 1,100    │  │ 1. Digital Literacy - 234  │ │
│  │ 🟡 Teachers: 120      │  │ 2. Thai Language - 189     │ │
│  │ 🔴 Admins: 14         │  │ 3. Data Science - 156      │ │
│  └────────────────────────┘  └────────────────────────────┘ │
│                                                             │
│  ┌─── Recent Activity ────────────────────────────────────┐ │
│  │ [Admin] changed role of user@email → TEACHER           │ │
│  │ [System] 15 new registrations today                    │ │
│  │ [Teacher] created new course "AI Fundamentals"         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 4.5.5 User Lifecycle Management

| Stage | Frontend Actions | Backend Sync |
|-------|-----------------|--------------|
| **Invitation** | Admin sends invite email with role/cohort pre-assignment | Cognito: create user (FORCE_CHANGE_PASSWORD) |
| **Registration** | User fills form → email verification → (optional) admin approval queue | Cognito: signUp → confirmSignUp; Lambda: create Moodle user |
| **Onboarding** | First login: complete profile, accept policies, take orientation tour | Cognito: update attributes; Moodle: update profile |
| **Active** | Full platform access per role | Cognito: session active; Moodle: user enabled |
| **Suspended** | Admin suspends: user sees "Account Suspended" on login | Cognito: adminDisableUser; Moodle: suspend user |
| **Reactivated** | Admin reactivates: full access restored | Cognito: adminEnableUser; Moodle: unsuspend user |
| **Archived** | Data retained per policy; user cannot login; record kept for compliance | Cognito: delete or disable; Moodle: delete/archive per policy |

#### 4.5.6 CSV Import/Export Schema

**User Import CSV Template:**

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `email` | Yes | User email address | john@example.com |
| `firstname` | Yes | First name | John |
| `lastname` | Yes | Last name | Doe |
| `role` | Yes | STUDENT, TEACHER, or ADMIN | STUDENT |
| `password` | No | Initial password (auto-generated if blank) | |
| `cohort` | No | Cohort name to assign | batch-2026 |
| `institution` | No | Institution name | Springfield University |
| `department` | No | Department name | Computer Science |
| `phone` | No | Phone number | +66812345678 |
| `language` | No | Preferred language (th/en) | th |

**User Export includes:** All import fields + `status`, `created_date`, `last_login`, `enrolled_courses_count`, `completed_courses_count`, `cognito_sub`.

### 4.6 Learning Plan & Learning Path Management

#### 4.6.1 Overview

The Learning Plan system provides structured, competency-based learning journeys for students. It integrates with Moodle's built-in competency framework (`core_competency_*` APIs) and the Learning Plans module (`tool_lp`).

#### 4.6.2 Competency Framework Management (Admin)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-LP-001 | Framework List | View all competency frameworks with name, description, competency count, linked courses | High |
| FE-LP-002 | Framework Creation | Create framework: name, description, proficiency scale (e.g., Not Competent → Beginner → Competent → Proficient → Expert) | High |
| FE-LP-003 | Competency Tree View | Hierarchical tree view of competencies within a framework; drag-and-drop reordering | High |
| FE-LP-004 | Competency CRUD | Create, edit, delete individual competencies; set parent (hierarchy), description, related competencies | High |
| FE-LP-005 | Proficiency Scale Config | Define custom proficiency scales per framework (e.g., 4-level, 5-level); set default proficiency level | Medium |
| FE-LP-006 | Course-Competency Mapping | Link competencies to courses and specific activities; configure completion rules | High |
| FE-LP-007 | Framework Duplication | Duplicate an entire framework for modification | Medium |

**Competency Framework Data Model:**

```
Competency Framework
├── Name: "Digital Literacy Framework"
├── Description: "Core digital skills for all learners"
├── Proficiency Scale: [Not Yet, Developing, Competent, Proficient, Expert]
│
├── Domain: Information Literacy
│   ├── Competency: Evaluate online sources
│   ├── Competency: Conduct effective searches
│   └── Competency: Organize digital information
│
├── Domain: Digital Communication
│   ├── Competency: Use email professionally
│   ├── Competency: Collaborate using online tools
│   └── Competency: Present information digitally
│
└── Domain: Data Security
    ├── Competency: Protect personal data
    ├── Competency: Recognize cyber threats
    └── Competency: Use secure passwords
```

#### 4.6.3 Learning Plan Template Management (Admin/Teacher)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-LP-010 | Template List | View all learning plan templates with name, competency count, assigned users/cohorts, status | High |
| FE-LP-011 | Template Creation | Create template: name, description, due date mode (fixed or relative to assignment), select competencies from frameworks | High |
| FE-LP-012 | Template Competency Selection | Add/remove competencies to template; reorder; set minimum proficiency required per competency | High |
| FE-LP-013 | Template Assignment (Individual) | Assign template to individual users; creates personal learning plan | High |
| FE-LP-014 | Template Assignment (Cohort) | Assign template to a cohort; auto-creates plans for all cohort members | High |
| FE-LP-015 | Template Duplication | Duplicate template for modification | Medium |
| FE-LP-016 | Template Versioning | Update template; option to propagate changes to existing plans | Medium |

**Learning Plan Template Structure:**

```
Learning Plan Template: "New Employee Onboarding"
├── Due: 90 days from assignment
├── Competencies Required:
│   ├── 1. Company Policies & Compliance    [Course: Orientation 101]
│   ├── 2. Digital Workplace Tools          [Course: Office Tools Training]
│   ├── 3. Communication Standards          [Course: Business Communication]
│   ├── 4. Data Security Awareness          [Course: Cybersecurity Basics]
│   └── 5. Role-Specific Skills             [Course: Department Training]
└── Completion: All competencies at "Competent" or above
```

#### 4.6.4 Personal Learning Plans (Student View)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-LP-020 | My Learning Plans | List of assigned plans: name, due date, overall progress %, status (draft/active/complete) | Critical |
| FE-LP-021 | Plan Detail View | Visual progress dashboard per plan: competency list with proficiency status, linked courses, milestones | Critical |
| FE-LP-022 | Competency Progress | Per-competency: current proficiency level, required level, linked courses/activities to improve, evidence | High |
| FE-LP-023 | Plan Timeline | Visual timeline showing plan start date, milestones, due date, current position | High |
| FE-LP-024 | Recommended Courses | Based on unmet competencies, suggest courses that can advance proficiency | Medium |
| FE-LP-025 | Evidence Submission | Upload evidence of prior learning for manual competency review by teacher | Medium |
| FE-LP-026 | Plan Completion Certificate | Auto-generated certificate when all competencies in plan meet required proficiency | Medium |

**Student Learning Plan View:**

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Learning Plan: New Employee Onboarding                  │
│  Status: Active | Due: 2026-05-15 | Progress: 60%          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░ 60%            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Competencies:                                              │
│  ✅ 1. Company Policies        ████████████ Proficient     │
│     └── Course: Orientation 101 (Completed)                 │
│                                                             │
│  ✅ 2. Digital Workplace Tools  ██████████░░ Competent      │
│     └── Course: Office Tools Training (Completed)           │
│                                                             │
│  🔄 3. Communication Standards  ██████░░░░░░ Developing     │
│     └── Course: Business Communication (In Progress - 45%)  │
│                                                             │
│  ⬜ 4. Data Security Awareness  ░░░░░░░░░░░░ Not Started    │
│     └── Course: Cybersecurity Basics (Not Enrolled)         │
│     └── [Enroll Now] button                                 │
│                                                             │
│  ⬜ 5. Role-Specific Skills     ░░░░░░░░░░░░ Not Started    │
│     └── Course: Department Training (Not Enrolled)          │
│     └── [Enroll Now] button                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Timeline:                                                  │
│  Feb ──●─────●─────●────────────────────○──── May           │
│     Start  Comp1  Comp2             Due Date                │
└─────────────────────────────────────────────────────────────┘
```

#### 4.6.5 Learning Plan Administration (Admin/Teacher View)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-LP-030 | Plans Overview | List all plans across users: filter by template, status, due date, user/cohort | High |
| FE-LP-031 | Plan Approval Workflow | Review plans in "Waiting for Review" status; approve → active, or reject → draft with feedback | High |
| FE-LP-032 | Competency Grading | Teachers grade individual competencies for students within a plan or course context | High |
| FE-LP-033 | Progress Monitoring | Team/cohort progress dashboard: % complete per plan template, at-risk learners (behind schedule) | High |
| FE-LP-034 | Plan Completion Report | Export: learner name, plan name, start date, completion date, time-to-completion, competency scores | Medium |
| FE-LP-035 | Bulk Plan Assignment | Assign a template to multiple users or entire cohort in one action | High |

**Plan Status Workflow:**

```
DRAFT ──→ WAITING FOR REVIEW ──→ IN REVIEW ──→ ACTIVE ──→ COMPLETE
  ↑               ↓                    ↓                      ↓
  └── (rejected) ─┘                    │                (REOPEN → ACTIVE)
                                       │
                                  (back to DRAFT)
```

### 4.7 Course Outline & Syllabus Management

#### 4.7.1 Overview

The Course Outline system provides a structured view of course content, syllabus, and learning objectives. It renders Moodle course structure (sections, activities, resources) in the custom frontend with enhanced UX.

#### 4.7.2 Course Catalog & Discovery

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-CO-001 | Course Catalog | Browse all published courses: card grid/list view with image, title, category, instructor, duration, difficulty | Critical |
| FE-CO-002 | Course Search | Full-text search across title, description, tags; auto-complete suggestions | High |
| FE-CO-003 | Category Navigation | Browse by category tree (e.g., Technology > Programming > Python) | High |
| FE-CO-004 | Filter & Sort | Filter: category, difficulty, language, duration, instructor, enrollment status; Sort: newest, popular, A-Z | High |
| FE-CO-005 | Course Metadata Display | Duration, difficulty (beginner/intermediate/advanced/expert), language, credits, prerequisites, max enrollment | High |
| FE-CO-006 | Featured Courses | Admin-curated featured/recommended courses section on catalog landing | Medium |

**Course Catalog Card:**

```
┌──────────────────────────────┐
│  [Course Image]              │
│                              │
│  ──────────────────────────  │
│  📚 Introduction to AI       │
│  Category: Technology > AI   │
│                              │
│  👨‍🏫 Dr. Somchai P.           │
│  ⏱️ 24 hours | 📊 Beginner   │
│  🌐 Thai | 🎓 3 Credits      │
│                              │
│  ⭐ 4.5/5  |  234 enrolled   │
│                              │
│  [View Details] [Enroll]     │
└──────────────────────────────┘
```

#### 4.7.3 Course Detail & Syllabus View

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-CO-010 | Course Overview Page | Hero section: title, image, description, instructor bio, key metadata, enrollment CTA | Critical |
| FE-CO-011 | Syllabus / Outline View | Expandable/collapsible section list showing all modules, activities, resources in order | Critical |
| FE-CO-012 | Section Learning Objectives | Each section/module displays its learning objectives at the top | High |
| FE-CO-013 | Activity Type Icons | Visual icons per activity type: quiz, assignment, forum, lesson, H5P, video, file, URL | High |
| FE-CO-014 | Completion Indicators | Per-activity: not started, in progress, completed checkmarks (for enrolled students) | High |
| FE-CO-015 | Prerequisite Display | Show prerequisite courses/activities with lock icons; "Complete X first" messaging | High |
| FE-CO-016 | Time Estimates | Estimated duration per section and per activity | Medium |
| FE-CO-017 | Course Progress Summary | Overall progress bar, completed activities count, remaining activities | High |
| FE-CO-018 | Deep Link to Moodle Activity | Click activity → SSO redirect to specific activity in Moodle | Critical |

**Course Outline View:**

```
┌─────────────────────────────────────────────────────────────┐
│  📚 Introduction to Artificial Intelligence                 │
│  👨‍🏫 Dr. Somchai Pramoj | ⏱️ 24 hours | 📊 Beginner         │
│  Progress: ━━━━━━━━━━━━━━━━░░░░░░░░ 65% (13/20 activities) │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ▼ Module 1: Introduction to AI Concepts (Week 1)          │
│    Learning Objectives:                                     │
│    • Explain what artificial intelligence is                │
│    • Identify types of AI (narrow, general, super)          │
│    ─────────────────────────────────────────────            │
│    ✅ 📄 Lecture: What is AI? (30 min)                      │
│    ✅ 🎬 Video: History of AI (15 min)                      │
│    ✅ ❓ Quiz: AI Fundamentals (10 questions, 20 min)       │
│    ✅ 📝 Assignment: AI in Daily Life Essay (2 hours)       │
│                                                             │
│  ▼ Module 2: Machine Learning Basics (Week 2)              │
│    Learning Objectives:                                     │
│    • Distinguish supervised vs unsupervised learning        │
│    • Apply basic ML concepts to real-world problems         │
│    ─────────────────────────────────────────────            │
│    ✅ 📄 Lecture: ML Overview (45 min)                      │
│    🔄 🎬 Interactive: ML Playground (H5P) (30 min)          │
│    ⬜ ❓ Quiz: ML Concepts (15 questions, 30 min)           │
│    ⬜ 📝 Assignment: Build a Simple Model (3 hours)         │
│                                                             │
│  ▶ Module 3: Neural Networks (Week 3)   🔒 Complete Module 2│
│    [Locked - Complete Module 2 first]                       │
│                                                             │
│  ▶ Module 4: AI Ethics & Society (Week 4)                  │
│  ▶ Module 5: Final Project (Week 5)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.7.4 Course Management (Teacher/Admin)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-CO-020 | Course Creation Wizard | Step-by-step: metadata → format (weekly/topics) → sections → competency mapping → publish | High |
| FE-CO-021 | Course Template Library | Select from pre-built templates; duplicate existing courses as template | High |
| FE-CO-022 | Course Metadata Editor | Edit: title, description, category, image, duration, difficulty, language, credits, tags, dates, max enrollment | High |
| FE-CO-023 | Section/Module Editor | Add, edit, reorder, delete sections; set section title, summary, learning objectives | High |
| FE-CO-024 | Activity Overview | View all activities per section with type, name, completion criteria, grade weight | High |
| FE-CO-025 | Prerequisite Chain Builder | Visual editor: set course-level and activity-level prerequisites with AND/OR logic | Medium |
| FE-CO-026 | Competency Alignment | Map competencies from frameworks to course and individual activities | Medium |
| FE-CO-027 | Draft/Published Toggle | Toggle course visibility: draft (hidden) or published (visible in catalog) | Critical |
| FE-CO-028 | Course Duplication | Duplicate course with options: include content only, include user data, include enrollments | Medium |
| FE-CO-029 | Enrollment Configuration | Set enrollment methods: self, manual, cohort, guest access; enrollment key; capacity limit | High |
| FE-CO-030 | Completion Criteria Config | Set course completion rules: all activities complete, specific activities, minimum grade, manual | High |

**Course Publication Workflow:**

```
DRAFT (Hidden)
  │  Teacher creates/edits content
  │
  ▼
IN REVIEW (optional)
  │  Curriculum reviewer approves content quality
  │
  ▼
PUBLISHED (Visible)
  │  Students can discover and enroll
  │
  ▼
ARCHIVED (Closed)
     No new enrollments; historical access only
```

#### 4.7.5 Course Analytics (Teacher/Admin)

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| FE-CO-040 | Enrollment Analytics | Chart: enrollments over time, enrollment sources, capacity utilization | High |
| FE-CO-041 | Completion Analytics | Chart: completion rate trend, average time-to-completion, drop-off points | High |
| FE-CO-042 | Activity Engagement | Per-activity: views, completions, average time, average grade | High |
| FE-CO-043 | Grade Distribution | Histogram: grade distribution per course and per activity | Medium |
| FE-CO-044 | Student Progress Table | Table: all enrolled students with % complete, last access, current grade, at-risk flag | High |
| FE-CO-045 | Export Analytics Report | Download PDF/CSV: course analytics summary for reporting | Medium |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| FE-NFR-001 | First Contentful Paint (FCP) | < 1.5 seconds | High |
| FE-NFR-002 | Largest Contentful Paint (LCP) | < 2.5 seconds | High |
| FE-NFR-003 | Time to Interactive (TTI) | < 3.0 seconds | High |
| FE-NFR-004 | Cumulative Layout Shift (CLS) | < 0.1 | Medium |
| FE-NFR-005 | Bundle Size (initial JS) | < 200 KB gzipped | High |
| FE-NFR-006 | API Response Time (BFF) | < 500ms for cached, < 2s for uncached | High |
| FE-NFR-007 | Amplify Auth SDK Tree-Shaking | Import only used auth APIs | High |

### 5.2 Responsive Design

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| FE-NFR-008 | Desktop | Full-featured layout (1280px+) | Critical |
| FE-NFR-009 | Tablet | Adapted layout (768px - 1279px) | High |
| FE-NFR-010 | Mobile | Mobile-optimized layout (< 768px) | High |
| FE-NFR-011 | Touch Support | Touch-friendly buttons, swipe gestures | Medium |

### 5.3 Accessibility

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| FE-NFR-012 | WCAG Compliance | Level AA | High |
| FE-NFR-013 | Keyboard Navigation | Full keyboard accessibility | High |
| FE-NFR-014 | Screen Reader Support | ARIA labels, semantic HTML | High |
| FE-NFR-015 | Color Contrast | Minimum 4.5:1 ratio | High |

### 5.4 Internationalization (i18n)

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| FE-NFR-016 | Thai Language | Full Thai (th) translation | Critical |
| FE-NFR-017 | English Language | Full English (en) translation | Critical |
| FE-NFR-018 | RTL Support | (Optional) Right-to-left layout support | Low |
| FE-NFR-019 | Date/Time Localization | Thai Buddhist calendar and date formats | High |

### 5.5 Security

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| FE-NFR-020 | XSS Prevention | Content Security Policy headers, input sanitization | Critical |
| FE-NFR-021 | CSRF Protection | SameSite cookies, CSRF tokens on state-changing requests | Critical |
| FE-NFR-022 | No Secrets in Client | Moodle WS tokens only in BFF (server-side), never in browser | Critical |
| FE-NFR-023 | HTTPS Only | All frontend endpoints served over HTTPS | Critical |
| FE-NFR-024 | Token Storage | Amplify manages tokens securely (no manual localStorage) | Critical |
| FE-NFR-025 | Session Timeout | Auto-logout after 30 minutes of inactivity | Medium |
| FE-NFR-026 | Rate Limiting | Rate limit on BFF API routes | Medium |

---

## 6. AWS Cognito Configuration

### 6.1 User Pool Configuration

```typescript
// Cognito User Pool Settings
{
  userPoolName: "ecv-lms-user-pool",

  // Sign-in options
  signInAliases: {
    email: true,
    username: false,
    phone: false,
  },

  // Self sign-up
  selfSignUpEnabled: true,

  // Auto-verification
  autoVerify: { email: true },

  // Password policy
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireDigits: true,
    requireSymbols: false,
    tempPasswordValidity: Duration.days(7),
  },

  // MFA
  mfa: MfaEnforcement.OPTIONAL,
  mfaSecondFactor: {
    sms: true,
    otp: true,   // TOTP
  },

  // Required attributes
  standardAttributes: {
    email: { required: true, mutable: true },
    givenName: { required: true, mutable: true },
    familyName: { required: true, mutable: true },
  },

  // Custom attributes
  customAttributes: {
    "moodle_role": new StringAttribute({ mutable: true }),
    "institution": new StringAttribute({ mutable: true }),
    "moodle_user_id": new NumberAttribute({ mutable: true }),
  },

  // Account recovery
  accountRecovery: AccountRecovery.EMAIL_ONLY,
}
```

### 6.2 User Groups (Role Mapping)

| Cognito Group | Moodle Role | Precedence | Description |
|---------------|-------------|------------|-------------|
| `ADMINS` | Manager / Site Admin | 0 | Full system access, user management |
| `TEACHERS` | Teacher (editingteacher) | 1 | Course management, grading, content authoring |
| `STUDENTS` | Student | 2 | Course enrollment, content access, assessments |

### 6.3 App Client Configuration

```typescript
// App Client for Frontend Portal
{
  appClientName: "ecv-lms-frontend",
  generateSecret: false,  // Public client (SPA)

  authFlows: {
    userSrp: true,           // Secure Remote Password (standard sign-in)
    custom: true,            // Custom auth flows
  },

  oAuth: {
    flows: {
      authorizationCodeGrant: true,
      implicitCodeGrant: false,
    },
    scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PROFILE],
    callbackUrls: [
      "http://localhost:3000/",          // Development
      "https://portal.ecv.co.th/",       // Production
    ],
    logoutUrls: [
      "http://localhost:3000/",
      "https://portal.ecv.co.th/",
    ],
  },

  // Token validity
  accessTokenValidity: Duration.hours(1),
  idTokenValidity: Duration.hours(1),
  refreshTokenValidity: Duration.days(30),
}

// App Client for Moodle Backend (server-side)
{
  appClientName: "ecv-lms-moodle-backend",
  generateSecret: true,  // Confidential client (server-side)

  oAuth: {
    flows: {
      authorizationCodeGrant: true,
    },
    scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PROFILE],
    callbackUrls: [
      "https://lms.ecv.co.th/admin/oauth2callback.php",
    ],
    logoutUrls: [
      "https://lms.ecv.co.th/login/logout.php",
    ],
  },
}
```

### 6.4 Cognito Domain

```
Custom domain: auth.ecv.co.th
  OR
Cognito domain: ecv-lms.auth.ap-southeast-1.amazoncognito.com
```

### 6.5 Lambda Triggers

| Trigger | Lambda Function | Purpose |
|---------|----------------|---------|
| **Post Confirmation** | `ecv-lms-post-confirmation` | Create user in Moodle via Web Services API on first sign-up |
| **Post Authentication** | `ecv-lms-post-auth` | Sync user profile updates to Moodle, log sign-in events |
| **Pre Token Generation** | `ecv-lms-pre-token` | Add custom claims (moodle_user_id, institution, permissions) |
| **Custom Message** | `ecv-lms-custom-message` | Branded email templates (Thai/English) for verification, password reset |

#### Post Confirmation Lambda (User Sync to Moodle)

```
Trigger: Post Confirmation
Flow:
  1. Extract user attributes (email, given_name, family_name) from event
  2. Call Moodle Web Service: core_user_create_users
  3. Store returned Moodle user ID as custom:moodle_user_id attribute
  4. Add user to default Cognito group (STUDENTS)
  5. Log event for audit trail
```

#### Pre Token Generation Lambda (Custom Claims)

```
Trigger: Pre Token Generation
Flow:
  1. Look up user's Moodle user ID from custom attributes
  2. Add custom claims to ID token:
     - custom:moodle_user_id
     - custom:institution
  3. Add custom claims to access token:
     - custom:permissions (based on Cognito groups)
```

---

## 7. Moodle Integration

### 7.1 Moodle OAuth2 Configuration (SSO)

Moodle must be configured as an OAuth2 Relying Party with Cognito as the IdP:

| Moodle Setting | Value |
|----------------|-------|
| OAuth2 Service Name | AWS Cognito |
| Client ID | `<moodle-backend-app-client-id>` |
| Client Secret | `<moodle-backend-app-client-secret>` |
| Authorization Endpoint | `https://<cognito-domain>/oauth2/authorize` |
| Token Endpoint | `https://<cognito-domain>/oauth2/token` |
| UserInfo Endpoint | `https://<cognito-domain>/oauth2/userInfo` |
| JWKS URI | `https://cognito-idp.<region>.amazonaws.com/<poolId>/.well-known/jwks.json` |
| Scopes | `openid profile email` |
| Redirect URI | `https://lms.ecv.co.th/admin/oauth2callback.php` |

#### User Field Mapping

| Moodle Field | Cognito Claim |
|-------------|---------------|
| `username` | `sub` (Cognito unique user ID) |
| `firstname` | `given_name` |
| `lastname` | `family_name` |
| `email` | `email` |

### 7.2 Moodle Web Services API Integration

The BFF layer communicates with Moodle using a pre-generated admin-level Web Services token.

#### Required Moodle Web Service Functions

| Category | Function | Frontend Use Case |
|----------|----------|-------------------|
| **User** | `core_user_get_users_by_field` | Fetch user profile by Cognito sub |
| **User** | `core_user_create_users` | Auto-create user from Cognito (Lambda trigger) |
| **User** | `core_user_update_users` | Sync profile updates from Cognito |
| **Courses** | `core_course_get_courses` | Course listing page |
| **Courses** | `core_course_get_courses_by_field` | Course search/detail |
| **Courses** | `core_course_get_categories` | Category-based navigation |
| **Courses** | `core_course_get_contents` | Course content for detail view |
| **Enrollment** | `core_enrol_get_users_courses` | Student dashboard (my courses) |
| **Enrollment** | `enrol_manual_enrol_users` | Self-enrollment from portal |
| **Enrollment** | `core_enrol_get_enrolled_users` | Teacher: view enrolled students |
| **Grades** | `gradereport_user_get_grade_items` | Grade overview for students |
| **Completion** | `core_completion_get_activities_completion_status` | Progress tracking |
| **Calendar** | `core_calendar_get_calendar_events` | Dashboard calendar widget |
| **Notification** | `core_message_get_messages` | Notification center |
| **Site Info** | `core_webservice_get_site_info` | System health check |

### 7.3 SSO Flow (Frontend to Moodle)

When a user clicks "Go to Course" or any link to Moodle from the frontend portal:

```
1. Frontend checks: user has valid Cognito session?
   - YES: Continue
   - NO: Redirect to sign-in

2. Frontend redirects user to:
   https://lms.ecv.co.th/auth/oauth2/login.php?id=<issuer_id>&sesskey=<sesskey>

3. Moodle redirects to Cognito authorization endpoint

4. Cognito detects existing session (user already authenticated in portal)
   → Returns authorization code immediately (no login prompt)

5. Moodle exchanges code for tokens server-side

6. Moodle creates/updates local user and establishes session

7. User lands in Moodle, fully authenticated
```

**Key**: Because the user already has an active Cognito session from the frontend portal, the SSO to Moodle is seamless (no re-login).

---

## 8. Frontend Project Structure

```
ecv-lms-frontend/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (Amplify config, providers)
│   ├── page.tsx                      # Landing page / redirect to dashboard
│   ├── (auth)/                       # Auth group (no auth required)
│   │   ├── login/
│   │   │   └── page.tsx              # Custom sign-in page
│   │   ├── register/
│   │   │   └── page.tsx              # Custom sign-up page
│   │   ├── verify/
│   │   │   └── page.tsx              # Email verification page
│   │   ├── forgot-password/
│   │   │   └── page.tsx              # Password reset page
│   │   └── layout.tsx                # Auth layout (redirect if already signed in)
│   ├── (protected)/                  # Protected group (auth required)
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Role-based dashboard
│   │   ├── courses/
│   │   │   ├── page.tsx              # Course listing
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Course detail
│   │   ├── grades/
│   │   │   └── page.tsx              # Grade overview
│   │   ├── calendar/
│   │   │   └── page.tsx              # Calendar view
│   │   ├── profile/
│   │   │   └── page.tsx              # User profile & settings
│   │   ├── admin/                    # Admin-only routes
│   │   │   ├── users/
│   │   │   │   └── page.tsx          # User management
│   │   │   ├── courses/
│   │   │   │   └── page.tsx          # Course management
│   │   │   └── reports/
│   │   │       └── page.tsx          # System reports
│   │   └── layout.tsx                # Protected layout (auth guard)
│   └── api/                          # BFF API Routes
│       ├── auth/
│       │   └── session/
│       │       └── route.ts          # Session validation endpoint
│       ├── moodle/
│       │   ├── courses/
│       │   │   └── route.ts          # Proxy: Moodle course APIs
│       │   ├── users/
│       │   │   └── route.ts          # Proxy: Moodle user APIs
│       │   ├── grades/
│       │   │   └── route.ts          # Proxy: Moodle grade APIs
│       │   ├── enrollments/
│       │   │   └── route.ts          # Proxy: Moodle enrollment APIs
│       │   └── calendar/
│       │       └── route.ts          # Proxy: Moodle calendar APIs
│       └── health/
│           └── route.ts              # Health check endpoint
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx             # Custom login form
│   │   ├── RegisterForm.tsx          # Custom registration form
│   │   ├── VerifyForm.tsx            # Email verification form
│   │   ├── ForgotPasswordForm.tsx    # Password reset form
│   │   ├── MFASetup.tsx              # MFA configuration UI
│   │   ├── SocialLoginButtons.tsx    # Google/Facebook/Apple buttons
│   │   └── AuthGuard.tsx             # Route protection wrapper
│   ├── dashboard/
│   │   ├── StudentDashboard.tsx      # Student-specific dashboard
│   │   ├── TeacherDashboard.tsx      # Teacher-specific dashboard
│   │   ├── AdminDashboard.tsx        # Admin-specific dashboard
│   │   ├── CourseCard.tsx            # Course card component
│   │   ├── ProgressBar.tsx           # Progress indicator
│   │   └── NotificationBell.tsx      # Notification dropdown
│   ├── layout/
│   │   ├── Navbar.tsx                # Top navigation bar
│   │   ├── Sidebar.tsx               # Side navigation (role-based)
│   │   ├── Footer.tsx                # Page footer
│   │   └── MoodleLink.tsx            # SSO link component to Moodle
│   └── ui/                           # Shared UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       ├── Skeleton.tsx
│       └── Toast.tsx
├── lib/
│   ├── amplify-config.ts             # Amplify configuration
│   ├── auth/
│   │   ├── cognito.ts                # Cognito helper functions
│   │   ├── session.ts                # Session management
│   │   └── roles.ts                  # Role/group utilities
│   ├── moodle/
│   │   ├── client.ts                 # Moodle Web Services REST client
│   │   ├── types.ts                  # Moodle API type definitions
│   │   └── endpoints.ts              # API endpoint constants
│   └── utils/
│       ├── date.ts                   # Date formatting (Thai calendar)
│       └── i18n.ts                   # Internationalization helpers
├── hooks/
│   ├── useAuth.ts                    # Auth state hook (Cognito)
│   ├── useCourses.ts                 # Course data hook
│   ├── useGrades.ts                  # Grade data hook
│   └── useRole.ts                    # Role/permission hook
├── contexts/
│   └── AuthContext.tsx               # Auth provider context
├── i18n/
│   ├── th.json                       # Thai translations
│   └── en.json                       # English translations
├── public/
│   ├── logo.svg                      # ECV logo
│   └── favicon.ico
├── amplify_outputs.json              # Amplify Gen 2 outputs (auto-generated)
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── .env.local                        # Environment variables (local dev)
```

---

## 9. Amplify SDK Integration Details

### 9.1 Amplify Configuration

```typescript
// lib/amplify-config.ts
import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        loginWith: {
          oauth: {
            domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN!],
            redirectSignOut: [process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT!],
            responseType: 'code',
          },
        },
      },
    },
  });
}
```

### 9.2 Key Auth Operations

```typescript
// Auth operations using Amplify v6 functional API

// Sign Up
import { signUp } from 'aws-amplify/auth';
const { isSignUpComplete, nextStep } = await signUp({
  username: email,
  password: password,
  options: {
    userAttributes: {
      email: email,
      given_name: firstName,
      family_name: lastName,
    },
  },
});

// Sign In
import { signIn } from 'aws-amplify/auth';
const { isSignedIn, nextStep } = await signIn({
  username: email,
  password: password,
});
// Handle nextStep: CONFIRM_SIGN_IN_WITH_TOTP_CODE, DONE, etc.

// Get Session (tokens)
import { fetchAuthSession } from 'aws-amplify/auth';
const session = await fetchAuthSession();
const idToken = session.tokens?.idToken;
const accessToken = session.tokens?.accessToken;
const groups = accessToken?.payload?.['cognito:groups'] as string[];

// Get Current User
import { getCurrentUser } from 'aws-amplify/auth';
const { username, userId } = await getCurrentUser();

// Sign Out
import { signOut } from 'aws-amplify/auth';
await signOut(); // or signOut({ global: true })

// Social Login
import { signInWithRedirect } from 'aws-amplify/auth';
await signInWithRedirect({ provider: 'Google' });
```

### 9.3 BFF JWT Validation

```typescript
// app/api/moodle/courses/route.ts (example)
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { NextRequest, NextResponse } from 'next/server';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  clientId: process.env.COGNITO_CLIENT_ID!,
  tokenUse: 'access',
});

export async function GET(request: NextRequest) {
  // 1. Extract token from Authorization header
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Verify Cognito JWT
  const payload = await verifier.verify(token);

  // 3. Call Moodle Web Services (using server-side WS token)
  const moodleResponse = await fetch(
    `${process.env.MOODLE_URL}/webservice/rest/server.php?` +
    `wstoken=${process.env.MOODLE_WS_TOKEN}&` +
    `wsfunction=core_enrol_get_users_courses&` +
    `moodlewsrestformat=json&` +
    `userid=${payload['custom:moodle_user_id']}`
  );

  const courses = await moodleResponse.json();

  // 4. Return to frontend
  return NextResponse.json(courses);
}
```

---

## 10. AWS CDK Infrastructure (Frontend-Specific)

### 10.1 Cognito Stack (Addition to Existing CDK Project)

The Cognito User Pool and related resources should be added as a new construct in the existing `moodle-cdk` project:

```
moodle-cdk/lib/constructs/
  ├── ... (existing constructs)
  └── cognito.ts              # NEW: Cognito User Pool, Groups, App Clients, Lambda Triggers
```

### 10.2 Cognito Construct Interface

```typescript
// lib/constructs/cognito.ts
export interface CognitoConstructProps {
  moodleDomainName: string;        // e.g., "lms.ecv.co.th"
  portalDomainName: string;        // e.g., "portal.ecv.co.th"
  cognitoDomainPrefix: string;     // e.g., "ecv-lms"
  moodleWebServiceUrl: string;     // For Lambda trigger to call Moodle
  moodleWebServiceToken: string;   // Moodle admin WS token (from Secrets Manager)
}

// Exports
export interface CognitoConstructOutputs {
  userPool: cognito.UserPool;
  frontendAppClient: cognito.UserPoolClient;
  moodleAppClient: cognito.UserPoolClient;
  identityPool?: cognito.CfnIdentityPool;
  userPoolDomain: string;
}
```

### 10.3 Frontend Hosting Stack

| Option | Service | Use Case |
|--------|---------|----------|
| Option A | S3 + CloudFront | Static export (`next export`) — simpler, cheaper |
| Option B | Amplify Hosting | Full Next.js SSR support — recommended for API routes |
| Option C | ECS Fargate | Run Next.js as container alongside Moodle — unified infra |

**Recommended: Option B (Amplify Hosting)** for production SSR support with API routes as BFF.

---

## 11. Environment Variables

### 11.1 Frontend (.env.local)

```bash
# Public (exposed to browser)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_DOMAIN=ecv-lms.auth.ap-southeast-1.amazoncognito.com
NEXT_PUBLIC_REDIRECT_SIGN_IN=https://portal.ecv.co.th/
NEXT_PUBLIC_REDIRECT_SIGN_OUT=https://portal.ecv.co.th/
NEXT_PUBLIC_MOODLE_URL=https://lms.ecv.co.th
NEXT_PUBLIC_API_BASE_URL=https://portal.ecv.co.th/api

# Server-only (BFF - never exposed to browser)
COGNITO_USER_POOL_ID=ap-southeast-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
MOODLE_URL=https://lms.ecv.co.th
MOODLE_WS_TOKEN=<admin-level-web-service-token>  # From Secrets Manager
```

---

## 12. Acceptance Criteria

### 12.1 Authentication Acceptance

- [ ] User can sign up with email/password and receives verification code
- [ ] User can sign in with verified email/password
- [ ] User can sign in with Google (social login)
- [ ] MFA (TOTP) can be enabled and used during sign-in
- [ ] Password reset flow works end-to-end
- [ ] Sign-out clears all session data
- [ ] Tokens auto-refresh without user action
- [ ] Protected routes redirect unauthenticated users to login

### 12.2 SSO Acceptance

- [ ] User authenticated in portal can navigate to Moodle without re-login
- [ ] New Cognito user is automatically created in Moodle (Lambda trigger)
- [ ] Cognito groups correctly map to Moodle roles
- [ ] Sign-out from portal also invalidates Moodle session

### 12.3 Dashboard Acceptance

- [ ] Student sees enrolled courses, progress, upcoming deadlines
- [ ] Teacher sees managed courses, pending submissions, student progress
- [ ] Admin sees user statistics, system overview, management tools
- [ ] Dashboard data loads within 2 seconds
- [ ] Dashboard is responsive on mobile, tablet, and desktop

### 12.4 Moodle Integration Acceptance

- [ ] BFF successfully proxies Moodle Web Service API calls
- [ ] Moodle WS token is never exposed to the browser
- [ ] Course listing displays accurate data from Moodle
- [ ] Grade overview matches Moodle gradebook
- [ ] Enrollment from portal creates enrollment in Moodle

### 12.5 Security Acceptance

- [ ] No Moodle credentials or tokens in browser DevTools
- [ ] JWT validation rejects tampered/expired tokens
- [ ] CSP headers prevent XSS attacks
- [ ] Role-based routes are enforced server-side (not just client-side)
- [ ] API routes return 401 for unauthenticated requests
- [ ] API routes return 403 for unauthorized role access

### 12.6 i18n Acceptance

- [ ] All UI text available in Thai and English
- [ ] Language can be switched without page reload
- [ ] Dates display in Thai Buddhist calendar format when Thai is selected

---

## 13. Implementation Phases

### Phase 1: Foundation (Week 1-2)

| Task | Description |
|------|-------------|
| Project scaffold | Next.js project with TypeScript, Tailwind, Amplify SDK |
| Cognito CDK construct | User Pool, Groups, App Clients in CDK |
| Auth UI | Custom login, register, verify, forgot-password pages |
| Auth guard | Protected route middleware |
| BFF skeleton | API route structure with JWT validation |

### Phase 2: Dashboard & Integration (Week 3-4)

| Task | Description |
|------|-------------|
| Moodle Web Services client | REST client in BFF for Moodle API |
| Student dashboard | Course cards, progress, calendar widget |
| Course listing | Browse and search courses |
| Grade overview | Display grades from Moodle |
| SSO flow | Seamless redirect to Moodle with Cognito session |

### Phase 3: Advanced Features (Week 5-6)

| Task | Description |
|------|-------------|
| Teacher dashboard | Course management, student progress views |
| Admin dashboard | User management, system reports |
| Social login | Google OAuth integration |
| MFA | TOTP setup and sign-in flow |
| Lambda triggers | Post-confirmation (Moodle user sync), pre-token generation |

### Phase 4: Polish & Production (Week 7-8)

| Task | Description |
|------|-------------|
| i18n | Thai + English translations |
| Responsive design | Mobile and tablet optimization |
| Accessibility | WCAG AA compliance audit |
| Performance | Bundle optimization, caching strategy |
| Testing | Unit tests, integration tests, E2E tests |
| Deployment | Amplify Hosting or S3+CloudFront setup |

---

## 14. Glossary

| Term | Definition |
|------|-----------|
| **BFF** | Backend-for-Frontend — a server-side layer that mediates between the frontend and backend APIs |
| **Cognito User Pool** | AWS managed user directory for authentication |
| **Cognito Identity Pool** | Provides temporary AWS credentials for authenticated users |
| **Amplify SDK v6** | AWS JavaScript library for frontend integration with Cognito and other AWS services |
| **OIDC** | OpenID Connect — authentication protocol built on OAuth 2.0 |
| **SSO** | Single Sign-On — authenticate once, access multiple applications |
| **JWT** | JSON Web Token — signed token containing user claims |
| **PKCE** | Proof Key for Code Exchange — security extension for OAuth 2.0 public clients |
| **MFA** | Multi-Factor Authentication |
| **TOTP** | Time-based One-Time Password (authenticator app) |
| **WS Token** | Moodle Web Services Token for REST API access |
| **MUC** | Moodle Universal Cache |
| **H5P** | HTML5 Package — interactive content framework |

---

## 15. References

1. [AWS Amplify v6 Documentation](https://docs.amplify.aws)
2. [AWS Amplify Auth - Set up](https://docs.amplify.aws/react/build-a-backend/auth/set-up-auth/)
3. [AWS Amplify Auth - Sign-in](https://docs.amplify.aws/react/build-a-backend/auth/connect-your-frontend/sign-in/)
4. [AWS Amplify Auth - User Groups](https://docs.amplify.aws/react/build-a-backend/auth/concepts/user-groups/)
5. [AWS Amplify Auth - Use existing Cognito](https://docs.amplify.aws/react/build-a-backend/auth/use-existing-cognito-resources/)
6. [AWS Cognito User Pools Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html)
7. [AWS Cognito Lambda Triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-working-with-lambda-triggers.html)
8. [Moodle OAuth 2 Services](https://docs.moodle.org/501/en/OAuth_2_services)
9. [Moodle Web Services API](https://docs.moodle.org/dev/Web_service_API_functions)
10. [Moodle External Services](https://docs.moodle.org/501/en/Using_web_services)
11. [moodle-auth_userkey Plugin](https://github.com/catalyst/moodle-auth_userkey)
12. [moodle-webservice_restful Plugin](https://github.com/catalyst/moodle-webservice_restful)
13. [aws-jwt-verify Library](https://github.com/awslabs/aws-jwt-verify)
14. [Next.js App Router Documentation](https://nextjs.org/docs/app)
15. REQUIREMENT_SPEC.md (Infrastructure SRS)
16. .kiro/specs/moodle-aws-deployment/ (Backend Infrastructure Spec)
