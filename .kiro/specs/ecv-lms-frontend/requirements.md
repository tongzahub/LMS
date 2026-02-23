# Requirements Document

## Introduction

This document defines the requirements for the ECV Learning Solutions custom frontend portal — a Next.js 15 application that integrates with a Moodle LMS backend via AWS Cognito authentication and Moodle Web Services REST API. The portal provides a modern, branded user experience with role-based dashboards, course catalog, learning plan management, and comprehensive user administration. All Moodle API communication flows through a Backend-for-Frontend (BFF) layer implemented as Next.js API Routes.

Reference: [FrontendRequirement.md](../../FrontendRequirement.md)

## Glossary

- **Portal**: The custom Next.js 15 frontend application serving as the branded entry point for all users
- **BFF**: Backend-for-Frontend — Next.js API Route Handlers that validate Cognito JWTs and proxy requests to Moodle Web Services
- **Cognito_User_Pool**: AWS Cognito User Pool providing authentication, MFA, user groups, and social login
- **Moodle_Client**: Server-side REST client within the BFF that communicates with Moodle Web Services using an admin-level WS token
- **Auth_Guard**: Route protection middleware that redirects unauthenticated users to the login page
- **Role_Resolver**: Utility that extracts user roles from Cognito group claims (ADMINS, TEACHERS, STUDENTS) in JWT tokens
- **CSV_Processor**: Module that parses, validates, and processes CSV files for bulk user import/export operations
- **Course_Catalog**: The browsable, searchable listing of all published Moodle courses rendered in the Portal
- **Course_Outline_Renderer**: Component that transforms Moodle course contents (sections, activities, resources) into an expandable syllabus view
- **Competency_Framework**: Hierarchical structure defining skills and proficiency levels for a domain, managed via Moodle core_competency APIs
- **Learning_Plan**: Personalized roadmap of competencies a learner should achieve within a timeframe, managed via Moodle tool_lp APIs
- **Plan_Template**: Reusable learning plan blueprint that can be assigned to individual users or cohorts
- **SSO_Redirect**: The seamless single sign-on flow from the Portal to Moodle LMS using OAuth2/OIDC with an existing Cognito session
- **Notification_Center**: In-app notification component displaying messages, assignment alerts, grade updates, and system announcements
- **Audit_Log**: Record of user actions including login/logout events, role changes, enrollment changes, and content modifications
- **Cohort**: Named group of users for bulk operations such as enrollment and plan assignment
- **Proficiency_Scale**: Ordered levels of mastery (e.g., Not Yet → Developing → Competent → Proficient → Expert)

## Requirements

### Requirement 1: Email/Password Authentication

**User Story:** As a user, I want to sign up and sign in with my email and password, so that I can access the LMS portal securely.

#### Acceptance Criteria

1. WHEN a user submits the registration form with email, password, first name, and last name, THE Portal SHALL create a new account in the Cognito_User_Pool and send an email verification OTP code
2. WHEN a user submits a valid OTP verification code, THE Portal SHALL confirm the account and allow the user to sign in
3. WHEN a user submits valid email and password credentials, THE Portal SHALL authenticate the user via the Cognito_User_Pool and establish a session with ID, access, and refresh tokens
4. WHEN a user submits invalid credentials, THE Portal SHALL display a descriptive error message without revealing whether the email exists
5. WHEN a user requests a password reset, THE Portal SHALL send a verification code to the registered email and allow the user to set a new password
6. WHEN a user signs out, THE Portal SHALL clear all local session data and invalidate tokens

### Requirement 2: Social Login & MFA

**User Story:** As a user, I want to sign in with my social accounts and optionally enable multi-factor authentication, so that I have flexible and secure authentication options.

#### Acceptance Criteria

1. WHEN a user clicks a social login button (Google, Facebook, or Apple), THE Portal SHALL redirect to the corresponding OAuth2 provider via the Cognito_User_Pool and complete authentication upon callback
2. WHEN a user enables TOTP-based MFA in profile settings, THE Portal SHALL generate a QR code for authenticator app setup and require TOTP codes on subsequent sign-ins
3. WHEN a user enables SMS-based MFA, THE Portal SHALL send verification codes to the registered phone number during sign-in
4. WHEN MFA is required during sign-in, THE Portal SHALL prompt for the MFA code before granting access

