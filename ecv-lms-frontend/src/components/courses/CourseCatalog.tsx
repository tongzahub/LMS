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
  BookOpen,
} from 'lucide-react';
import { useCourses, type Course } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  filterCourses,
  sortCourses,
  extractFilterOptions,
  type CourseFilters,
  type CourseCategory,
  type SortOption,
} from '@/lib/courses/filter';
import { MOCK_CATEGORIES } from '@/lib/mock';

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
        className={`flex items-center w-full text-left text-sm py-1.5 px-2 rounded-lg hover:bg-gray-100 transition-colors ${
          isSelected ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600'
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
        <span className="ml-auto text-xs text-gray-400 tabular-nums">{category.courseCount}</span>
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
      <Card padding="none" hoverable className="overflow-hidden h-full flex flex-col group">
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.fullname}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-brand-50 to-indigo-50">
              <BookOpen className="w-8 h-8 text-brand-300" />
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <p className="text-[11px] font-medium text-brand-600 uppercase tracking-wide mb-1">{course.categoryName}</p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-snug group-hover:text-brand-700 transition-colors">
            {course.fullname}
          </h3>
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
            <span className="flex items-center gap-1 ml-auto tabular-nums">
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
      <Card padding="sm" hoverable className="flex items-center gap-4">
        <div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.fullname}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-brand-50 to-indigo-50">
              <BookOpen className="w-5 h-5 text-brand-300" />
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
          {course.difficulty && <span className="font-medium">{t(`courses.${course.difficulty}`)}</span>}
          {course.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {course.duration}
            </span>
          )}
          <span className="flex items-center gap-1 tabular-nums">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            {course.enrolledCount}
          </span>
        </div>
      </Card>
    </Link>
  );
}

// --- Main CourseCatalog component ---

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

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton variant="rectangular" height="48px" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton variant="rectangular" height="160px" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="50%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={BookOpen}
        title={t('common.error')}
        description="Failed to load courses"
        actionLabel={t('common.retry')}
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
      {/* Category sidebar — hidden on mobile */}
      {categories.length > 0 && (
        <aside className="hidden lg:block w-56 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">{t('courses.allCategories')}</h2>
          <nav aria-label="Course categories">
            <ul role="tree" className="space-y-0.5">
              <li>
                <button
                  type="button"
                  className={`w-full text-left text-sm py-1.5 px-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    !filters.categoryId ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600'
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
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('courses.catalog')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse and discover courses</p>
        </div>

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
                className="rounded-lg border border-gray-200 text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-shadow"
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
                className="rounded-lg border border-gray-200 text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-shadow"
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
                className="rounded-lg border border-gray-200 text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-shadow"
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
              className="rounded-lg border border-gray-200 text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none transition-shadow"
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
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              {t('courses.courseCount').replace('{{count}}', String(displayedCourses.length))}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({})}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-gray-200 text-sm px-3 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition-shadow"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              aria-label={t('courses.sortBy')}
            >
              <option value="newest">{t('courses.sortNewest')}</option>
              <option value="popular">{t('courses.sortPopular')}</option>
              <option value="alphabetical">{t('courses.sortAlphabetical')}</option>
            </select>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label={t('courses.gridView')}
                aria-pressed={viewMode === 'grid'}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label={t('courses.listView')}
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Course listing */}
        {displayedCourses.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t('courses.noCourses')}
            description="Try adjusting your filters or search terms"
            actionLabel="Clear filters"
            onAction={() => setFilters({})}
          />
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
