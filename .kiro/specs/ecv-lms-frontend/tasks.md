# Implementation Plan: ECV LMS Frontend Portal

## Overview

This plan implements the ECV LMS Frontend Portal as a Next.js 15 (App Router) application with AWS Cognito authentication, BFF API layer, role-based dashboards, course catalog/syllabus, learning plan management, and user administration. Tasks are organized by implementation phase, with each task building incrementally on previous work. TypeScript, Tailwind CSS 4, Amplify SDK v6, TanStack Query, and fast-check are the core technologies.

## Tasks

- [x] 1. Project scaffold and core configuration
  - [x] 1.1 Initialize Next.js 15 project with TypeScript, Tailwind CSS 4, and base dependencies
    - Create `ecv-lms-frontend/` directory with `npx create-next-app@latest` using App Router
    - Install dependencies: `@aws-amplify/auth`, `@aws-amplify/ui-react`, `aws-jwt-verify`, `@tanstack/react-query`, `react-hook-form`, `zod`, `lucide-react`
    - Install dev dependencies: `vitest`, `@testing-library/react`, `fast-check`, `msw`
    - Configure `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`
    - Create `.env.local` with placeholder Cognito and Moodle environment variables
    - _Requirements: 27.4_

  - [x] 1.2 Set up Amplify configuration and auth context
    - Create `lib/amplify-config.ts` with Cognito User Pool configuration from environment variables
    - Create `contexts/AuthContext.tsx` with AuthContextValue interface (user, role, isLoading, isAuthenticated, signIn, signUp, signOut, confirmSignUp, resetPassword, confirmResetPassword)
    - Create `lib/auth/roles.ts` with `resolveRole()` function that extracts `cognito:groups` from access token and returns highest-precedence role (ADMIN > TEACHER > STUDENT)
    - Create `lib/auth/session.ts` with session management utilities (fetchSession, getAccessToken, isSessionValid)
    - Wire Amplify configuration in root `app/layout.tsx` and wrap with AuthProvider and QueryClientProvider
    - _Requirements: 3.1, 4.1_

  - [ ]* 1.3 Write property tests for role resolution and session management
    - **Property 5: Role resolution from JWT groups** — For any valid cognito:groups array, resolveRole returns correct highest-precedence role
    - **Validates: Requirements 4.1, 16.2**
    - **Property 3: Sign-out clears all auth state** — For any authenticated state, signOut results in null user/role and isAuthenticated=false
    - **Validates: Requirements 1.6**

  - [x] 1.4 Create shared UI primitives
    - Create `components/ui/` directory with: Button, Card, Input, Modal, Table, DataTable, Skeleton, Toast, FileUpload, StepWizard, StatusBadge, ConfirmDialog
    - Use Tailwind CSS 4 utility classes, ensure keyboard accessibility (tabIndex, focus styles, aria attributes)
    - _Requirements: 26.2, 26.3_

  - [x] 1.5 Set up internationalization
    - Create `i18n/th.json` and `i18n/en.json` with initial translation keys for common UI elements
    - Create `lib/utils/i18n.ts` with I18nContext (locale, setLocale, t, formatDate)
    - Create `lib/utils/date.ts` with Thai Buddhist calendar formatting (Gregorian year + 543 for th locale)
    - Create I18nProvider context and wire into root layout
    - _Requirements: 25.1, 25.2, 25.3_

  - [ ]* 1.6 Write property tests for i18n and date formatting
    - **Property 32: Translation completeness** — For any translation key, both th and en locales have non-empty values
    - **Validates: Requirements 25.1**
    - **Property 33: Thai Buddhist calendar date formatting** — For any Date, th locale year = Gregorian + 543, en locale year = Gregorian
    - **Validates: Requirements 25.2**