### Requirement 3: Session Management & Protected Routes

**User Story:** As a user, I want my session to persist and refresh automatically, so that I can use the portal without frequent re-authentication.

#### Acceptance Criteria

1. WHILE a user has a valid session, THE Portal SHALL automatically refresh tokens before expiration using the refresh token
2. WHEN a session has been inactive for 30 minutes, THE Portal SHALL sign the user out and redirect to the login page
3. WHEN an unauthenticated user attempts to access a protected route, THE Auth_Guard SHALL redirect the user to the login page and preserve the intended destination URL
4. WHEN an authenticated user attempts to access a route restricted to a different role, THE Auth_Guard SHALL display an access denied message or redirect to the user's dashboard

### Requirement 4: Role-Based Access Control

**User Story:** As a platform administrator, I want users to see different features based on their role, so that each user type has an appropriate experience.

#### Acceptance Criteria

1. WHEN a user authenticates, THE Role_Resolver SHALL extract the user's role from the Cognito access token `cognito:groups` claim and map it to one of ADMIN, TEACHER, or STUDENT
2. WHILE a user has the STUDENT role, THE Portal SHALL display the student dashboard, enrolled courses, grades, learning plans, and profile pages
3. WHILE a user has the TEACHER role, THE Portal SHALL display the teacher dashboard, managed courses, student progress, grading tools, and plan management pages in addition to student-level features
4. WHILE a user has the ADMIN role, THE Portal SHALL display the admin dashboard, user management, cohort management, system reports, audit logs, competency framework management, and all teacher-level and student-level features
5. THE BFF SHALL enforce role-based access on all API routes by validating the Cognito JWT group claims server-side, returning 403 for unauthorized role access

### Requirement 5: SSO to Moodle

**User Story:** As a user, I want to navigate from the portal to Moodle without re-authenticating, so that I have a seamless experience across both systems.

#### Acceptance Criteria

1. WHEN an authenticated user clicks a deep link to a Moodle course or activity, THE Portal SHALL redirect to the Moodle OAuth2 login endpoint, and the Cognito_User_Pool SHALL issue an authorization code without prompting for credentials
2. WHEN a new user completes registration in the Portal, THE Cognito_User_Pool post-confirmation Lambda trigger SHALL create a corresponding user in Moodle via the `core_user_create_users` Web Service and store the Moodle user ID as a custom Cognito attribute
3. WHEN a user signs out from the Portal, THE Portal SHALL also invalidate the Moodle session


### Requirement 6: BFF API Layer

**User Story:** As a developer, I want all Moodle API communication to flow through a secure server-side BFF layer, so that Moodle credentials are never exposed to the browser.

#### Acceptance Criteria

1. THE BFF SHALL validate the Cognito JWT access token on every incoming API request using the `aws-jwt-verify` library, returning 401 for missing or invalid tokens
2. THE BFF SHALL store the Moodle Web Services token exclusively on the server side and include it only in server-to-Moodle requests
3. WHEN the BFF receives a valid authenticated request, THE Moodle_Client SHALL proxy the request to the appropriate Moodle Web Service function and return the response to the frontend
4. IF the Moodle Web Service returns an error, THEN THE BFF SHALL return a structured error response with an appropriate HTTP status code and a user-friendly error message
5. THE BFF SHALL set Content Security Policy, CSRF protection, and HTTPS-only headers on all responses

### Requirement 7: Student Dashboard

**User Story:** As a student, I want to see an overview of my courses, progress, and upcoming deadlines, so that I can stay on track with my learning.

#### Acceptance Criteria

1. WHEN a student navigates to the dashboard, THE Portal SHALL display course cards for all enrolled courses showing course name, thumbnail, progress percentage, and last accessed date
2. WHEN a student views the dashboard, THE Portal SHALL display upcoming deadlines from the Moodle calendar sorted by due date
3. WHEN a student views the dashboard, THE Portal SHALL display a summary of active learning plans with overall progress percentage
4. WHEN a student views the dashboard, THE Notification_Center SHALL display recent notifications for assignments, grades, and messages

