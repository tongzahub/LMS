import type { CalendarEvent } from '@/hooks/useCalendar';

// ---------------------------------------------------------------------------
// DATE HELPERS (file-local, no export)
// ---------------------------------------------------------------------------

/** Returns an ISO string offset by `n` days from the mock "today" (2026-02-24). */
function daysFromNow(n: number, hour = 9, minute = 0): string {
  const d = new Date('2026-02-24T00:00:00.000Z');
  d.setDate(d.getDate() + n);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// MOCK CALENDAR EVENTS
// ---------------------------------------------------------------------------

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  // ---- Assignments ---------------------------------------------------------
  {
    id: 1001,
    name: 'ส่งงาน: Assignment 2 - Calculator Application',
    description: 'ส่ง Python calculator application พร้อม unit tests และ README',
    courseId: 1,
    courseName: 'Introduction to Programming with Python',
    eventType: 'assignment',
    timeStart: daysFromNow(2, 23, 59),
  },
  {
    id: 1002,
    name: 'ส่งงาน: REST API for Todo App',
    description: 'ส่ง Express.js REST API พร้อม Postman collection และ documentation',
    courseId: 2,
    courseName: 'Full-Stack Web Development with React & Node.js',
    eventType: 'assignment',
    timeStart: daysFromNow(5, 23, 59),
  },
  {
    id: 1003,
    name: 'ส่งงาน: Thai Economic Data Analysis',
    description: 'ส่ง Jupyter notebook วิเคราะห์ข้อมูลเศรษฐกิจไทยจาก World Bank',
    courseId: 3,
    courseName: 'Data Science and Machine Learning Fundamentals',
    eventType: 'assignment',
    timeStart: daysFromNow(3, 23, 59),
  },
  {
    id: 1004,
    name: 'ส่งงาน: Digital Marketing Campaign Report',
    description: 'ส่งรายงานแผนการตลาดดิจิทัลสำหรับแบรนด์ไทย SME',
    courseId: 7,
    courseName: 'Digital Marketing Strategy and Analytics',
    eventType: 'assignment',
    timeStart: daysFromNow(7, 23, 59),
  },
  {
    id: 1005,
    name: 'ส่งงาน: Business English Presentation',
    description: 'นำเสนอ business proposal เป็นภาษาอังกฤษ 5-7 นาที',
    courseId: 10,
    courseName: 'Business English Communication',
    eventType: 'assignment',
    timeStart: daysFromNow(10, 23, 59),
  },
  {
    id: 1006,
    name: 'ส่งงาน: Final Project - Full-Stack Application',
    description: 'ส่ง Capstone project พร้อม GitHub repo, deployment URL และ presentation',
    courseId: 2,
    courseName: 'Full-Stack Web Development with React & Node.js',
    eventType: 'assignment',
    timeStart: daysFromNow(28, 23, 59),
  },
  // ---- Quizzes -------------------------------------------------------------
  {
    id: 2001,
    name: 'แบบทดสอบ: Python Control Flow Quiz',
    description: 'แบบทดสอบย่อย Module 2 ครอบคลุม if/else, loops, functions',
    courseId: 1,
    courseName: 'Introduction to Programming with Python',
    eventType: 'quiz',
    timeStart: daysFromNow(1, 10, 0),
    timeEnd: daysFromNow(1, 10, 30),
  },
  {
    id: 2002,
    name: 'แบบทดสอบ: JavaScript & React Quiz',
    description: 'แบบทดสอบ Week 3-5 ครอบคลุม ES6+ และ React fundamentals',
    courseId: 2,
    courseName: 'Full-Stack Web Development with React & Node.js',
    eventType: 'quiz',
    timeStart: daysFromNow(4, 14, 0),
    timeEnd: daysFromNow(4, 14, 45),
  },
  {
    id: 2003,
    name: 'สอบกลางภาค: Data Science & ML Fundamentals',
    description: 'สอบกลางภาคครอบคลุม NumPy, Pandas, EDA และ Supervised Learning',
    courseId: 3,
    courseName: 'Data Science and Machine Learning Fundamentals',
    eventType: 'quiz',
    timeStart: daysFromNow(14, 9, 0),
    timeEnd: daysFromNow(14, 10, 30),
  },
  {
    id: 2004,
    name: 'สอบกลางภาค: Introduction to Programming',
    description: 'สอบกลางภาค Python ครอบคลุม Module 1-4',
    courseId: 1,
    courseName: 'Introduction to Programming with Python',
    eventType: 'quiz',
    timeStart: daysFromNow(18, 9, 0),
    timeEnd: daysFromNow(18, 10, 30),
  },
  {
    id: 2005,
    name: 'แบบทดสอบ: Cybersecurity Fundamentals Quiz',
    description: 'แบบทดสอบ Week 2 ครอบคลุม Network Security basics',
    courseId: 4,
    courseName: 'Cybersecurity Essentials and Ethical Hacking',
    eventType: 'quiz',
    timeStart: daysFromNow(6, 13, 0),
    timeEnd: daysFromNow(6, 13, 30),
  },
  // ---- Events (lectures, webinars, workshops) ------------------------------
  {
    id: 3001,
    name: 'Live Session: Q&A Python Functions',
    description: 'ตอบคำถามสดเรื่อง functions และ recursion พร้อมแก้ปัญหา coding',
    courseId: 1,
    courseName: 'Introduction to Programming with Python',
    eventType: 'event',
    timeStart: daysFromNow(3, 18, 0),
    timeEnd: daysFromNow(3, 20, 0),
  },
  {
    id: 3002,
    name: 'Guest Lecture: UX at LINE Thailand',
    description: 'บรรยายพิเศษจาก Senior UX Designer จาก LINE Thailand',
    courseId: 17,
    courseName: 'UX/UI Design: Research, Prototyping & Usability',
    eventType: 'event',
    timeStart: daysFromNow(9, 14, 0),
    timeEnd: daysFromNow(9, 16, 0),
  },
  {
    id: 3003,
    name: 'Workshop: Figma Prototyping Hands-on',
    description: 'Workshop ทำ high-fidelity prototype ด้วย Figma ร่วมกัน',
    courseId: 17,
    courseName: 'UX/UI Design: Research, Prototyping & Usability',
    eventType: 'event',
    timeStart: daysFromNow(16, 9, 0),
    timeEnd: daysFromNow(16, 12, 0),
  },
  {
    id: 3004,
    name: 'Webinar: AI Trends in Thai Industry 2026',
    description: 'สัมมนาออนไลน์เรื่องแนวโน้ม AI ในอุตสาหกรรมไทย',
    courseId: 5,
    courseName: 'Artificial Intelligence and Deep Learning',
    eventType: 'event',
    timeStart: daysFromNow(12, 10, 0),
    timeEnd: daysFromNow(12, 12, 0),
  },
  // ---- Deadlines -----------------------------------------------------------
  {
    id: 4001,
    name: 'กำหนดส่ง: ลงทะเบียนวิชาเลือก Semester 2/2025',
    description: 'วันสุดท้ายของการลงทะเบียนวิชาเลือกรอบ 2',
    eventType: 'deadline',
    timeStart: daysFromNow(8, 23, 59),
  },
  {
    id: 4002,
    name: 'กำหนดส่ง: แบบประเมินรายวิชา CS101',
    description: 'กรุณาทำแบบประเมินรายวิชา Introduction to Programming ให้ครบ',
    courseId: 1,
    courseName: 'Introduction to Programming with Python',
    eventType: 'deadline',
    timeStart: daysFromNow(20, 23, 59),
  },
  {
    id: 4003,
    name: 'กำหนดส่ง: Credit Request for Professional Certificates',
    description: 'กำหนดยื่นคำขอเทียบโอนหน่วยกิตจากใบรับรองวิชาชีพ',
    eventType: 'deadline',
    timeStart: daysFromNow(25, 23, 59),
  },
];