- [x] 2. Authentication UI and route protection
  - [x] 2.1 Implement custom auth pages
    - Create `app/(auth)/layout.tsx` that redirects authenticated users to dashboard
    - Create `app/(auth)/login/page.tsx` with LoginForm component (email, password fields, social login buttons, forgot password link)
    - Create `app/(auth)/register/page.tsx` with RegisterForm component (email, password, first name, last name, validation with Zod)
    - Create `app/(auth)/verify/page.tsx` with VerifyForm component (OTP code input)
    - Create `app/(auth)/forgot-password/page.tsx` with ForgotPasswordForm component (email input, then code + new password)
    - Create `components/auth/SocialLoginButtons.tsx` with Google, Facebook, Apple buttons calling `signInWithRedirect`
    - All forms use React Hook Form + Zod for validation, call Amplify SDK v6 functional API
    - Apply ECV branding (logo, colors, typography)
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 28.1, 28.2, 28.3_

  - [ ]* 2.2 Write property tests for registration form validation
    - **Property 1: Registration form validation rejects invalid input** — For any invalid email/password/name combination, form rejects without calling signUp
    - **Validates: Requirements 1.1**
    - **Property 2: Auth error messages do not leak email existence** — For any auth failure, displayed message is generic
    - **Validates: Requirements 1.4**

  - [x] 2.3 Implement AuthGuard and protected route layout
    - Create `components/auth/AuthGuard.tsx` that checks isAuthenticated and role from AuthContext
    - Create `app/(protected)/layout.tsx` wrapping children with AuthGuard, Navbar, and Sidebar
    - AuthGuard redirects unauthenticated users to `/login?redirect={currentPath}`
    - AuthGuard checks role against route's allowed roles, shows access denied for unauthorized roles
    - Create `components/layout/Navbar.tsx` with user info, notification bell, language switcher, sign-out button
    - Create `components/layout/Sidebar.tsx` with role-based navigation menu items
    - _Requirements: 3.3, 3.4, 4.2, 4.3, 4.4, 14.4_

  - [ ]* 2.4 Write property tests for route protection
    - **Property 4: Route protection enforces auth and role requirements** — For any protected route and unauthorized user state, AuthGuard redirects or denies access
    - **Validates: Requirements 3.3, 3.4**

  - [x] 2.5 Implement MFA setup UI
    - Create `components/auth/MFASetup.tsx` with TOTP QR code generation and SMS setup
    - Integrate into profile settings page (created later, wire placeholder)
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 3. BFF API layer and Moodle client
  - [x] 3.1 Implement JWT verification middleware and Moodle REST client
    - Create `lib/auth/jwt-verifier.ts` with singleton CognitoJwtVerifier using `aws-jwt-verify`
    - Create `verifyRequest(request: NextRequest)` function that extracts Bearer token and verifies
    - Create `assertRole(payload, allowedRoles)` helper that checks `cognito:groups` claim
    - Create `lib/moodle/client.ts` with MoodleRestClient class (call method: POST to Moodle WS endpoint with wstoken, wsfunction, moodlewsrestformat=json)
    - Create `lib/moodle/types.ts` with Moodle API response type definitions
    - Create `lib/moodle/endpoints.ts` with WS function name constants
    - Create `lib/moodle/error-mapping.ts` with `mapMoodleError()` function
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 3.2 Write property tests for BFF security
    - **Property 7: BFF JWT validation rejects invalid tokens** — For any missing/malformed/expired token, BFF returns 401
    - **Validates: Requirements 6.1**
    - **Property 8: Moodle WS token never appears in BFF responses** — For any BFF response, WS token is absent
    - **Validates: Requirements 6.2**
    - **Property 9: BFF Moodle error mapping** — For any Moodle error response, BFF returns structured error without raw internals
    - **Validates: Requirements 6.4**
    - **Property 10: BFF security headers present on all responses** — For any BFF response, CSP/X-Content-Type-Options/X-Frame-Options/HSTS headers are present
    - **Validates: Requirements 6.5**

  - [x] 3.3 Implement BFF API route handlers
    - Create `app/api/auth/session/route.ts` for session validation
    - Create `app/api/moodle/courses/route.ts` (GET: list courses, POST: create course)
    - Create `app/api/moodle/courses/[id]/route.ts` (GET: course detail, PUT: update)
    - Create `app/api/moodle/courses/[id]/contents/route.ts` (GET: course outline)
    - Create `app/api/moodle/courses/[id]/students/route.ts` (GET: enrolled students)
    - Create `app/api/moodle/courses/[id]/analytics/route.ts` (GET: course analytics)
    - Create `app/api/moodle/users/route.ts` (GET: user list, POST: create user)
    - Create `app/api/moodle/users/[id]/route.ts` (GET: user detail, PUT: update, DELETE: archive)
    - Create `app/api/moodle/cohorts/route.ts` (GET: list, POST: create, PUT: update members)
    - Create `app/api/moodle/enrollments/route.ts` (POST: enroll, DELETE: unenroll)
    - Create `app/api/moodle/grades/route.ts` (GET: grades)
    - Create `app/api/moodle/learning-plans/route.ts` (GET: list, POST: create/approve)
    - Create `app/api/moodle/learning-plans/[id]/route.ts` (GET: detail, PUT: grade competency)
    - Create `app/api/moodle/competencies/route.ts` (GET: frameworks, POST: create)
    - Create `app/api/moodle/competencies/templates/route.ts` (GET: templates, POST: create/assign)
    - Create `app/api/moodle/calendar/route.ts` (GET: events)
    - Create `app/api/moodle/completion/route.ts` (GET: completion status)
    - Create `app/api/health/route.ts` (GET: health check)
    - All routes use verifyRequest + assertRole + moodleClient pattern
    - Set security headers (CSP, CSRF, HSTS) via Next.js middleware
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 4.5_

  - [ ]* 3.4 Write property tests for BFF role enforcement
    - **Property 6: BFF role-based access enforcement** — For any role-restricted route and JWT with non-matching role, BFF returns 403
    - **Validates: Requirements 4.5**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 5. TanStack Query hooks and data layer
  - [x] 5.1 Implement course data hooks
    - Create `hooks/useCourses.ts` with `useCourses(options)`, `useCourseDetail(id)`, `useCourseContents(id)` using TanStack Query
    - Create `hooks/useEnrollments.ts` with `useEnrollSelf(courseId)`, `useBatchEnroll()` mutations
    - Create `hooks/useGrades.ts` with `useGrades(courseId)`, `useGradeOverview()` queries
    - Create `hooks/useCalendar.ts` with `useCalendarEvents(options)` query
    - All hooks call BFF API routes with Bearer JWT from auth session
    - _Requirements: 10.1, 11.2, 12.1, 12.3_

  - [x] 5.2 Implement user management hooks
    - Create `hooks/useUsers.ts` with `useUsers(filters)`, `useCreateUser()`, `useBulkImportUsers()`, `useUpdateUser()`, `useSuspendUser()`, `useReactivateUser()` 
    - Create `hooks/useCohorts.ts` with `useCohorts()`, `useCreateCohort()`, `useCohortMembers(id)`, `useAddCohortMembers()`, `useRemoveCohortMembers()`
    - _Requirements: 13.1, 13.4, 13.5, 16.1_

  - [x] 5.3 Implement learning plan hooks
    - Create `hooks/useLearningPlans.ts` with `useMyPlans()`, `usePlanDetail(id)`, `usePlanCompetencies(id)`, `useApprovePlan()`, `useGradeCompetency()`
    - Create `hooks/useCompetencies.ts` with `useFrameworks()`, `useFrameworkDetail(id)`, `useCompetencies(frameworkId)`, `useCreateCompetency()`, `useTemplates()`, `useAssignTemplate()`
    - _Requirements: 18.1, 19.1, 20.1, 21.1, 21.2_

  - [x] 5.4 Implement auth hook
    - Create `hooks/useAuth.ts` wrapping AuthContext for convenient access
    - Create `hooks/useRole.ts` with role-checking utilities (isAdmin, isTeacher, isStudent, hasRole)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Student dashboard and course catalog
  - [x] 6.1 Implement student dashboard
    - Create `components/dashboard/StudentDashboard.tsx` with course cards grid, upcoming deadlines list, active learning plans summary, notification center
    - Create `components/dashboard/CourseCard.tsx` with course image, title, progress bar, last accessed date
    - Create `components/dashboard/ProgressBar.tsx` reusable progress indicator
    - Create `components/dashboard/NotificationBell.tsx` with dropdown notification list
    - Create `app/(protected)/dashboard/page.tsx` that renders role-based dashboard (StudentDashboard for STUDENT)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 6.2 Write property test for dashboard deadline sorting
    - **Property 11: Dashboard deadlines sorted by due date** — For any set of calendar events, displayed deadlines are ordered by timeStart ascending
    - **Validates: Requirements 7.2**

  - [x] 6.3 Implement course catalog
    - Create `components/courses/CourseCatalog.tsx` with grid/list view toggle, search input, category tree sidebar, filter dropdowns (difficulty, language, duration, enrollment status), sort selector
    - Create `app/(protected)/courses/page.tsx` rendering CourseCatalog
    - Implement client-side filtering and sorting logic in a `lib/courses/filter.ts` utility
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 6.4 Write property tests for course catalog
    - **Property 13: Course catalog shows only published courses** — For any course set, only visible=true courses appear
    - **Validates: Requirements 10.1**
    - **Property 14: Course search relevance** — For any query, all returned courses contain query in fullname, summary, or tags
    - **Validates: Requirements 10.2**
    - **Property 15: Category filter includes subcategories** — For any selected category, filtered courses include all descendants
    - **Validates: Requirements 10.3**
    - **Property 16: Multi-filter intersection** — For any filter combination, all displayed courses satisfy all criteria
    - **Validates: Requirements 10.4**
    - **Property 17: Course catalog sorting** — For any sort option, courses are ordered by the correct field
    - **Validates: Requirements 10.5**