### Requirement 8: Teacher Dashboard

**User Story:** As a teacher, I want to see an overview of my managed courses and student performance, so that I can identify students who need attention.

#### Acceptance Criteria

1. WHEN a teacher navigates to the dashboard, THE Portal SHALL display course cards for all managed courses showing student count, average completion rate, and pending submission count
2. WHEN a teacher views the dashboard, THE Portal SHALL display a list of at-risk students (low progress, overdue assignments, or no recent login) across all managed courses
3. WHEN a teacher views the dashboard, THE Portal SHALL display recent submission activity across all managed courses

### Requirement 9: Admin Dashboard

**User Story:** As an administrator, I want a system overview with key metrics, so that I can monitor platform health and user activity.

#### Acceptance Criteria

1. WHEN an admin navigates to the dashboard, THE Portal SHALL display summary statistics including total users, active users today, total courses, active enrollments, and pending approval count
2. WHEN an admin views the dashboard, THE Portal SHALL display a user registration trend chart and role distribution breakdown
3. WHEN an admin views the dashboard, THE Portal SHALL display recent system activity (role changes, new registrations, course creations)

### Requirement 10: Course Catalog & Discovery

**User Story:** As a user, I want to browse and search available courses, so that I can find and enroll in courses relevant to my learning goals.

#### Acceptance Criteria

1. WHEN a user navigates to the course catalog, THE Course_Catalog SHALL display all published courses as cards showing course image, title, category, instructor name, duration, difficulty level, and enrollment count
2. WHEN a user enters a search query, THE Course_Catalog SHALL return courses matching the query across title, description, and tags
3. WHEN a user selects a category from the navigation tree, THE Course_Catalog SHALL filter courses to show only those in the selected category and its subcategories
4. WHEN a user applies filters (difficulty, language, duration, enrollment status), THE Course_Catalog SHALL update the displayed courses to match all active filter criteria
5. WHEN a user sorts the catalog (newest, popular, alphabetical), THE Course_Catalog SHALL reorder the displayed courses accordingly

### Requirement 11: Course Detail & Syllabus

**User Story:** As a user, I want to view a course's full outline with sections, activities, and progress indicators, so that I can understand the course structure and track my completion.

#### Acceptance Criteria

1. WHEN a user navigates to a course detail page, THE Portal SHALL display the course hero section with title, image, description, instructor information, and key metadata (duration, difficulty, language, credits, prerequisites)
2. WHEN a user views the course outline, THE Course_Outline_Renderer SHALL display an expandable/collapsible list of sections with each section's learning objectives, activities, and resources
3. WHEN displaying activities, THE Course_Outline_Renderer SHALL render an appropriate icon for each activity type (quiz, assignment, forum, lesson, H5P, video, file, URL)
4. WHILE a student is enrolled in the course, THE Course_Outline_Renderer SHALL display completion indicators (not started, in progress, completed) for each activity
5. WHEN a course section has prerequisites, THE Course_Outline_Renderer SHALL display a lock icon and "Complete [prerequisite] first" message for locked sections
6. WHEN an enrolled student clicks an activity in the outline, THE Portal SHALL redirect to the corresponding Moodle activity via SSO_Redirect
7. WHEN a user views the course detail, THE Portal SHALL display an overall progress bar showing completed activities count versus total activities

### Requirement 12: Course Enrollment

**User Story:** As a student, I want to enroll in courses from the portal, so that I can start learning without navigating to Moodle directly.

#### Acceptance Criteria

1. WHEN a student clicks the enroll button on a course detail page, THE BFF SHALL call the Moodle `enrol_self_enrol_user` Web Service and confirm enrollment to the user
2. IF enrollment fails due to capacity limits or enrollment key requirements, THEN THE Portal SHALL display a descriptive error message explaining the reason
3. WHEN a student views the grade overview page, THE Portal SHALL display grades for all enrolled courses retrieved from the Moodle gradebook API


