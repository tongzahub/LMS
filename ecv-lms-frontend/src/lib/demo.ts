/**
 * Demo mode utility. When NEXT_PUBLIC_DEMO_MODE is "true",
 * the application uses mock data instead of calling the Moodle API.
 */
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