- [x] 7. Course detail, outline, and enrollment
  - [x] 7.1 Implement course detail and outline view
    - Create `components/courses/CourseDetailHero.tsx` with title, image, description, instructor, metadata, enroll CTA
    - Create `components/courses/CourseOutline.tsx` with expandable/collapsible sections, learning objectives per section
    - Create `components/courses/SectionCard.tsx` accordion card for each module/section
    - Create `components/courses/ActivityIcon.tsx` mapping modname to Lucide icon (quiz→ClipboardCheck, assign→FileEdit, forum→MessageSquare, lesson→BookOpen, h5pactivity→Gamepad2, resource→File, url→Link, page→FileText)
    - Create `components/courses/PrerequisiteBadge.tsx` with lock icon and prerequisite message for unavailable modules
    - Create `components/layout/MoodleLink.tsx` SSO redirect component that constructs Moodle OAuth2 login URL
    - Create `app/(protected)/courses/[id]/page.tsx` rendering CourseDetailHero + CourseOutline
    - Create `app/(protected)/courses/[id]/syllabus/page.tsx` for full syllabus view
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 5.1_

  - [ ]* 7.2 Write property tests for course outline rendering
    - **Property 18: Course outline renders all sections and modules** — For any course contents, all sections and modules appear in order
    - **Validates: Requirements 11.2**
    - **Property 19: Activity type to icon mapping** — For any recognized activity type, icon mapper returns a defined icon
    - **Validates: Requirements 11.3**
    - **Property 20: Prerequisite lock display** — For any module with available=false, lock indicator and message render
    - **Validates: Requirements 11.5**
    - **Property 21: Course progress calculation** — For any module completion states, progress = completed/total × 100
    - **Validates: Requirements 11.7**

  - [x] 7.3 Implement self-enrollment and grade overview
    - Add enroll button to CourseDetailHero that calls `useEnrollSelf` hook
    - Handle enrollment errors (capacity, enrollment key) with descriptive messages
    - Create `app/(protected)/grades/page.tsx` displaying grades for all enrolled courses
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. User management (Admin)
  - [x] 9.1 Implement user list and profile views
    - Create `components/users/UserTable.tsx` with paginated DataTable, search input, role/status/cohort filter dropdowns
    - Create `components/users/UserDetailCard.tsx` displaying full user profile with enrolled courses, grades, badges, certificates, learning history
    - Create `app/(protected)/admin/users/page.tsx` rendering UserTable
    - Create `app/(protected)/admin/users/[id]/page.tsx` rendering UserDetailCard
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ]* 9.2 Write property test for user list filtering
    - **Property 22: User list filtering** — For any search/filter criteria and user dataset, all displayed users match all criteria
    - **Validates: Requirements 13.2**

  - [x] 9.3 Implement user CRUD and lifecycle management
    - Create `components/users/UserForm.tsx` for create/edit user (React Hook Form + Zod validation)
    - Implement suspend/reactivate actions with confirmation dialogs
    - Implement delete/archive with data retention options and PDPA compliance
    - Create `components/users/RoleAssignment.tsx` for Cognito group assignment
    - _Requirements: 13.4, 13.5, 13.6, 14.1, 14.2, 14.3, 16.2_

  - [x] 9.4 Implement CSV import/export
    - Create `lib/csv/processor.ts` with `validateUserImportCsv()` and `generateUserExportCsv()` functions
    - Create `components/users/UserImportWizard.tsx` with file upload, validation preview, error report, confirm/cancel
    - Implement CSV template download
    - Implement user export with field selection and filter options
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ]* 9.5 Write property tests for CSV processing
    - **Property 23: CSV import validation** — For any CSV content, validator correctly identifies valid/invalid rows, sum equals total
    - **Validates: Requirements 15.1**
    - **Property 24: CSV export filtering** — For any user dataset and export options, CSV contains exactly matching users with selected fields
    - **Validates: Requirements 15.4**

  - [x] 9.6 Implement cohort management and batch enrollment
    - Create `components/users/CohortManager.tsx` with cohort CRUD and member management
    - Create `components/users/BulkEnrollDialog.tsx` for batch enrollment (manual selection + CSV upload)
    - Create `app/(protected)/admin/cohorts/page.tsx` and `app/(protected)/admin/cohorts/[id]/page.tsx`
    - _Requirements: 16.1, 15.5_

  - [x] 9.7 Implement approval queue
    - Create `components/users/ApprovalQueue.tsx` with pending registrations table, approve/reject/request-info actions
    - Create `app/(protected)/admin/users/approvals/page.tsx`
    - _Requirements: 16.3_

