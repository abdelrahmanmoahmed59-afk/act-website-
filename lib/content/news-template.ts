export type LocalizedText = { en: string; ar: string }

export type NewsSettingsSeed = {
  title: LocalizedText
  intro: LocalizedText
  filterLabel: LocalizedText
  allLabel: LocalizedText
  readMore: LocalizedText
  close: LocalizedText
  contactTitle: LocalizedText
  contactDesc: LocalizedText
  contactEmail: string
  contactButton: LocalizedText
}

export type NewsItemSeed = {
  sortOrder: number
  title: LocalizedText
  dateLabel: LocalizedText
  category: LocalizedText
  excerpt: LocalizedText
  imageUrl: string
}

export const newsTemplateSettings: NewsSettingsSeed = {
  title: { en: 'News', ar: 'الأخبار' },
  intro: {
    en: 'Project milestones, company updates, and community impact highlights.',
    ar: 'مستجدات المشاريع وأخبار الشركة وأثرها في المجتمع.',
  },
  filterLabel: { en: 'Categories', ar: 'التصنيفات' },
  allLabel: { en: 'All', ar: 'الكل' },
  readMore: { en: 'Read More', ar: 'اقرأ المزيد' },
  close: { en: 'Close', ar: 'إغلاق' },
  contactTitle: { en: 'Media Inquiries', ar: 'استفسارات الإعلام' },
  contactDesc: {
    en: 'For press, partnerships, or official statements, contact our communications team.',
    ar: 'للصحافة أو الشراكات أو التصريحات الرسمية، تواصل مع فريق الاتصالات لدينا.',
  },
  contactEmail: 'news@actgroup.com',
  contactButton: { en: 'Email', ar: 'بريد' },
}

export const newsTemplateItems: NewsItemSeed[] = [
  {
    sortOrder: 10,
    title: { en: 'Shuwaikh Logistics Hub Phase 1 Handover', ar: 'تسليم المرحلة الأولى لمركز الشويخ اللوجستي' },
    dateLabel: { en: 'Mar 2026', ar: 'مارس 2026' },
    category: { en: 'Project Update', ar: 'تحديث مشروع' },
    excerpt: {
      en: 'Phase 1 delivered 42,000 m2 of warehouse space with integrated fire systems and fleet circulation upgrades.',
      ar: 'تسليم 42,000 م2 من المستودعات مع أنظمة مكافحة الحريق وتحديث حركة الشاحنات.',
    },
    imageUrl: '/placeholder.jpg',
  },
  {
    sortOrder: 20,
    title: { en: 'Kuwait South Road Promotions Awarded', ar: 'ترسية أعمال تطوير طريق الكويت الجنوبي' },
    dateLabel: { en: 'Feb 2026', ar: 'فبراير 2026' },
    category: { en: 'Infrastructure', ar: 'بنية تحتية' },
    excerpt: {
      en: 'ACT was awarded a civil package covering diversion utilities, asphalt works, and traffic management.',
      ar: 'حزمة أعمال مدنية تشمل تحويلات المرافق والأعمال الأسفلتية وخطط إدارة الحركة.',
    },
    imageUrl: '/placeholder.jpg',
  },
  {
    sortOrder: 30,
    title: { en: 'Ministry of Health Clinic Expansion Completed', ar: 'اكتمال توسعة عيادة وزارة الصحة' },
    dateLabel: { en: 'Dec 2025', ar: 'ديسمبر 2025' },
    category: { en: 'Healthcare', ar: 'رعاية صحية' },
    excerpt: {
      en: 'Delivered new outpatient facilities, MEP upgrades, and accessibility improvements for patients and staff.',
      ar: 'تسليم مرافق جديدة للعيادات الخارجية، وتحديثات MEP، وتحسينات الوصول للمرضى والموظفين.',
    },
    imageUrl: '/placeholder.jpg',
  },
  {
    sortOrder: 40,
    title: { en: 'ACT Safety Week Across All Sites', ar: 'أسبوع السلامة في ACT عبر جميع المواقع' },
    dateLabel: { en: 'Oct 2025', ar: 'أكتوبر 2025' },
    category: { en: 'Safety', ar: 'سلامة' },
    excerpt: {
      en: 'Conducted 120+ toolbox talks, emergency drills, and risk assessments across active sites.',
      ar: 'تنفيذ 120+ محاضرة سلامة، وتمارين طوارئ، وتقييمات مخاطر عبر المواقع النشطة.',
    },
    imageUrl: '/placeholder.jpg',
  },
]

