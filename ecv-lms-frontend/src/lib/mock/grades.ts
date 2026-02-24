import type { CourseGrades } from '@/hooks/useGrades';

// ---------------------------------------------------------------------------
// MOCK GRADE OVERVIEW
// ---------------------------------------------------------------------------

export const MOCK_GRADE_OVERVIEW: CourseGrades[] = [
  {
    courseId: 1,
    courseName: 'Introduction to Programming with Python',
    items: [
      {
        itemId: 10001,
        itemName: 'Assignment 1: Hello Thailand Script',
        grade: 9.5,
        gradeMax: 10,
        percentage: 95,
      },
      {
        itemId: 10002,
        itemName: 'Quiz 1: Python Fundamentals',
        grade: 8,
        gradeMax: 10,
        percentage: 80,
      },
      {
        itemId: 10003,
        itemName: 'Assignment 2: Calculator Application',
        grade: null,
        gradeMax: 10,
        percentage: null,
      },
      {
        itemId: 10004,
        itemName: 'Quiz 2: Control Flow',
        grade: null,
        gradeMax: 10,
        percentage: null,
      },
      {
        itemId: 10005,
        itemName: 'Assignment 3: Library Management System',
        grade: null,
        gradeMax: 15,
        percentage: null,
      },
      {
        itemId: 10006,
        itemName: 'Midterm Examination',
        grade: null,
        gradeMax: 25,
        percentage: null,
      },
      {
        itemId: 10007,
        itemName: 'Final Examination',
        grade: null,
        gradeMax: 30,
        percentage: null,
      },
    ],
    courseTotal: null,
  },
  {
    courseId: 2,
    courseName: 'Full-Stack Web Development with React & Node.js',
    items: [
      {
        itemId: 20001,
        itemName: 'Assignment 1: Personal Portfolio Page',
        grade: 28,
        gradeMax: 30,
        percentage: 93.3,
      },
      {
        itemId: 20002,
        itemName: 'Assignment 2: REST API for Todo App',
        grade: null,
        gradeMax: 30,
        percentage: null,
      },
      {
        itemId: 20003,
        itemName: 'Quiz: JavaScript & React',
        grade: null,
        gradeMax: 20,
        percentage: null,
      },
      {
        itemId: 20004,
        itemName: 'Midterm Exam: Frontend Development',
        grade: null,
        gradeMax: 40,
        percentage: null,
      },
      {
        itemId: 20005,
        itemName: 'Final Project: Full-Stack Web Application',
        grade: null,
        gradeMax: 60,
        percentage: null,
      },
      {
        itemId: 20006,
        itemName: 'Participation & Forum',
        grade: 18,
        gradeMax: 20,
        percentage: 90,
      },
    ],
    courseTotal: null,
  },
  {
    courseId: 3,
    courseName: 'Data Science and Machine Learning Fundamentals',
    items: [
      {
        itemId: 30001,
        itemName: 'Assignment 1: Thai Economic Data Analysis',
        grade: 42,
        gradeMax: 50,
        percentage: 84,
      },
      {
        itemId: 30002,
        itemName: 'Quiz: Data Visualization',
        grade: 16,
        gradeMax: 20,
        percentage: 80,
      },
      {
        itemId: 30003,
        itemName: 'Assignment 2: Credit Risk Classification',
        grade: null,
        gradeMax: 60,
        percentage: null,
      },
      {
        itemId: 30004,
        itemName: 'Midterm Exam: ML Fundamentals',
        grade: null,
        gradeMax: 100,
        percentage: null,
      },
      {
        itemId: 30005,
        itemName: 'Final Project: Real-world Data Science Application',
        grade: null,
        gradeMax: 120,
        percentage: null,
      },
    ],
    courseTotal: null,
  },
  {
    courseId: 10,
    courseName: 'Business English Communication',
    items: [
      {
        itemId: 40001,
        itemName: 'Writing Assignment 1: Business Email',
        grade: 85,
        gradeMax: 100,
        percentage: 85,
      },
      {
        itemId: 40002,
        itemName: 'Quiz: Vocabulary and Grammar',
        grade: 78,
        gradeMax: 100,
        percentage: 78,
      },
      {
        itemId: 40003,
        itemName: 'Speaking Test: Elevator Pitch',
        grade: 90,
        gradeMax: 100,
        percentage: 90,
      },
      {
        itemId: 40004,
        itemName: 'Business English Presentation',
        grade: null,
        gradeMax: 100,
        percentage: null,
      },
      {
        itemId: 40005,
        itemName: 'Midterm: Listening & Reading Comprehension',
        grade: 82,
        gradeMax: 100,
        percentage: 82,
      },
      {
        itemId: 40006,
        itemName: 'Final Examination',
        grade: null,
        gradeMax: 100,
        percentage: null,
      },
    ],
    courseTotal: null,
  },
];