### Requirement 13: Student Management

**User Story:** As an administrator, I want to manage student accounts including creation, profile viewing, suspension, and reactivation, so that I can maintain the student user base.

#### Acceptance Criteria

1. WHEN an admin navigates to the student list, THE Portal SHALL display a paginated, searchable table of all students with name, email, enrollment count, last login date, and account status
2. WHEN an admin searches or filters the student list by name, email, role, status, or cohort, THE Portal SHALL update the table to show only matching results
3. WHEN an admin views a student profile, THE Portal SHALL display personal information, enrolled courses with progress, grades, badges, certificates, and learning history retrieved from Moodle
4. WHEN an admin suspends a student account, THE Portal SHALL disable the account in the Cognito_User_Pool and suspend the corresponding Moodle user, preserving all data and freezing enrollments
5. WHEN an admin reactivates a suspended student, THE Portal SHALL re-enable the account in the Cognito_User_Pool and unsuspend the Moodle user, restoring full access
6. WHEN an admin deletes or archives a student, THE Portal SHALL handle data retention according to PDPA/GDPR compliance requirements and provide export-before-delete options

### Requirement 14: Teacher Management

**User Story:** As an administrator, I want to manage teacher accounts and course assignments, so that instructors have appropriate access and course responsibilities.

#### Acceptance Criteria

1. WHEN an admin creates a teacher account, THE Portal SHALL create the user in the Cognito_User_Pool, assign the TEACHERS group, and create a corresponding Moodle user with the editingteacher role
2. WHEN an admin views the teacher list, THE Portal SHALL display a paginated table with name, email, managed course count, total student count, last login, and status
3. WHEN an admin assigns a teacher to a course, THE Portal SHALL enroll the teacher in the Moodle course with the specified role (primary instructor, co-instructor, or teaching assistant)
4. WHEN a teacher views their performance dashboard, THE Portal SHALL display managed courses overview, total students, average completion rate, and pending submission count

### Requirement 15: Bulk User Operations

**User Story:** As an administrator, I want to import and export users in bulk via CSV, so that I can efficiently manage large numbers of users.

#### Acceptance Criteria

1. WHEN an admin uploads a CSV file for user import, THE CSV_Processor SHALL validate the file against the required schema (email, firstname, lastname, role as required fields; password, cohort, institution, department, phone, language as optional fields)
2. WHEN the CSV_Processor validates the import file, THE Portal SHALL display a preview of valid rows and a detailed error report for invalid rows before committing the import
3. WHEN an admin confirms the CSV import, THE Portal SHALL create users in the Cognito_User_Pool and Moodle, assign roles and cohorts, and display a summary of successful and failed operations
4. WHEN an admin requests a user export, THE Portal SHALL generate a CSV file with selected fields filtered by role, status, cohort, and date range
5. WHEN an admin performs batch enrollment, THE Portal SHALL enroll multiple users into one or more courses simultaneously, supporting both manual selection and CSV upload

### Requirement 16: Cohort & Role Management

**User Story:** As an administrator, I want to manage cohorts and assign roles, so that I can organize users into groups and control their access levels.

#### Acceptance Criteria

1. WHEN an admin creates a cohort, THE Portal SHALL create the cohort in Moodle and allow adding or removing members
2. WHEN an admin assigns a Cognito group to a user, THE Role_Resolver SHALL sync the corresponding Moodle role in real-time
3. WHEN an admin views the approval queue, THE Portal SHALL display pending user registrations with options to approve, reject, or request additional information

### Requirement 17: Audit Logging & System Reports

**User Story:** As an administrator, I want to view audit logs and system reports, so that I can monitor platform activity and generate compliance reports.

#### Acceptance Criteria

1. WHEN an admin views the audit log, THE Portal SHALL display login/logout events, role changes, enrollment changes, and content modifications with date, user, and action filters
2. WHEN an admin views system reports, THE Portal SHALL display user registration trends, active user counts, course completion rates, and enrollment trends as charts and tables
3. WHEN an admin requests a report export, THE Portal SHALL generate the report as CSV or PDF with the applied filters

### Requirement 18: Competency Framework Management

