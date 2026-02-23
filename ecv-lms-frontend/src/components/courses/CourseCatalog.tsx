'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Grid3X3,
  List,
  Users,
  Clock,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useCourses, type Course } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  filterCourses,
  sortCourses,
  extractFilterOptions,
  type CourseFilters,
  type CourseCategory,
  type SortOption,
} from '@/lib/courses/filter';

// --- Category tree sidebar ---

function CategoryTreeItem({
  category,
  selectedId,
  onSelect,
  depth = 0,
}: {
  category: CourseCategory;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;
  const isSelected = selectedId === category.id;

  return (
    <li>
      <button
        type="button"
        className={`flex items-center w-full text-left text-sm py-1.5 px-2 rounded hover:bg-gray-100 transition-colors ${
          isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(isSelected ? null : category.id)}
        aria-current={isSelected ? 'true' : undefined}
      >
        {hasChildren && (
          <span
            role="button"
            tabIndex={0}
            className="mr-1 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                setExpanded(!expanded);
              }
            }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        )}
        {!hasChildren && <span className="w-3.5 mr-1 shrink-0" />}
        <span className="truncate">{category.name}</span>
        <span className="ml-auto text-xs text-gray-400">{category.courseCount}</span>
      </button>
      {hasChildren && expanded && (
        <ul role="group">
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// --- Course card for grid view ---

function CatalogCourseCard({ course }: { course: Course }) {
  const { t } = useI18n();

  const difficultyMap: Record<string, 'active' | 'warning' | 'error' | 'pending'> = {
    beginner: 'active',
    intermediate: 'pending',
    advanced: 'warning',
    expert: 'error',
  };

  return (
    <Link href={`/courses/${course.id}`}>
      <Card padding="none" className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="relative h-36 bg-gray-100">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.fullname}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-blue-50">
              <span className="text-3xl text-blue-300" aria-hidden="true">📚</span>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-gray-500 mb-1">{course.categoryName}</p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{course.fullname}</h3>
          <p className="text-xs text-gray-500 mb-3">{course.instructorName}</p>
          <div className="mt-auto flex items-center gap-3 text-xs text-gray-500">
            {course.difficulty && (
              <StatusBadge
                status={difficultyMap[course.difficulty] ?? 'pending'}
                label={t(`courses.${course.difficulty}`)}
              />
            )}
            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {course.duration}
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              {course.enrolledCount}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// --- Course row for list view ---

function CatalogCourseRow({ course }: { course: Course }) {
  const { t } = useI18n();

  return (
    <Link href={`/courses/${course.id}`}>
      <Card padding="sm" className="hover:shadow-md transition-shadow flex items-center gap-4">
        <div className="relative w-20 h-14 shrink-0 rounded overflow-hidden bg-gray-100">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.fullname}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-blue-50">
              <span className="text-lg text-blue-300" aria-hidden="true">📚</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{course.fullname}</h3>
          <p className="text-xs text-gray-500">
            {course.categoryName} · {course.instructorName}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 shrink-0">
          {course.difficulty && <span>{t(`courses.${course.difficulty}`)}</span>}
          {course.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {course.duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            {course.enrolledCount}
          </span>
        </div>
      </Card>
    </Link>
  );
}

// --- Main CourseCatalog component ---

// Placeholder categories — in production these come from an API hook
const MOCK_CATEGORIES: CourseCategory[] = [];

export function CourseCatalog() {
  const { t } = useI18n();
  const { data: courses = [], isLoading, isError } = useCourses();

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<CourseFilters>({});
  const [categories] = useState<CourseCategory[]>(MOCK_CATEGORIES);

  // Derived filter options from actual data
  const difficultyOptions = useMemo(() => extractFilterOptions(courses, 'difficulty'), [courses]);
  const languageOptions = useMemo(() => extractFilterOptions(courses, 'language'), [courses]);
  const durationOptions = useMemo(() => extractFilterOptions(courses, 'duration'), [courses]);

  // Apply filters then sort
  const displayedCourses = useMemo(() => {
    const filtered = filterCourses(courses, filters, categories);
    return sortCourses(filtered, sort);
  }, [courses, filters, categories, sort]);

  const updateFilter = <K extends keyof CourseFilters>(key: K, value: CourseFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" height="48px" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="240px" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('common.error')}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Category sidebar — hidden on mobile */}
      {categories.length > 0 && (
        <aside className="hidden lg:block w-56 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">{t('courses.allCategories')}</h2>
          <nav aria-label="Course categories">
            <ul role="tree" className="space-y-0.5">
              <li>
                <button
                  type="button"
                  className={`w-full text-left text-sm py-1.5 px-2 rounded hover:bg-gray-100 ${
                    !filters.categoryId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                  onClick={() => updateFilter('categoryId', null)}
                >
                  {t('courses.allCategories')}
                </button>
              </li>
              {categories.map((cat) => (
                <CategoryTreeItem
                  key={cat.id}
                  category={cat}
                  selectedId={filters.categoryId ?? null}
                  onSelect={(id) => updateFilter('categoryId', id)}
                />
              ))}
            </ul>
          </nav>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar: search, filters, sort, view toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
            <Input
              placeholder={t('courses.searchPlaceholder')}
              value={filters.search ?? ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9"
              aria-label={t('common.search')}
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.length > 0 && (
              <select
                className="rounded-lg border border-gray-300 text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={filters.difficulty ?? ''}
                onChange={(e) => updateFilter('difficulty', e.target.value || null)}
                aria-label={t('courses.difficulty')}
              >
                <option value="">{t('courses.allDifficulties')}</option>
                {difficultyOptions.map((d) => (
                  <option key={d} value={d}>{t(`courses.${d}`)}</option>
                ))}
              </select>
            )}

            {languageOptions.length > 0 && (
              <select
                className="rounded-lg border border-gray-300 text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={filters.language ?? ''}
                onChange={(e) => updateFilter('language', e.target.value || null)}
                aria-label={t('courses.language')}
              >
                <option value="">{t('courses.allLanguages')}</option>
                {languageOptions.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            )}

            {durationOptions.length > 0 && (
              <select
                className="rounded-lg border border-gray-300 text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={filters.duration ?? ''}
                onChange={(e) => updateFilter('duration', e.target.value || null)}
                aria-label={t('courses.duration')}
              >
                <option value="">{t('courses.allDurations')}</option>
                {durationOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            <select
              className="rounded-lg border border-gray-300 text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={filters.enrollmentStatus ?? ''}
              onChange={(e) => updateFilter('enrollmentStatus', (e.target.value as 'open' | 'closed') || null)}
              aria-label={t('common.status')}
            >
              <option value="">{t('courses.allEnrollment')}</option>
              <option value="open">{t('courses.enrollmentOpen')}</option>
              <option value="closed">{t('courses.enrollmentClosed')}</option>
            </select>
          </div>
        </div>

        {/* Sort + view toggle + count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {t('courses.courseCount').replace('{{count}}', String(displayedCourses.length))}
          </p>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-gray-300 text-sm px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              aria-label={t('courses.sortBy')}
            >
              <option value="newest">{t('courses.sortNewest')}</option>
              <option value="popular">{t('courses.sortPopular')}</option>
              <option value="alphabetical">{t('courses.sortAlphabetical')}</option>
            </select>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              aria-label={t('courses.gridView')}
              aria-pressed={viewMode === 'grid'}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-label={t('courses.listView')}
              aria-pressed={viewMode === 'list'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Course listing */}
        {displayedCourses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">{t('courses.noCourses')}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCourses.map((course) => (
              <CatalogCourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedCourses.map((course) => (
              <CatalogCourseRow key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
