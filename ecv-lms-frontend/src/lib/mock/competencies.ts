import type {
  CompetencyFramework,
  Competency,
  PlanTemplate,
  ProficiencyLevel,
} from '@/hooks/useCompetencies';

// ---------------------------------------------------------------------------
// SHARED PROFICIENCY SCALES
// ---------------------------------------------------------------------------

const STANDARD_SCALE: ProficiencyLevel[] = [
  { id: 1, name: 'ไม่มีความรู้ (No Knowledge)', sortOrder: 1, isDefault: true, isProficient: false },
  { id: 2, name: 'ผู้เริ่มต้น (Beginner)', sortOrder: 2, isDefault: false, isProficient: false },
  { id: 3, name: 'ปานกลาง (Intermediate)', sortOrder: 3, isDefault: false, isProficient: true },
  { id: 4, name: 'ชำนาญการ (Proficient)', sortOrder: 4, isDefault: false, isProficient: true },
  { id: 5, name: 'เชี่ยวชาญ (Expert)', sortOrder: 5, isDefault: false, isProficient: true },
];

const LANGUAGE_SCALE: ProficiencyLevel[] = [
  { id: 11, name: 'A1 - Beginner', sortOrder: 1, isDefault: true, isProficient: false },
  { id: 12, name: 'A2 - Elementary', sortOrder: 2, isDefault: false, isProficient: false },
  { id: 13, name: 'B1 - Intermediate', sortOrder: 3, isDefault: false, isProficient: true },
  { id: 14, name: 'B2 - Upper-Intermediate', sortOrder: 4, isDefault: false, isProficient: true },
  { id: 15, name: 'C1 - Advanced', sortOrder: 5, isDefault: false, isProficient: true },
  { id: 16, name: 'C2 - Proficient', sortOrder: 6, isDefault: false, isProficient: true },
];

const ACADEMIC_SCALE: ProficiencyLevel[] = [
  { id: 21, name: 'ต้องปรับปรุง (Needs Improvement)', sortOrder: 1, isDefault: true, isProficient: false },
  { id: 22, name: 'ผ่านเกณฑ์ (Meets Standard)', sortOrder: 2, isDefault: false, isProficient: true },
  { id: 23, name: 'ดี (Good)', sortOrder: 3, isDefault: false, isProficient: true },
  { id: 24, name: 'ดีเยี่ยม (Excellent)', sortOrder: 4, isDefault: false, isProficient: true },
  { id: 25, name: 'โดดเด่น (Distinguished)', sortOrder: 5, isDefault: false, isProficient: true },
];

// ---------------------------------------------------------------------------
// MOCK FRAMEWORKS
// ---------------------------------------------------------------------------

export const MOCK_FRAMEWORKS: CompetencyFramework[] = [
  {
    id: 1,
    shortname: 'DL-2025',
    name: 'Digital Literacy Framework 2025',
    description:
      'กรอบสมรรถนะด้านความสามารถดิจิทัลสำหรับนักศึกษาและบุคลากรในยุคเศรษฐกิจดิจิทัล ครอบคลุมทักษะการใช้เทคโนโลยี การรักษาความปลอดภัย และการสร้างสรรค์นวัตกรรม',
    competencyCount: 12,
    linkedCourseCount: 7,
    proficiencyScale: STANDARD_SCALE,
  },
  {
    id: 2,
    shortname: 'PS-2025',
    name: 'Professional Skills Framework 2025',
    description:
      'กรอบสมรรถนะทักษะวิชาชีพที่จำเป็นสำหรับตลาดแรงงานในศตวรรษที่ 21 ประกอบด้วยทักษะการสื่อสาร การทำงานเป็นทีม การคิดวิเคราะห์ และความเป็นผู้นำ',
    competencyCount: 10,
    linkedCourseCount: 9,
    proficiencyScale: LANGUAGE_SCALE,
  },
  {
    id: 3,
    shortname: 'AE-2025',
    name: 'Academic Excellence Framework 2025',
    description:
      'กรอบสมรรถนะความเป็นเลิศทางวิชาการสำหรับสถาบันการศึกษา ครอบคลุมทักษะการคิดเชิงวิพากษ์ การวิจัย การแก้ปัญหาเชิงสร้างสรรค์ และจริยธรรมทางวิชาการ',
    competencyCount: 9,
    linkedCourseCount: 11,
    proficiencyScale: ACADEMIC_SCALE,
  },
];