**User Story:** As an administrator, I want to create and manage competency frameworks with proficiency scales, so that I can define the skills and knowledge standards for the organization.

#### Acceptance Criteria

1. WHEN an admin views the competency framework list, THE Portal SHALL display all frameworks with name, description, competency count, and linked course count retrieved from Moodle `core_competency` APIs
2. WHEN an admin creates a competency framework, THE Portal SHALL create the framework in Moodle with a name, description, and configurable proficiency scale
3. WHEN an admin views a framework, THE Portal SHALL display competencies in a hierarchical tree view with parent-child relationships
4. WHEN an admin creates, edits, or deletes a competency within a framework, THE Portal SHALL sync the change to Moodle via the `core_competency` APIs
5. WHEN an admin maps a competency to a course or activity, THE Portal SHALL create the mapping in Moodle via `core_competency_add_competency_to_course`

### Requirement 19: Learning Plan Template Management

**User Story:** As an administrator or teacher, I want to create and manage learning plan templates, so that I can define reusable learning journeys for students.

#### Acceptance Criteria

1. WHEN an admin views the template list, THE Portal SHALL display all learning plan templates with name, competency count, assigned user/cohort count, and status
2. WHEN an admin creates a template, THE Portal SHALL create it in Moodle with a name, description, due date mode (fixed or relative), and selected competencies from available frameworks
3. WHEN an admin assigns a template to an individual user, THE Portal SHALL create a personal learning plan in Moodle for that user
4. WHEN an admin assigns a template to a cohort, THE Portal SHALL create personal learning plans in Moodle for all cohort members

### Requirement 20: Personal Learning Plans (Student View)

**User Story:** As a student, I want to view my assigned learning plans with competency progress, so that I can track my development and know what courses to take next.

#### Acceptance Criteria

1. WHEN a student navigates to the learning plans page, THE Portal SHALL display all assigned plans with name, due date, overall progress percentage, and status (draft, active, complete)
2. WHEN a student views a plan detail, THE Portal SHALL display each competency with current proficiency level, required proficiency level, linked courses, and a visual progress bar
3. WHEN a student views a plan with unmet competencies, THE Portal SHALL display recommended courses that can advance proficiency for those competencies
4. WHEN a student views a plan, THE Portal SHALL display a visual timeline showing plan start date, milestones, and due date

### Requirement 21: Learning Plan Administration

**User Story:** As an administrator or teacher, I want to approve, grade, and monitor learning plans, so that I can manage student development effectively.

#### Acceptance Criteria

1. WHEN an admin or teacher views the plan approval queue, THE Portal SHALL display plans in "Waiting for Review" status with options to approve (transition to active) or reject (transition to draft with feedback)
2. WHEN a teacher grades a competency within a plan, THE Portal SHALL update the proficiency level in Moodle via `core_competency_grade_competency_in_plan`
3. WHEN an admin views the progress monitoring dashboard, THE Portal SHALL display cohort/team progress per plan template including percentage complete and at-risk learners (behind schedule)
4. WHEN an admin requests a plan completion report, THE Portal SHALL export learner name, plan name, start date, completion date, time-to-completion, and competency scores


### Requirement 22: Course Management (Teacher/Admin)

**User Story:** As a teacher or administrator, I want to create, edit, and manage courses from the portal, so that I can maintain the course catalog without using the Moodle admin interface directly.

#### Acceptance Criteria

1. WHEN a teacher or admin uses the course creation wizard, THE Portal SHALL guide them through metadata entry, format selection (weekly/topics), section creation, competency mapping, and publication via Moodle `core_course_create_courses` API
2. WHEN a teacher or admin edits course metadata, THE Portal SHALL update the course in Moodle via `core_course_update_courses` with title, description, category, image, duration, difficulty, language, credits, tags, dates, and max enrollment
3. WHEN a teacher or admin toggles course visibility, THE Portal SHALL update the course visibility in Moodle (draft/hidden or published/visible)
4. WHEN a teacher or admin configures enrollment settings, THE Portal SHALL update enrollment methods in Moodle including self-enrollment, manual enrollment, cohort enrollment, guest access, enrollment key, and capacity limit
5. WHEN a teacher or admin configures completion criteria, THE Portal SHALL update course completion rules in Moodle (all activities complete, specific activities, minimum grade, or manual completion)

