import type { LearningPlan } from '@/hooks/useLearningPlans';

// ---------------------------------------------------------------------------
// DATE HELPERS (file-local, no export)
// ---------------------------------------------------------------------------

function daysFromNow(n: number): string {
  const d = new Date('2026-02-24T00:00:00.000Z');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0]!;
}

function daysAgo(n: number): string {
  return daysFromNow(-n);
}

// ---------------------------------------------------------------------------
// MOCK LEARNING PLANS
// ---------------------------------------------------------------------------

export const MOCK_LEARNING_PLANS: LearningPlan[] = [
  {
    id: 1,
    name: 'แผนพัฒนาทักษะนักพัฒนาซอฟต์แวร์ (Junior Developer Track)',
    description:
      'แผนการเรียนรู้สำหรับนักศึกษาที่ต้องการเป็น Junior Software Developer ครอบคลุมทักษะ Programming, Web Development, Database และ DevOps พื้นฐาน',
    userId: 11,
    templateId: 1,
    status: 'active',
    dueDate: daysFromNow(120),
    overallProgress: 42,
    createdAt: daysAgo(60),
  },
  {
    id: 2,
    name: 'แผนพัฒนานักวิทยาศาสตร์ข้อมูล (Data Science Pathway)',
    description:
      'แผนการเรียนรู้ครบวงจรสำหรับ Data Scientist เริ่มจากสถิติและ Python ไปจนถึง Machine Learning และ Deep Learning พร้อมการ deploy โมเดลบน Cloud',
    userId: 13,
    templateId: 2,
    status: 'active',
    dueDate: daysFromNow(180),
    overallProgress: 28,
    createdAt: daysAgo(45),
  },
  {
    id: 3,
    name: 'แผนเสริมสร้างทักษะภาษาอังกฤษธุรกิจ',
    description:
      'แผนพัฒนาทักษะภาษาอังกฤษสำหรับสภาพแวดล้อมธุรกิจระดับสากล ครอบคลุมการเขียน การพูด การฟัง และการอ่านเอกสารธุรกิจ',
    userId: 18,
    templateId: 3,
    status: 'complete',
    dueDate: daysAgo(10),
    overallProgress: 100,
    createdAt: daysAgo(130),
    completedAt: daysAgo(12),
  },
  {
    id: 4,
    name: 'แผนพัฒนาผู้จัดการโครงการ (PMP Preparation)',
    description:
      'แผนเตรียมความพร้อมสำหรับการสอบ PMP Certification ครอบคลุม PMBOK Guide, Agile Practices และ Case Studies จากโครงการจริงในไทย',
    userId: 14,
    status: 'waiting_for_review',
    dueDate: daysFromNow(60),
    overallProgress: 75,
    createdAt: daysAgo(90),
  },
  {
    id: 5,
    name: 'แผนพัฒนาทักษะการตลาดดิจิทัล',
    description:
      'แผนครอบคลุมทักษะ Digital Marketing สมัยใหม่ ตั้งแต่ Content Creation, SEO/SEM, Social Media Management ไปจนถึง Data Analytics สำหรับนักการตลาด',
    userId: 16,
    templateId: 1,
    status: 'draft',
    dueDate: daysFromNow(90),
    overallProgress: 0,
    createdAt: daysAgo(5),
  },
  {
    id: 6,
    name: 'แผนพัฒนาความเชี่ยวชาญด้าน Cybersecurity',
    description:
      'แผนพัฒนาทักษะความปลอดภัยไซเบอร์ระดับมืออาชีพ ครอบคลุม Network Security, Penetration Testing, Incident Response และ Security Compliance',
    userId: 20,
    templateId: 2,
    status: 'in_review',
    dueDate: daysFromNow(150),
    overallProgress: 15,
    createdAt: daysAgo(20),
  },
  {
    id: 7,
    name: 'แผนพัฒนาทักษะผู้นำองค์กร (Leadership Development)',
    description:
      'แผนพัฒนาภาวะผู้นำสำหรับผู้บริหารระดับกลาง ครอบคลุม Leadership Styles, Change Management, Strategic Thinking และ Executive Communication',
    userId: 23,
    templateId: 3,
    status: 'active',
    dueDate: daysFromNow(45),
    overallProgress: 66,
    createdAt: daysAgo(75),
  },
];
