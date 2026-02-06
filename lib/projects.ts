import type { Language } from '@/lib/i18n/base-translations'

type LocalizedText = Record<Language, string>
type LocalizedList = Record<Language, string[]>

export type Project = {
  id: number
  slug: string
  title: LocalizedText
  sector: LocalizedText
  projectType: LocalizedText
  year: string
  status: LocalizedText
  client: LocalizedText
  location: LocalizedText
  cost: LocalizedText
  summary: LocalizedText
  details: LocalizedText
  methodology: LocalizedList
  images: string[]
}

export type LocalizedProject = {
  id: number
  slug: string
  title: string
  sector: string
  projectType: string
  year: string
  status: string
  client: string
  location: string
  cost: string
  summary: string
  details: string
  methodology: string[]
  images: string[]
}

export const projects: Project[] = [
  {
    id: 1,
    slug: 'al-hamra-tower',
    title: { en: 'Al-Hamra Tower', ar: 'برج الحمراء' },
    sector: { en: 'Commercial', ar: 'تجاري' },
    projectType: { en: 'General Contracting', ar: 'مقاولات عامة' },
    year: '2023',
    status: { en: 'Completed', ar: 'منجز' },
    client: { en: 'Private Development Partner', ar: 'شريك تطوير خاص' },
    location: { en: 'Kuwait City', ar: 'مدينة الكويت' },
    cost: { en: 'KWD 12M (est.)', ar: '12 مليون د.ك (تقريباً)' },
    summary: {
      en: 'High-rise commercial delivery with premium finishes and coordinated MEP works.',
      ar: 'تنفيذ برج تجاري مرتفع بتشطيبات مميزة وتنسيق أعمال الكهروميكانيك.',
    },
    details: {
      en: 'A landmark tower project delivered with disciplined schedule control, integrated subcontractor coordination, and detailed QA/QC gates. Scope included structure, architectural finishes, and full building services integration.',
      ar: 'مشروع برج بارز تم تنفيذه بضبط صارم للبرنامج الزمني وتنسيق متكامل للمقاولين وأنظمة جودة دقيقة. شمل النطاق الهيكل والتشطيبات المعمارية وتكامل أنظمة المبنى بالكامل.',
    },
    methodology: {
      en: [
        'Preconstruction planning and stakeholder alignment',
        'Procurement packages with long-lead tracking',
        'Daily site execution with QA/QC inspections',
        'Testing, commissioning, and handover documentation',
      ],
      ar: [
        'تخطيط ما قبل التنفيذ وتوحيد المتطلبات مع أصحاب المصلحة',
        'حزم مشتريات مع متابعة المواد طويلة التوريد',
        'تنفيذ يومي بالموقع مع فحوصات الجودة QA/QC',
        'اختبارات وتشغيل وتسليم مع وثائق كاملة',
      ],
    },
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
  },
  {
    id: 2,
    slug: 'marina-heights',
    title: { en: 'Marina Heights', ar: 'مارينا هايتس' },
    sector: { en: 'Residential', ar: 'سكني' },
    projectType: { en: 'Design-Build', ar: 'تصميم وتنفيذ' },
    year: '2022',
    status: { en: 'Completed', ar: 'منجز' },
    client: { en: 'Residential Developer', ar: 'مطوّر سكني' },
    location: { en: 'Salmiya', ar: 'السالمية' },
    cost: { en: 'KWD 8.5M (est.)', ar: '8.5 مليون د.ك (تقريباً)' },
    summary: {
      en: 'Residential towers delivered with safety-first logistics and predictable schedules.',
      ar: 'أبراج سكنية مع لوجستيات موقع آمنة وجداول زمنية واضحة.',
    },
    details: {
      en: 'Multi-building residential delivery with integrated design coordination, MEP routing, and phased handover. The team maintained resident-area safety controls, logistics planning, and structured snagging closeout.',
      ar: 'تنفيذ مبانٍ سكنية متعددة مع تنسيق تصميم متكامل ومسارات MEP وتسليم على مراحل. التزم الفريق بضوابط السلامة وخطة لوجستية محكمة وإغلاق ملاحظات التسليم بشكل منظم.',
    },
    methodology: {
      en: [
        'Design coordination workshops',
        'Phased mobilization and access planning',
        'Installation with progressive inspections',
        'Snagging, commissioning, and phased handover',
      ],
      ar: [
        'ورش تنسيق التصميم',
        'تجهيز تدريجي وخطة مداخل ومخارج',
        'تنفيذ وتركيب مع فحوصات مرحلية',
        'إغلاق الملاحظات والتشغيل والتسليم على مراحل',
      ],
    },
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
  },
  {
    id: 3,
    slug: 'kuwait-museum',
    title: { en: 'Kuwait Museum', ar: 'متحف الكويت' },
    sector: { en: 'Government', ar: 'حكومي' },
    projectType: { en: 'General Contracting', ar: 'مقاولات عامة' },
    year: '2023',
    status: { en: 'Completed', ar: 'منجز' },
    client: { en: 'Public Authority', ar: 'جهة حكومية' },
    location: { en: 'Kuwait City', ar: 'مدينة الكويت' },
    cost: { en: 'KWD 5.2M (est.)', ar: '5.2 مليون د.ك (تقريباً)' },
    summary: {
      en: 'Public project delivery focused on stakeholder coordination and quality assurance.',
      ar: 'تنفيذ مشروع عام مع تنسيق أصحاب المصلحة وضمان جودة عالية.',
    },
    details: {
      en: 'A cultural facility delivered with strict specification compliance, detailed finishing standards, and coordinated interface management across trades. Work included architectural finishes, accessibility improvements, and service upgrades.',
      ar: 'منشأة ثقافية نُفذت وفق مواصفات دقيقة ومعايير تشطيب عالية وتنسيق واجهات بين جميع التخصصات. شمل العمل التشطيبات المعمارية وتحسينات الوصول وترقيات الخدمات.',
    },
    methodology: {
      en: [
        'Scope alignment and shop-drawing approvals',
        'Material submittals and mockups for finishes',
        'Controlled execution with inspection gates',
        'Final QA walkdown and documentation handover',
      ],
      ar: [
        'توحيد النطاق واعتماد المخططات التنفيذية',
        'اعتمادات المواد ونماذج التشطيب',
        'تنفيذ منضبط مع مراحل فحص',
        'جولة جودة نهائية وتسليم الوثائق',
      ],
    },
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
  },
  {
    id: 4,
    slug: 'gateway-business',
    title: { en: 'Gateway Business', ar: 'بوابة الأعمال' },
    sector: { en: 'Commercial', ar: 'تجاري' },
    projectType: { en: 'MEP & Fit-Out', ar: 'كهروميكانيك وتشطيبات' },
    year: '2021',
    status: { en: 'Completed', ar: 'منجز' },
    client: { en: 'Business District Developer', ar: 'مطوّر منطقة أعمال' },
    location: { en: 'Sharq', ar: 'شرق' },
    cost: { en: 'KWD 3.6M (est.)', ar: '3.6 مليون د.ك (تقريباً)' },
    summary: {
      en: 'Commercial build with integrated planning, procurement tracking, and site reporting.',
      ar: 'مبنى تجاري مع تخطيط متكامل ومتابعة مشتريات وتقارير موقع.',
    },
    details: {
      en: 'Interior fit-out and systems integration delivered with tight coordination across mechanical, electrical, and architectural trades. Focused on operational readiness, testing, and punch-list closeout.',
      ar: 'تشطيبات داخلية وتكامل أنظمة نُفذت بتنسيق دقيق بين الأعمال الميكانيكية والكهربائية والمعمارية. تم التركيز على الجاهزية التشغيلية والاختبارات وإغلاق قائمة الملاحظات.',
    },
    methodology: {
      en: [
        'Interface coordination and sequencing',
        'MEP containment and first-fix works',
        'Finishes delivery with daily quality checks',
        'Systems testing and client handover training',
      ],
      ar: [
        'تنسيق الواجهات وترتيب الأعمال',
        'تنفيذ مسارات وتمديدات MEP والأعمال الأولية',
        'تنفيذ التشطيبات مع فحوصات جودة يومية',
        'اختبار الأنظمة وتدريب فريق العميل عند التسليم',
      ],
    },
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
  },
  {
    id: 5,
    slug: 'east-ring-road',
    title: { en: 'East Ring Road', ar: 'الطريق الدائري الشرقي' },
    sector: { en: 'Infrastructure', ar: 'بنية تحتية' },
    projectType: { en: 'Civil Works', ar: 'أعمال مدنية' },
    year: '2022',
    status: { en: 'Completed', ar: 'منجز' },
    client: { en: 'Government Infrastructure Program', ar: 'برنامج بنية تحتية حكومي' },
    location: { en: 'Kuwait', ar: 'الكويت' },
    cost: { en: 'KWD 14M (est.)', ar: '14 مليون د.ك (تقريباً)' },
    summary: {
      en: 'Civil works delivered with traffic management and utility coordination.',
      ar: 'أعمال مدنية مع إدارة حركة وتنسيق تحويلات المرافق.',
    },
    details: {
      en: 'Road works package including earthworks, asphalt paving, drainage works, and utility diversions. Delivery emphasized safe traffic management, night works planning, and staged commissioning.',
      ar: 'حزمة أعمال طرق تشمل الأعمال الترابية والرصف الأسفلتي وتصريف المياه وتحويلات المرافق. ركز التنفيذ على إدارة حركة آمنة وخطة أعمال ليلية وتشغيل تدريجي.',
    },
    methodology: {
      en: [
        'Traffic management planning and permits',
        'Utility survey and diversion sequencing',
        'Paving execution with material testing',
        'Staged commissioning and as-built delivery',
      ],
      ar: [
        'خطة إدارة الحركة والتصاريح',
        'حصر المرافق وجدولة التحويلات',
        'تنفيذ الرصف مع اختبارات المواد',
        'تشغيل تدريجي وتسليم المخططات النهائية',
      ],
    },
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
  },
  {
    id: 6,
    slug: 'energy-park',
    title: { en: 'Energy Park', ar: 'حديقة الطاقة' },
    sector: { en: 'Industrial', ar: 'صناعي' },
    projectType: { en: 'Infrastructure', ar: 'بنية تحتية' },
    year: '2024',
    status: { en: 'Completed', ar: 'منجز' },
    client: { en: 'Industrial Operator', ar: 'مشغّل صناعي' },
    location: { en: 'Shuaiba', ar: 'الشعيبة' },
    cost: { en: 'KWD 9.8M (est.)', ar: '9.8 مليون د.ك (تقريباً)' },
    summary: {
      en: 'Industrial infrastructure enabling reliable operations and safe site handover.',
      ar: 'بنية تحتية صناعية لدعم التشغيل وتسليم آمن للموقع.',
    },
    details: {
      en: 'Industrial enabling works covering site preparation, utilities, and support facilities. Delivered with strict HSE controls, coordination with plant operations, and detailed commissioning checklists.',
      ar: 'أعمال تمهيدية صناعية تشمل تجهيز الموقع والمرافق والمباني الداعمة. تم التنفيذ بضوابط سلامة صارمة وتنسيق مع التشغيل وقوائم تشغيل تفصيلية.',
    },
    methodology: {
      en: [
        'Site enabling and risk assessments',
        'Utilities routing and tie-in planning',
        'Execution with HSE supervision and QA checks',
        'Commissioning support and documentation',
      ],
      ar: [
        'تجهيز الموقع وتقييم المخاطر',
        'تخطيط مسارات المرافق ونقاط الربط',
        'تنفيذ بإشراف سلامة وفحوصات جودة',
        'دعم التشغيل والتوثيق',
      ],
    },
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
  },
  {
    id: 7,
    slug: 'shuwaikh-logistics-hub',
    title: { en: 'Shuwaikh Logistics Hub', ar: 'مركز الشويخ اللوجستي' },
    sector: { en: 'Infrastructure', ar: 'بنية تحتية' },
    projectType: { en: 'Design-Build', ar: 'تصميم وتنفيذ' },
    year: '2026',
    status: { en: 'Ongoing', ar: 'قيد التنفيذ' },
    client: { en: 'Logistics Operator', ar: 'مشغّل لوجستي' },
    location: { en: 'Shuwaikh', ar: 'الشويخ' },
    cost: { en: 'KWD 18M (est.)', ar: '18 مليون د.ك (تقريباً)' },
    summary: {
      en: 'Warehouse and yard development with integrated fire systems and fleet circulation upgrades.',
      ar: 'تطوير مستودعات وساحات مع أنظمة مكافحة الحريق وتحسين حركة الأسطول.',
    },
    details: {
      en: 'A multi-phase logistics hub program delivering warehouse capacity, yard improvements, and integrated life-safety systems. Work includes phased handover to maintain operations during construction.',
      ar: 'برنامج متعدد المراحل لمركز لوجستي يضم توسعة مستودعات وتحسين الساحات وتكامل أنظمة السلامة. يشمل العمل تسليمًا مرحليًا للحفاظ على التشغيل أثناء التنفيذ.',
    },
    methodology: {
      en: [
        'Phased construction plan to maintain operations',
        'Fire and life safety system coordination',
        'Warehouse fit-out and yard circulation sequencing',
        'Progressive handover and commissioning',
      ],
      ar: [
        'خطة تنفيذ مرحلية للحفاظ على التشغيل',
        'تنسيق أنظمة مكافحة الحريق وسلامة الحياة',
        'تسلسل أعمال تجهيز المستودعات وحركة الساحات',
        'تسليم وتشغيل تدريجي',
      ],
    },
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
  },
  {
    id: 8,
    slug: 'moh-clinic-expansion',
    title: { en: 'Ministry of Health Clinic Expansion', ar: 'توسعة عيادة وزارة الصحة' },
    sector: { en: 'Healthcare', ar: 'رعاية صحية' },
    projectType: { en: 'Renovation & Expansion', ar: 'تجديد وتوسعة' },
    year: '2025',
    status: { en: 'Completed', ar: 'منجز' },
    client: { en: 'Ministry of Health', ar: 'وزارة الصحة' },
    location: { en: 'Kuwait', ar: 'الكويت' },
    cost: { en: 'KWD 2.4M (est.)', ar: '2.4 مليون د.ك (تقريباً)' },
    summary: {
      en: 'Outpatient expansion with MEP upgrades and accessibility improvements for patients and staff.',
      ar: 'توسعة عيادات خارجية مع تحديثات MEP وتحسينات وصول للمرضى والموظفين.',
    },
    details: {
      en: 'Healthcare renovation and expansion delivered with infection control measures, phased work planning, and strict quality requirements. Included MEP upgrades, accessibility improvements, and patient flow enhancements.',
      ar: 'تجديد وتوسعة منشأة صحية مع تطبيق إجراءات مكافحة العدوى وخطة تنفيذ مرحلية ومتطلبات جودة صارمة. شمل تحديثات MEP وتحسينات الوصول وتطوير مسارات المرضى.',
    },
    methodology: {
      en: [
        'Infection control plan and sequencing',
        'MEP upgrades and system testing',
        'Finishes delivered to healthcare standards',
        'Commissioning and staff handover support',
      ],
      ar: [
        'خطة مكافحة العدوى وتسلسل الأعمال',
        'تحديثات MEP واختبارات الأنظمة',
        'تشطيبات وفق معايير المنشآت الصحية',
        'تشغيل ودعم تسليم للكوادر',
      ],
    },
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
  },
  {
    id: 9,
    slug: 'sabah-al-ahmad-housing',
    title: { en: 'Sabah Al-Ahmad City Housing', ar: 'مشروع مدينة صباح الأحمد السكني' },
    sector: { en: 'Residential', ar: 'سكني' },
    projectType: { en: 'Civil & Building Works', ar: 'أعمال مدنية ومبانٍ' },
    year: '2022',
    status: { en: 'Completed', ar: 'منجز' },
    client: { en: 'Public Housing Authority', ar: 'جهة إسكان حكومية' },
    location: { en: 'Sabah Al-Ahmad City', ar: 'مدينة صباح الأحمد' },
    cost: { en: 'KWD 22M (est.)', ar: '22 مليون د.ك (تقريباً)' },
    summary: {
      en: 'Housing program delivery with utilities, roadworks, and phased community handover.',
      ar: 'تنفيذ برنامج إسكان مع مرافق وطرق وتسليم مجتمعات على مراحل.',
    },
    details: {
      en: 'A residential community program including building works and enabling infrastructure. Delivered through phased zones with coordinated utility tie-ins, roadworks, and structured handover packages.',
      ar: 'برنامج سكني يشمل أعمال مبانٍ وبنية تحتية تمهيدية. تم التنفيذ عبر مناطق مرحلية مع تنسيق ربط المرافق وأعمال الطرق وحزم تسليم منظمة.',
    },
    methodology: {
      en: [
        'Zone-based planning and procurement',
        'Utilities installation and tie-in coordination',
        'Building works with QA/QC checkpoints',
        'Phased community handover and closeout',
      ],
      ar: [
        'تخطيط مرحلي حسب المناطق والمشتريات',
        'تنفيذ المرافق وتنسيق نقاط الربط',
        'أعمال المباني مع نقاط فحص جودة',
        'تسليم مرحلي للمجتمع وإغلاق الأعمال',
      ],
    },
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
  },
  {
    id: 10,
    slug: 'national-orascom',
    title: { en: 'National Orascom', ar: 'ناشونال أوراسكوم' },
    sector: { en: 'Industrial', ar: 'صناعي' },
    projectType: { en: 'General Contracting', ar: 'مقاولات عامة' },
    year: '2024',
    status: { en: 'Completed', ar: 'منجز' },
    client: { en: 'National Orascom', ar: 'ناشونال أوراسكوم' },
    location: { en: 'Kuwait', ar: 'الكويت' },
    cost: { en: 'Confidential', ar: 'سري' },
    summary: {
      en: 'Industrial delivery supported by disciplined planning, safety-first execution, and clear handover documentation.',
      ar: 'تنفيذ أعمال صناعية بدعم من تخطيط منضبط، سلامة أولاً، ووثائق تسليم واضحة.',
    },
    details: {
      en: 'A multi-discipline delivery focused on schedule control, interface coordination, and quality gates across scope packages. Final scope, values, and dates can be tailored to your case study.',
      ar: 'تنفيذ متعدد التخصصات يركز على التحكم بالجدول الزمني، تنسيق الواجهات، وضوابط الجودة عبر حزم نطاق العمل. يمكن تخصيص نطاق المشروع والقيم والتواريخ حسب دراسة الحالة الخاصة بكم.',
    },
    methodology: {
      en: [
        'Preconstruction planning and risk review',
        'Interface coordination across disciplines',
        'QA/QC inspections and milestone reporting',
        'Testing, commissioning, and handover',
      ],
      ar: [
        'تخطيط ما قبل التنفيذ ومراجعة المخاطر',
        'تنسيق الواجهات بين التخصصات',
        'فحوصات الجودة والتقارير المرحلية',
        'الاختبارات والتشغيل والتسليم',
      ],
    },
    images: ['/projects/national-orascom.png', '/placeholder.jpg', '/placeholder.jpg'],
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

export function localizeProject(project: Project, language: Language): LocalizedProject {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title[language],
    sector: project.sector[language],
    projectType: project.projectType[language],
    year: project.year,
    status: project.status[language],
    client: project.client[language],
    location: project.location[language],
    cost: project.cost[language],
    summary: project.summary[language],
    details: project.details[language],
    methodology: project.methodology[language],
    images: project.images,
  }
}

export function getLocalizedProjects(language: Language): LocalizedProject[] {
  return projects.map((project) => localizeProject(project, language))
}

export function getLocalizedProjectBySlug(slug: string, language: Language): LocalizedProject | undefined {
  const project = getProjectBySlug(slug)
  return project ? localizeProject(project, language) : undefined
}
