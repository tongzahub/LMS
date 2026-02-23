import type { Course } from '@/hooks/useCourses';

export interface CourseCategory {
  id: number;
  name: string;
  parentId: number | null;
  courseCount: number;
  children: CourseCategory[];
}

export type SortOption = 'newest' | 'popular' | 'alphabetical';

export interface CourseFilters {
  search?: string;
  categoryId?: number | null;
  difficulty?: string | null;
  language?: string | null;
  duration?: string | null;
  enrollmentStatus?: 'open' | 'closed' | null;
}

/**
 * Collect all descendant category IDs (inclusive) for subcategory filtering.
 */
export function getCategoryDescendantIds(
  categories: CourseCategory[],
  targetId: number,
): Set<number> {
  const ids = new Set<number>();

  function walk(cats: CourseCategory[], collecting: boolean) {
    for (const cat of cats) {
      const match = cat.id === targetId;
      if (match || collecting) {
        ids.add(cat.id);
        walk(cat.children, true);
      } else {
        walk(cat.children, false);
      }
    }
  }

  walk(categories, false);
  return ids;
}

/**
 * Pure function: filters courses by all active criteria.
 * Only visible (published) courses are returned.
 */
export function filterCourses(
  courses: Course[],
  filters: CourseFilters,
  categories?: CourseCategory[],
): Course[] {
  const query = filters.search?.trim().toLowerCase();

  // Pre-compute category descendant set once
  let allowedCategoryIds: Set<number> | null = null;
  if (filters.categoryId != null && categories) {
    allowedCategoryIds = getCategoryDescendantIds(categories, filters.categoryId);
  }

  return courses.filter((course) => {
    // Only published courses
    if (!course.visible) return false;

    // Search: match across fullname, summary (tags not on Course type, but summary covers description)
    if (query) {
      const matchesSearch =
        course.fullname.toLowerCase().includes(query) ||
        course.summary.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Category filter (includes subcategories)
    if (allowedCategoryIds && !allowedCategoryIds.has(course.categoryId)) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty && course.difficulty !== filters.difficulty) {
      return false;
    }

    // Language filter
    if (filters.language && course.language !== filters.language) {
      return false;
    }

    // Duration filter
    if (filters.duration && course.duration !== filters.duration) {
      return false;
    }

    // Enrollment status filter
    if (filters.enrollmentStatus === 'open') {
      const now = new Date().toISOString();
      if (course.endDate && course.endDate < now) return false;
    } else if (filters.enrollmentStatus === 'closed') {
      const now = new Date().toISOString();
      if (!course.endDate || course.endDate >= now) return false;
    }

    return true;
  });
}

/**
 * Pure function: sorts courses by the selected option.
 */
export function sortCourses(courses: Course[], sort: SortOption): Course[] {
  const sorted = [...courses];

  switch (sort) {
    case 'newest':
      sorted.sort((a, b) => b.startDate.localeCompare(a.startDate));
      break;
    case 'popular':
      sorted.sort((a, b) => b.enrolledCount - a.enrolledCount);
      break;
    case 'alphabetical':
      sorted.sort((a, b) => a.fullname.localeCompare(b.fullname));
      break;
  }

  return sorted;
}

/**
 * Extract unique non-null values for a given field from courses, for building filter options.
 */
export function extractFilterOptions(courses: Course[], field: keyof Course): string[] {
  const values = new Set<string>();
  for (const course of courses) {
    const val = course[field];
    if (val != null && val !== '') values.add(String(val));
  }
  return Array.from(values).sort();
}