- [x] 10. Teacher dashboard and course management
  - [x] 10.1 Implement teacher dashboard
    - Create `components/dashboard/TeacherDashboard.tsx` with managed course cards, at-risk students list, recent submissions
    - Wire into `app/(protected)/dashboard/page.tsx` for TEACHER role
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 10.2 Write property test for at-risk student detection
    - **Property 12: At-risk student detection** — For any student data, at-risk flag is true iff low progress OR overdue assignments OR no recent login
    - **Validates: Requirements 8.2, 23.3**

  - [x] 10.3 Implement course management (teacher/admin)
    - Create `components/courses/CourseCreationWizard.tsx` with step-by-step wizard (metadata → format → sections → competency mapping → publish)
    - Create `components/courses/CourseMetadataForm.tsx` for editing course metadata
    - Create `app/(protected)/admin/courses/page.tsx` and `app/(protected)/admin/courses/create/page.tsx`
    - Implement draft/published toggle, enrollment configuration, completion criteria config
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

  - [x] 10.4 Implement course analytics
    - Create `components/courses/CourseAnalyticsCharts.tsx` with enrollment trend, completion rate, grade distribution charts
    - Create `components/courses/StudentProgressTable.tsx` with per-student progress, grade, at-risk flag
    - Create `app/(protected)/courses/[id]/analytics/page.tsx` and `app/(protected)/teacher/courses/[id]/analytics/page.tsx`
    - Implement PDF/CSV export for analytics reports
    - _Requirements: 23.1, 23.2, 23.3, 23.4_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 12. Learning plans and competency management
  - [x] 12.1 Implement competency framework management (admin)
    - Create `components/learning-plans/FrameworkManager.tsx` with framework list, create/edit form
    - Create `components/learning-plans/CompetencyTree.tsx` with hierarchical tree view, create/edit/delete competency nodes
    - Create `app/(protected)/admin/competencies/page.tsx` and `app/(protected)/admin/competencies/[frameworkId]/page.tsx`
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

  - [ ]* 12.2 Write property test for competency tree hierarchy
    - **Property 26: Competency tree hierarchy** — For any competency dataset with parent-child relationships, tree renders correct hierarchy with all nodes
    - **Validates: Requirements 18.3**

  - [x] 12.3 Implement learning plan template management (admin/teacher)
    - Create `components/learning-plans/TemplateManager.tsx` with template list, create/edit form, competency selection
    - Create `components/learning-plans/TemplateAssignDialog.tsx` for assigning templates to users or cohorts
    - Create `app/(protected)/admin/plan-templates/page.tsx` and `app/(protected)/admin/plan-templates/[id]/page.tsx`
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

  - [ ]* 12.4 Write property test for cohort template assignment
    - **Property 27: Cohort template assignment creates plans for all members** — For any cohort with N members, assignment creates exactly N plan requests
    - **Validates: Requirements 19.4**

  - [x] 12.5 Implement student learning plan views
    - Create `components/learning-plans/PlanList.tsx` with plan cards showing name, due date, progress, status
    - Create `components/learning-plans/PlanDetailView.tsx` with competency progress bars, linked courses, recommended courses
    - Create `components/learning-plans/CompetencyProgressBar.tsx` showing current vs required proficiency
    - Create `components/learning-plans/PlanTimeline.tsx` with visual timeline (start, milestones, due date)
    - Create `app/(protected)/learning-plans/page.tsx` and `app/(protected)/learning-plans/[id]/page.tsx`
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

  - [ ]* 12.6 Write property tests for learning plan views
    - **Property 28: Plan detail shows all competencies** — For any plan data, all competencies render with proficiency levels and linked courses
    - **Validates: Requirements 20.2**
    - **Property 29: Recommended courses for unmet competencies** — For any plan, courses are recommended only for competencies below required proficiency
    - **Validates: Requirements 20.3**

  - [x] 12.7 Implement learning plan administration (admin/teacher)
    - Create `components/learning-plans/PlanApprovalQueue.tsx` with plans in waiting_for_review status, approve/reject actions
    - Create `components/learning-plans/CompetencyGradingForm.tsx` for teachers to grade competencies
    - Create progress monitoring dashboard showing cohort/team progress per template
    - Create `app/(protected)/teacher/plans/page.tsx` for teacher plan management
    - Implement plan completion report export (CSV/PDF)
    - _Requirements: 21.1, 21.2, 21.3, 21.4_

  - [ ]* 12.8 Write property tests for plan administration
    - **Property 30: Approval queue shows only waiting-for-review plans** — For any plan set, only waiting_for_review plans appear in queue
    - **Validates: Requirements 21.1**
    - **Property 31: Cohort progress aggregation** — For any plan set grouped by template/cohort, average progress is correctly calculated
    - **Validates: Requirements 21.3**

