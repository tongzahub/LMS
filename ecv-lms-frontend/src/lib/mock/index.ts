// ---------------------------------------------------------------------------
// Mock Data Barrel – ECV LMS Frontend
//
// Re-exports all mock data from individual domain modules.
// Import from this file for convenience:
//   import { MOCK_COURSES, MOCK_USERS } from '@/lib/mock';
// ---------------------------------------------------------------------------

export {
  MOCK_COURSES,
  MOCK_COURSE_DETAILS,
  MOCK_COURSE_SECTIONS,
  MOCK_CATEGORIES,
} from './courses';

export { MOCK_USERS } from './users';

export { MOCK_CALENDAR_EVENTS } from './calendar';

export { MOCK_LEARNING_PLANS } from './learning-plans';

export { MOCK_GRADE_OVERVIEW } from './grades';

export {
  MOCK_FRAMEWORKS,
  MOCK_COMPETENCIES,
  MOCK_TEMPLATES,
} from './competencies';

export { MOCK_COHORTS } from './cohorts';

export { MOCK_MEDIA } from './media';
