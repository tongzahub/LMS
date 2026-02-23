/** Moodle Web Service function name constants */
export const WS = {
  // User
  CORE_USER_CREATE_USERS: 'core_user_create_users',
  CORE_USER_GET_USERS: 'core_user_get_users',
  CORE_USER_GET_USERS_BY_FIELD: 'core_user_get_users_by_field',
  CORE_USER_UPDATE_USERS: 'core_user_update_users',

  // Course
  CORE_COURSE_GET_COURSES: 'core_course_get_courses',
  CORE_COURSE_GET_COURSES_BY_FIELD: 'core_course_get_courses_by_field',
  CORE_COURSE_GET_CONTENTS: 'core_course_get_contents',
  CORE_COURSE_CREATE_COURSES: 'core_course_create_courses',
  CORE_COURSE_UPDATE_COURSES: 'core_course_update_courses',
  CORE_COURSE_GET_CATEGORIES: 'core_course_get_categories',
  CORE_COURSE_SEARCH_COURSES: 'core_course_search_courses',

  // Enrollment
  CORE_ENROL_GET_USERS_COURSES: 'core_enrol_get_users_courses',
  ENROL_SELF_ENROL_USER: 'enrol_self_enrol_user',
  ENROL_MANUAL_ENROL_USERS: 'enrol_manual_enrol_users',

  // Grades
  GRADEREPORT_USER_GET_GRADE_ITEMS: 'gradereport_user_get_grade_items',
  GRADEREPORT_USER_GET_GRADES_TABLE: 'gradereport_user_get_grades_table',

  // Calendar
  CORE_CALENDAR_GET_CALENDAR_EVENTS: 'core_calendar_get_calendar_events',

  // Completion
  CORE_COMPLETION_GET_ACTIVITIES_COMPLETION_STATUS: 'core_completion_get_activities_completion_status',
  CORE_COMPLETION_GET_COURSE_COMPLETION_STATUS_BY_ID: 'core_completion_get_course_completion_status_by_id',

  // Competency
  CORE_COMPETENCY_LIST_COMPETENCY_FRAMEWORKS: 'core_competency_list_competency_frameworks',
  CORE_COMPETENCY_READ_COMPETENCY_FRAMEWORK: 'core_competency_read_competency_framework',
  CORE_COMPETENCY_LIST_COMPETENCIES: 'core_competency_list_competencies',
  CORE_COMPETENCY_CREATE_COMPETENCY: 'core_competency_create_competency',
  CORE_COMPETENCY_UPDATE_COMPETENCY: 'core_competency_update_competency',
  CORE_COMPETENCY_DELETE_COMPETENCY: 'core_competency_delete_competency',
  CORE_COMPETENCY_ADD_COMPETENCY_TO_COURSE: 'core_competency_add_competency_to_course',
  CORE_COMPETENCY_CREATE_COMPETENCY_FRAMEWORK: 'core_competency_create_competency_framework',

  // Learning Plans
  TOOL_LP_DATA_FOR_PLANS_PAGE: 'tool_lp_data_for_plans_page',
  TOOL_LP_DATA_FOR_PLAN_PAGE: 'tool_lp_data_for_plan_page',
  CORE_COMPETENCY_CREATE_PLAN: 'core_competency_create_plan',
  CORE_COMPETENCY_APPROVE_PLAN: 'core_competency_approve_plan',
  CORE_COMPETENCY_UNAPPROVE_PLAN: 'core_competency_unapprove_plan',
  CORE_COMPETENCY_GRADE_COMPETENCY_IN_PLAN: 'core_competency_grade_competency_in_plan',
  CORE_COMPETENCY_LIST_PLAN_COMPETENCIES: 'core_competency_list_plan_competencies',

  // Plan Templates
  CORE_COMPETENCY_LIST_TEMPLATES: 'core_competency_list_templates',
  CORE_COMPETENCY_CREATE_TEMPLATE: 'core_competency_create_template',
  CORE_COMPETENCY_CREATE_PLAN_FROM_TEMPLATE: 'core_competency_create_plan_from_template',

  // Cohorts
  CORE_COHORT_GET_COHORTS: 'core_cohort_get_cohorts',
  CORE_COHORT_CREATE_COHORTS: 'core_cohort_create_cohorts',
  CORE_COHORT_ADD_COHORT_MEMBERS: 'core_cohort_add_cohort_members',
  CORE_COHORT_DELETE_COHORT_MEMBERS: 'core_cohort_delete_cohort_members',
  CORE_COHORT_GET_COHORT_MEMBERS: 'core_cohort_get_cohort_members',
} as const;
