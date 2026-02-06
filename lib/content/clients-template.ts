import type { Language } from '@/lib/i18n/base-translations'

export type ClientsStatTemplate = { value: string; label: Record<Language, string> }
export type ClientsSegmentTemplate = { title: Record<Language, string>; description: Record<Language, string> }
export type ClientsTestimonialTemplate = {
  quote: Record<Language, string>
  name: Record<Language, string>
  role: Record<Language, string>
}

export type ClientsSettingsTemplate = {
  eyebrow: Record<Language, string>
  title: Record<Language, string>
  subtitle: Record<Language, string>
  primaryAction: Record<Language, string>
  secondaryAction: Record<Language, string>
  introTitle: Record<Language, string>
  intro: Record<Language, string>
  segmentsTitle: Record<Language, string>
  testimonialsTitle: Record<Language, string>
  logosTitle: Record<Language, string>
  logosIntro: Record<Language, string>
  ctaTitle: Record<Language, string>
  ctaDesc: Record<Language, string>
  ctaButton: Record<Language, string>
  stats: ClientsStatTemplate[]
  segments: ClientsSegmentTemplate[]
  testimonials: ClientsTestimonialTemplate[]
  logosText: Record<Language, string>[]
}

export const clientsTemplate: ClientsSettingsTemplate = {
  eyebrow: { en: 'Client Network', ar: 'شبكة العملاء' },
  title: { en: 'Clients', ar: 'العملاء' },
  subtitle: {
    en: 'Trusted by public agencies, developers, and operators across Kuwait.',
    ar: 'موثوقون لدى الجهات الحكومية والمطورين والمشغلين في الكويت.',
  },
  primaryAction: { en: 'Request a quotation', ar: 'اطلب عرض سعر' },
  secondaryAction: { en: 'Contact our team', ar: 'تواصل مع فريقنا' },
  introTitle: { en: 'Built for long-term partnerships', ar: 'شراكات طويلة الأمد' },
  intro: {
    en: 'ACT supports ministries, developers, and operators with build-ready packages, rapid mobilization, and dependable handover. Our teams align early on scope, compliance, and procurement to keep delivery predictable.',
    ar: 'تدعم ACT الوزارات والمطورين والمشغلين بحزم تنفيذ جاهزة وتعبئة سريعة وتسليم يمكن الاعتماد عليه. ننسق مبكرًا على النطاق والامتثال والمشتريات لضمان تنفيذ واضح.',
  },
  stats: [
    { value: '98%', label: { en: 'Repeat clients', ar: 'عملاء متكررون' } },
    { value: '120+', label: { en: 'Active contracts', ar: 'عقود نشطة' } },
    { value: '25+', label: { en: 'Public entities', ar: 'جهات عامة' } },
    { value: '40+', label: { en: 'Supply partners', ar: 'شركاء توريد' } },
  ],
  segmentsTitle: { en: 'Who we work with', ar: 'من نتعامل معهم' },
  segments: [
    {
      title: { en: 'Government & Ministries', ar: 'الحكومة والوزارات' },
      description: {
        en: 'Civil works, public buildings, and infrastructure programs delivered with full regulatory compliance.',
        ar: 'أعمال مدنية ومبانٍ عامة وبرامج بنية تحتية يتم تنفيذها مع امتثال تنظيمي كامل.',
      },
    },
    {
      title: { en: 'Real Estate Developers', ar: 'مطورو العقارات' },
      description: {
        en: 'Residential communities, towers, and mixed-use districts with phased delivery plans.',
        ar: 'مجتمعات سكنية وأبراج ومناطق متعددة الاستخدامات بخطط تسليم مرحلية.',
      },
    },
    {
      title: { en: 'Industrial & Energy', ar: 'الصناعة والطاقة' },
      description: {
        en: 'Operational facilities, safety upgrades, and supporting civil packages for industrial sites.',
        ar: 'مرافق تشغيلية وترقيات سلامة وحزم مدنية داعمة للمواقع الصناعية.',
      },
    },
    {
      title: { en: 'Logistics & Ports', ar: 'اللوجستيات والموانئ' },
      description: {
        en: 'Warehouse expansions, yard works, and circulation improvements for active operations.',
        ar: 'توسعات مستودعات وأعمال ساحات وتحسينات حركة للمواقع العاملة.',
      },
    },
  ],
  testimonialsTitle: { en: 'What clients say', ar: 'ماذا يقول العملاء' },
  testimonials: [
    {
      quote: {
        en: 'ACT managed multi-site coordination with clear reporting and strong HSE discipline throughout.',
        ar: 'أدارت ACT تنسيق المواقع المتعددة بتقارير واضحة وانضباط قوي للسلامة طوال الوقت.',
      },
      name: { en: 'Eng. Sara Al-Sabah', ar: 'م. سارة الصباح' },
      role: { en: 'Projects Director, Kuwait Municipality', ar: 'مديرة المشاريع، بلدية الكويت' },
    },
    {
      quote: {
        en: 'Schedule certainty and proactive procurement made the difference on our retail program.',
        ar: 'اليقين في الجدول الزمني والمشتريات الاستباقية أحدثا فرقًا في برنامجنا.',
      },
      name: { en: 'Omar Al-Rashid', ar: 'عمر الرشيد' },
      role: { en: 'Development Manager, Marina Heights', ar: 'مدير التطوير، مارينا هايتس' },
    },
    {
      quote: {
        en: 'Their commissioning handover was thorough, collaborative, and operator-ready.',
        ar: 'كان تسليم التشغيل شاملاً وتعاونياً وجاهزاً للمشغل.',
      },
      name: { en: 'Fahad Al-Mutairi', ar: 'فهد المطيري' },
      role: { en: 'Facilities Lead, Energy Park', ar: 'قائد المرافق، حديقة الطاقة' },
    },
  ],
  logosTitle: { en: 'Trusted by leading organizations', ar: 'موثوقون لدى جهات رائدة' },
  logosIntro: {
    en: 'A snapshot of the institutions that rely on ACT for delivery, upgrades, and long-term maintenance.',
    ar: 'لمحة عن الجهات التي تعتمد على ACT للتنفيذ والترقيات والصيانة طويلة الأمد.',
  },
  logosText: [
    { en: 'Kuwait Municipality', ar: 'بلدية الكويت' },
    { en: 'Ministry of Health', ar: 'وزارة الصحة' },
    { en: 'Kuwait Ports Authority', ar: 'هيئة الموانئ الكويتية' },
    { en: 'Public Works Department', ar: 'وزارة الأشغال العامة' },
    { en: 'Kuwait Oil Company', ar: 'شركة نفط الكويت' },
    { en: 'Marina Heights Developers', ar: 'مطورو مارينا هايتس' },
    { en: 'Gateway Business District', ar: 'منطقة بوابة الأعمال' },
    { en: 'Energy Park Operations', ar: 'إدارة حديقة الطاقة' },
  ],
  ctaTitle: { en: 'Plan your next tender with ACT', ar: 'خطط لمناقصتك القادمة مع ACT' },
  ctaDesc: {
    en: 'Share scope, timelines, and procurement requirements and our team will respond with a delivery plan.',
    ar: 'شارك نطاق العمل والجداول الزمنية ومتطلبات الطرح لنقدم خطة تنفيذ واضحة.',
  },
  ctaButton: { en: 'Contact our team', ar: 'تواصل مع فريقنا' },
}