### Requirement 23: Course Analytics

**User Story:** As a teacher or administrator, I want to view course analytics, so that I can understand enrollment trends, student engagement, and learning outcomes.

#### Acceptance Criteria

1. WHEN a teacher or admin views course analytics, THE Portal SHALL display enrollment trends over time, completion rate trends, and average time-to-completion charts
2. WHEN a teacher or admin views activity engagement data, THE Portal SHALL display per-activity views, completions, average time spent, and average grade
3. WHEN a teacher or admin views the student progress table, THE Portal SHALL display all enrolled students with percentage complete, last access date, current grade, and at-risk flag
4. WHEN a teacher or admin exports analytics, THE Portal SHALL generate a PDF or CSV report with the displayed analytics data

### Requirement 24: User Profile Management

**User Story:** As a user, I want to view and edit my profile, change my password, and manage my MFA settings, so that I can keep my account information current and secure.

#### Acceptance Criteria

1. WHEN a user views their profile page, THE Portal SHALL display avatar, name, email, role, enrolled courses, and account status
2. WHEN a user edits their profile, THE Portal SHALL update the attributes in both the Cognito_User_Pool and Moodle user record
3. WHEN a user changes their password, THE Portal SHALL update the password in the Cognito_User_Pool
4. WHEN a user changes their language preference, THE Portal SHALL switch the UI language between Thai and English without requiring a page reload

### Requirement 25: Internationalization

**User Story:** As a user, I want the portal to be available in Thai and English with proper date formatting, so that I can use the platform in my preferred language.

#### Acceptance Criteria

1. THE Portal SHALL provide all UI text in both Thai (th) and English (en) translations
2. WHEN the Thai language is selected, THE Portal SHALL display dates in Thai Buddhist calendar format (พ.ศ.)
3. WHEN a user switches language, THE Portal SHALL update all visible text without requiring a full page reload

### Requirement 26: Responsive Design & Accessibility

**User Story:** As a user, I want the portal to work well on all devices and be accessible, so that I can use it regardless of my device or abilities.

#### Acceptance Criteria

1. THE Portal SHALL provide a full-featured layout for desktop (1280px+), an adapted layout for tablet (768px–1279px), and a mobile-optimized layout for screens below 768px
2. THE Portal SHALL support full keyboard navigation for all interactive elements
3. THE Portal SHALL include ARIA labels and semantic HTML for screen reader compatibility
4. THE Portal SHALL maintain a minimum color contrast ratio of 4.5:1 for all text

### Requirement 27: Performance

**User Story:** As a user, I want the portal to load quickly and respond promptly, so that I have a smooth experience.

#### Acceptance Criteria

1. THE Portal SHALL achieve a First Contentful Paint (FCP) of less than 1.5 seconds
2. THE Portal SHALL achieve a Largest Contentful Paint (LCP) of less than 2.5 seconds
3. THE Portal SHALL achieve a Time to Interactive (TTI) of less than 3.0 seconds
4. THE Portal SHALL keep the initial JavaScript bundle size below 200 KB gzipped
5. THE BFF SHALL return cached API responses within 500 milliseconds and uncached responses within 2 seconds

### Requirement 28: Custom Branded Sign-In UI

**User Story:** As a product owner, I want a custom branded sign-in experience instead of the Cognito Hosted UI, so that the portal reflects the ECV Learning Solutions brand identity.

#### Acceptance Criteria

1. THE Portal SHALL render custom-designed login, registration, email verification, and password reset pages using the Amplify SDK v6 functional API (not the Cognito Hosted UI)
2. WHEN displaying auth pages, THE Portal SHALL show the ECV Learning Solutions branding including logo, colors, and typography consistent with the portal design system
3. WHEN displaying social login options, THE Portal SHALL render branded buttons for Google, Facebook, and Apple sign-in that trigger `signInWithRedirect` via the Amplify SDK