// ---------------------------------------------------------------------------
// MOCK COMPETENCIES (tree per framework)
// ---------------------------------------------------------------------------

export const MOCK_COMPETENCIES: Record<number, Competency[]> = {
  1: [
    // Digital Literacy Framework
    {
      id: 101,
      shortname: 'DL-TECH',
      name: 'ทักษะการใช้เทคโนโลยีดิจิทัล',
      description: 'ความสามารถในการใช้งานเครื่องมือและเทคโนโลยีดิจิทัลอย่างมีประสิทธิภาพ',
      frameworkId: 1,
      parentId: null,
      sortOrder: 1,
      children: [
        {
          id: 1011,
          shortname: 'DL-TECH-PROG',
          name: 'การเขียนโปรแกรมและพัฒนาซอฟต์แวร์',
          description: 'ทักษะการเขียนโค้ดและพัฒนาแอปพลิเคชัน',
          frameworkId: 1,
          parentId: 101,
          sortOrder: 1,
          children: [],
        },
        {
          id: 1012,
          shortname: 'DL-TECH-DATA',
          name: 'การจัดการและวิเคราะห์ข้อมูล',
          description: 'ทักษะการเก็บรวบรวม จัดการ และวิเคราะห์ข้อมูลดิจิทัล',
          frameworkId: 1,
          parentId: 101,
          sortOrder: 2,
          children: [],
        },
        {
          id: 1013,
          shortname: 'DL-TECH-CLOUD',
          name: 'Cloud Computing และ Infrastructure',
          description: 'ความเข้าใจและการใช้บริการ Cloud',
          frameworkId: 1,
          parentId: 101,
          sortOrder: 3,
          children: [],
        },
      ],
    },
    {
      id: 102,
      shortname: 'DL-SEC',
      name: 'ความปลอดภัยและจริยธรรมดิจิทัล',
      description: 'ความสามารถในการรักษาความปลอดภัยทางไซเบอร์และประพฤติตนอย่างมีจริยธรรมในโลกดิจิทัล',
      frameworkId: 1,
      parentId: null,
      sortOrder: 2,
      children: [
        {
          id: 1021,
          shortname: 'DL-SEC-CYBER',
          name: 'ความปลอดภัยไซเบอร์',
          description: 'ทักษะการป้องกันและรับมือภัยคุกคามไซเบอร์',
          frameworkId: 1,
          parentId: 102,
          sortOrder: 1,
          children: [],
        },
        {
          id: 1022,
          shortname: 'DL-SEC-PRIV',
          name: 'การคุ้มครองข้อมูลส่วนบุคคล',
          description: 'ความเข้าใจ PDPA และการปกป้องความเป็นส่วนตัว',
          frameworkId: 1,
          parentId: 102,
          sortOrder: 2,
          children: [],
        },
      ],
    },
    {
      id: 103,
      shortname: 'DL-INNOV',
      name: 'นวัตกรรมและความคิดสร้างสรรค์ดิจิทัล',
      description: 'ความสามารถในการสร้างสรรค์และประยุกต์ใช้เทคโนโลยีเพื่อสร้างนวัตกรรม',
      frameworkId: 1,
      parentId: null,
      sortOrder: 3,
      children: [
        {
          id: 1031,
          shortname: 'DL-INNOV-AI',
          name: 'AI และ Machine Learning Application',
          description: 'การประยุกต์ใช้ AI ในการแก้ปัญหาจริง',
          frameworkId: 1,
          parentId: 103,
          sortOrder: 1,
          children: [],
        },
        {
          id: 1032,
          shortname: 'DL-INNOV-DESIGN',
          name: 'Digital Design Thinking',
          description: 'กระบวนการ design thinking ในบริบทดิจิทัล',
          frameworkId: 1,
          parentId: 103,
          sortOrder: 2,
          children: [],
        },
      ],
    },
  ],
  2: [
    // Professional Skills Framework
    {
      id: 201,
      shortname: 'PS-COMM',
      name: 'ทักษะการสื่อสาร',
      description: 'ความสามารถในการสื่อสารอย่างมีประสิทธิภาพในบริบทวิชาชีพ',
      frameworkId: 2,
      parentId: null,
      sortOrder: 1,
      children: [
        {
          id: 2011,
          shortname: 'PS-COMM-EN',
          name: 'การสื่อสารภาษาอังกฤษ',
          description: 'ทักษะการใช้ภาษาอังกฤษในสภาพแวดล้อมวิชาชีพ',
          frameworkId: 2,
          parentId: 201,
          sortOrder: 1,
          children: [],
        },
        {
          id: 2012,
          shortname: 'PS-COMM-PRES',
          name: 'การนำเสนอและการพูดในที่สาธารณะ',
          description: 'ทักษะการนำเสนองานและการพูดต่อหน้าที่ประชุม',
          frameworkId: 2,
          parentId: 201,
          sortOrder: 2,
          children: [],
        },
        {
          id: 2013,
          shortname: 'PS-COMM-WRITE',
          name: 'การเขียนเชิงวิชาชีพ',
          description: 'ทักษะการเขียนรายงาน อีเมล และเอกสารทางธุรกิจ',
          frameworkId: 2,
          parentId: 201,
          sortOrder: 3,
          children: [],
        },
      ],
    },
    {
      id: 202,
      shortname: 'PS-LEAD',
      name: 'ภาวะผู้นำและการทำงานเป็นทีม',
      description: 'ความสามารถในการนำทีมและทำงานร่วมกับผู้อื่นอย่างมีประสิทธิภาพ',
      frameworkId: 2,
      parentId: null,
      sortOrder: 2,
      children: [
        {
          id: 2021,
          shortname: 'PS-LEAD-TEAM',
          name: 'การทำงานเป็นทีม',
          description: 'ทักษะการทำงานร่วมกับผู้อื่นและการบริหารความขัดแย้ง',
          frameworkId: 2,
          parentId: 202,
          sortOrder: 1,
          children: [],
        },
        {
          id: 2022,
          shortname: 'PS-LEAD-MGT',
          name: 'การบริหารจัดการโครงการ',
          description: 'ทักษะการวางแผนและบริหารโครงการ',
          frameworkId: 2,
          parentId: 202,
          sortOrder: 2,
          children: [],
        },
      ],
    },
    {
      id: 203,
      shortname: 'PS-THINK',
      name: 'การคิดวิเคราะห์และแก้ปัญหา',
      description: 'ความสามารถในการวิเคราะห์ปัญหาและหาแนวทางแก้ไขอย่างเป็นระบบ',
      frameworkId: 2,
      parentId: null,
      sortOrder: 3,
      children: [
        {
          id: 2031,
          shortname: 'PS-THINK-CRIT',
          name: 'Critical Thinking',
          description: 'การคิดเชิงวิพากษ์และการตัดสินใจอย่างมีเหตุผล',
          frameworkId: 2,
          parentId: 203,
          sortOrder: 1,
          children: [],
        },
        {
          id: 2032,
          shortname: 'PS-THINK-DATA',
          name: 'Data-Driven Decision Making',
          description: 'การตัดสินใจโดยอาศัยข้อมูลและหลักฐาน',
          frameworkId: 2,
          parentId: 203,
          sortOrder: 2,
          children: [],
        },
      ],
    },
  ],
  3: [
    // Academic Excellence Framework
    {
      id: 301,
      shortname: 'AE-RESEARCH',
      name: 'ทักษะการวิจัยและการเรียนรู้',
      description: 'ความสามารถในการสืบค้น วิเคราะห์ และสังเคราะห์ความรู้จากแหล่งข้อมูลต่าง ๆ',
      frameworkId: 3,
      parentId: null,
      sortOrder: 1,
      children: [
        {
          id: 3011,
          shortname: 'AE-RESEARCH-METHOD',
          name: 'ระเบียบวิธีวิจัย',
          description: 'ทักษะการออกแบบและดำเนินการวิจัย',
          frameworkId: 3,
          parentId: 301,
          sortOrder: 1,
          children: [],
        },
        {
          id: 3012,
          shortname: 'AE-RESEARCH-STAT',
          name: 'การวิเคราะห์ข้อมูลเชิงสถิติ',
          description: 'การใช้สถิติในการวิเคราะห์ผลการวิจัย',
          frameworkId: 3,
          parentId: 301,
          sortOrder: 2,
          children: [],
        },
      ],
    },
    {
      id: 302,
      shortname: 'AE-ETHICS',
      name: 'จริยธรรมและความซื่อสัตย์ทางวิชาการ',
      description: 'ความเข้าใจและการปฏิบัติตามหลักจริยธรรมในงานวิชาการและวิชาชีพ',
      frameworkId: 3,
      parentId: null,
      sortOrder: 2,
      children: [
        {
          id: 3021,
          shortname: 'AE-ETHICS-ACAD',
          name: 'จริยธรรมทางวิชาการ',
          description: 'การอ้างอิงที่ถูกต้องและการป้องกันการโจรกรรมทางวิชาการ',
          frameworkId: 3,
          parentId: 302,
          sortOrder: 1,
          children: [],
        },
        {
          id: 3022,
          shortname: 'AE-ETHICS-PROF',
          name: 'จริยธรรมวิชาชีพ',
          description: 'มาตรฐานจรรยาบรรณในการปฏิบัติวิชาชีพ',
          frameworkId: 3,
          parentId: 302,
          sortOrder: 2,
          children: [],
        },
      ],
    },
    {
      id: 303,
      shortname: 'AE-INNOV',
      name: 'นวัตกรรมและความคิดสร้างสรรค์',
      description: 'ความสามารถในการคิดนอกกรอบและสร้างสรรค์แนวทางใหม่ในการแก้ปัญหา',
      frameworkId: 3,
      parentId: null,
      sortOrder: 3,
      children: [
        {
          id: 3031,
          shortname: 'AE-INNOV-CREATE',
          name: 'ความคิดสร้างสรรค์',
          description: 'การสร้างแนวคิดและนวัตกรรมใหม่',
          frameworkId: 3,
          parentId: 303,
          sortOrder: 1,
          children: [],
        },
        {
          id: 3032,
          shortname: 'AE-INNOV-ENTREP',
          name: 'ความเป็นผู้ประกอบการ',
          description: 'ทักษะการคิดเชิงผู้ประกอบการและการสร้าง startup',
          frameworkId: 3,
          parentId: 303,
          sortOrder: 2,
          children: [],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// MOCK PLAN TEMPLATES
// ---------------------------------------------------------------------------

export const MOCK_TEMPLATES: PlanTemplate[] = [
  {
    id: 1,
    name: 'Software Developer Career Track',
    description:
      'แผนแม่แบบสำหรับนักพัฒนาซอฟต์แวร์ ครอบคลุมสมรรถนะด้าน Digital Literacy และ Professional Skills ที่จำเป็นสำหรับการทำงานในอุตสาหกรรม Tech',
    dueDateMode: 'relative',
    relativeDueDays: 180,
    competencies: [
      {
        competencyId: 1011,
        competencyName: 'การเขียนโปรแกรมและพัฒนาซอฟต์แวร์',
        frameworkName: 'Digital Literacy Framework 2025',
        requiredProficiencyLevel: 4,
        sortOrder: 1,
      },
      {
        competencyId: 1012,
        competencyName: 'การจัดการและวิเคราะห์ข้อมูล',
        frameworkName: 'Digital Literacy Framework 2025',
        requiredProficiencyLevel: 3,
        sortOrder: 2,
      },
      {
        competencyId: 1021,
        competencyName: 'ความปลอดภัยไซเบอร์',
        frameworkName: 'Digital Literacy Framework 2025',
        requiredProficiencyLevel: 3,
        sortOrder: 3,
      },
      {
        competencyId: 2021,
        competencyName: 'การทำงานเป็นทีม',
        frameworkName: 'Professional Skills Framework 2025',
        requiredProficiencyLevel: 4,
        sortOrder: 4,
      },
      {
        competencyId: 2022,
        competencyName: 'การบริหารจัดการโครงการ',
        frameworkName: 'Professional Skills Framework 2025',
        requiredProficiencyLevel: 3,
        sortOrder: 5,
      },
    ],
    assignedUserCount: 28,
    assignedCohortCount: 2,
    status: 'active',
  },
  {
    id: 2,
    name: 'Data Science Professional Pathway',
    description:
      'แผนแม่แบบสำหรับนักวิทยาศาสตร์ข้อมูล เน้นสมรรถนะด้าน Digital Literacy เพื่อการวิเคราะห์ข้อมูล การสร้างโมเดล ML และการนำเสนอผลลัพธ์เชิงธุรกิจ',
    dueDateMode: 'relative',
    relativeDueDays: 240,
    competencies: [
      {
        competencyId: 1012,
        competencyName: 'การจัดการและวิเคราะห์ข้อมูล',
        frameworkName: 'Digital Literacy Framework 2025',
        requiredProficiencyLevel: 5,
        sortOrder: 1,
      },
      {
        competencyId: 1031,
        competencyName: 'AI และ Machine Learning Application',
        frameworkName: 'Digital Literacy Framework 2025',
        requiredProficiencyLevel: 4,
        sortOrder: 2,
      },
      {
        competencyId: 2031,
        competencyName: 'Critical Thinking',
        frameworkName: 'Professional Skills Framework 2025',
        requiredProficiencyLevel: 4,
        sortOrder: 3,
      },
      {
        competencyId: 2032,
        competencyName: 'Data-Driven Decision Making',
        frameworkName: 'Professional Skills Framework 2025',
        requiredProficiencyLevel: 4,
        sortOrder: 4,
      },
      {
        competencyId: 3012,
        competencyName: 'การวิเคราะห์ข้อมูลเชิงสถิติ',
        frameworkName: 'Academic Excellence Framework 2025',
        requiredProficiencyLevel: 4,
        sortOrder: 5,
      },
    ],
    assignedUserCount: 15,
    assignedCohortCount: 1,
    status: 'active',
  },
  {
    id: 3,
    name: 'Business Professional Foundation',
    description:
      'แผนแม่แบบพื้นฐานสำหรับนักธุรกิจและผู้บริหาร เน้นสมรรถนะด้านการสื่อสาร ภาวะผู้นำ การตัดสินใจ และจริยธรรมวิชาชีพ',
    dueDateMode: 'fixed',
    dueDate: '2026-12-31',
    competencies: [
      {
        competencyId: 2011,
        competencyName: 'การสื่อสารภาษาอังกฤษ',
        frameworkName: 'Professional Skills Framework 2025',
        requiredProficiencyLevel: 4,
        sortOrder: 1,
      },
      {
        competencyId: 2012,
        competencyName: 'การนำเสนอและการพูดในที่สาธารณะ',
        frameworkName: 'Professional Skills Framework 2025',
        requiredProficiencyLevel: 3,
        sortOrder: 2,
      },
      {
        competencyId: 2013,
        competencyName: 'การเขียนเชิงวิชาชีพ',
        frameworkName: 'Professional Skills Framework 2025',
        requiredProficiencyLevel: 4,
        sortOrder: 3,
      },
      {
        competencyId: 2022,
        competencyName: 'การบริหารจัดการโครงการ',
        frameworkName: 'Professional Skills Framework 2025',
        requiredProficiencyLevel: 3,
        sortOrder: 4,
      },
      {
        competencyId: 3021,
        competencyName: 'จริยธรรมทางวิชาการ',
        frameworkName: 'Academic Excellence Framework 2025',
        requiredProficiencyLevel: 3,
        sortOrder: 5,
      },
      {
        competencyId: 3022,
        competencyName: 'จริยธรรมวิชาชีพ',
        frameworkName: 'Academic Excellence Framework 2025',
        requiredProficiencyLevel: 4,
        sortOrder: 6,
      },
    ],
    assignedUserCount: 42,
    assignedCohortCount: 3,
    status: 'active',
  },
];