- [x] 13. Admin dashboard, audit logs, and system reports
  - [x] 13.1 Implement admin dashboard
    - Create `components/dashboard/AdminDashboard.tsx` with summary stats (total users, active today, courses, enrollments, pending approvals), registration trend chart, role distribution, recent activity
    - Wire into `app/(protected)/dashboard/page.tsx` for ADMIN role
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 13.2 Implement audit log viewer
    - Create `components/users/AuditLogTable.tsx` with date range, user, and action type filters
    - Create `app/(protected)/admin/audit-log/page.tsx`
    - _Requirements: 17.1_

  - [ ]* 13.3 Write property test for audit log filtering
    - **Property 25: Audit log filtering** — For any filter combination and log dataset, all displayed entries match all filter criteria
    - **Validates: Requirements 17.1**

  - [x] 13.4 Implement system reports
    - Create `app/(protected)/admin/reports/page.tsx` with user registration trends, active user counts, course completion rates, enrollment trends
    - Implement CSV/PDF export for reports
    - _Requirements: 17.2, 17.3_

- [x] 14. User profile and SSO
  - [x] 14.1 Implement user profile page
    - Create `app/(protected)/profile/page.tsx` with profile view/edit form, password change, MFA settings, language preference toggle
    - Profile edit syncs to both Cognito (updateUserAttributes) and Moodle (via BFF)
    - Language preference change updates i18n context without page reload
    - _Requirements: 24.1, 24.2, 24.3, 24.4_

  - [x] 14.2 Implement SSO redirect to Moodle
    - Finalize `components/layout/MoodleLink.tsx` to construct correct Moodle OAuth2 login URL with issuer_id
    - Integrate MoodleLink into course outline activity clicks, dashboard quick actions, and navigation
    - _Requirements: 5.1, 5.3, 11.6_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Cognito Lambda triggers (CDK)
  - [x] 16.1 Implement Cognito Lambda triggers as CDK construct
    - Create `lib/constructs/cognito-triggers.ts` in the CDK project
    - Implement Post-Confirmation Lambda: extract user attributes from event, call Moodle `core_user_create_users`, store moodle_user_id as custom attribute, add user to STUDENTS group
    - Implement Pre-Token Generation Lambda: add custom:moodle_user_id and custom:permissions claims to tokens
    - Implement Custom Message Lambda: branded email templates for verification and password reset (Thai/English)
    - Wire triggers into Cognito User Pool construct
    - _Requirements: 5.2_

- [x] 17. Final integration and polish
  - [x] 17.1 Wire all components together and verify navigation
    - Ensure all routes are connected: dashboard → courses → course detail → syllabus → Moodle SSO
    - Ensure admin routes: users → user detail → edit → CSV import → cohorts → audit log → reports
    - Ensure learning plan routes: plans → plan detail → competency frameworks → templates
    - Ensure teacher routes: dashboard → course students → gradebook → analytics → plan management
    - Verify role-based sidebar navigation shows correct items per role
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 17.2 Implement Next.js middleware for security headers
    - Create `middleware.ts` at project root setting CSP, X-Content-Type-Options, X-Frame-Options, HSTS, CSRF headers on all responses
    - Configure session timeout (30-minute inactivity) check in AuthContext
    - _Requirements: 6.5, 3.2_

  - [x] 17.3 Responsive design pass
    - Review and adjust all pages/components for desktop (1280px+), tablet (768px-1279px), and mobile (<768px) breakpoints
    - Ensure touch-friendly button sizes and swipe gestures where applicable
    - _Requirements: 26.1_

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- All BFF routes follow the same pattern: verifyRequest → assertRole → moodleClient.call → return JSON
- Cognito Lambda triggers are implemented as CDK constructs in the existing infrastructure project
