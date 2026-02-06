import type { BlogPostInput, BlogSettingsInput } from '@/lib/validation/blog'

export const blogTemplateSettings: BlogSettingsInput = {
  eyebrow: { en: 'ACT Blog', ar: 'مدونة ACT' },
  title: { en: 'Blog', ar: 'المدونة' },
  subtitle: { en: 'Insights from ACT project teams across Kuwait.', ar: 'رؤى من فرق ACT حول تنفيذ المشاريع في الكويت.' },
  intro: {
    en: 'Practical notes on delivery strategy, safety, and procurement for complex construction programs.',
    ar: 'ملاحظات عملية حول استراتيجيات التنفيذ والسلامة والمشتريات للبرامج الإنشائية المعقدة.',
  },
}

export const blogTemplatePosts: BlogPostInput[] = [
  {
    slug: 'safety-briefings-that-stick',
    sortOrder: 0,
    published: true,
    isFeatured: true,
    title: { en: 'Safety Briefings That Stick', ar: 'إحاطات سلامة مؤثرة' },
    dateLabel: { en: 'July 2025', ar: 'يوليو 2025' },
    category: { en: 'Culture & Teams', ar: 'الثقافة والكوادر' },
    readTime: { en: '5 min read', ar: '5 دقائق قراءة' },
    summary: {
      en: 'Simple routines that reinforce accountability and reduce on-site risk without slowing delivery.',
      ar: 'طقوس يومية قصيرة تعزز المساءلة وتقلل المخاطر في الموقع دون إبطاء التنفيذ.',
    },
    content: {
      en: 'Effective briefings are short, consistent, and tied to the work in front of the crew. Pair a clear hazard focus with a single measurable action, then close the loop in the next briefing by reviewing outcomes. Over time, the routine becomes part of delivery discipline, not an interruption.',
      ar: 'الإحاطات الفعالة قصيرة ومتسقة ومرتبطة بالعمل أمام الفريق. ركّز على خطر واحد واضح مع إجراء واحد قابل للقياس، ثم أغلق الحلقة في الإحاطة التالية بمراجعة النتائج. مع الوقت تصبح الإحاطة جزءًا من انضباط التنفيذ وليست مقاطعة.',
    },
    highlights: {
      en: ['Keep it under 10 minutes', 'One hazard, one action', 'Close the loop daily'],
      ar: ['اجعلها أقل من 10 دقائق', 'خطر واحد وإجراء واحد', 'إغلاق الحلقة يوميًا'],
    },
    imageUploadId: null,
  },
  {
    slug: 'controlling-scope-with-simple-gates',
    sortOrder: 1,
    published: true,
    isFeatured: false,
    title: { en: 'Controlling Scope With Simple Gates', ar: 'ضبط نطاق العمل عبر بوابات بسيطة' },
    dateLabel: { en: 'June 2025', ar: 'يونيو 2025' },
    category: { en: 'Delivery', ar: 'التنفيذ' },
    readTime: { en: '4 min read', ar: '4 دقائق قراءة' },
    summary: {
      en: 'Use lightweight approval gates to protect schedule and quality as conditions change.',
      ar: 'استخدم بوابات اعتماد خفيفة لحماية البرنامج الزمني والجودة مع تغيّر الظروف.',
    },
    content: {
      en: 'Scope drift is rarely a single event. It’s small changes that accumulate. A simple gate at design clarifications, procurement substitutions, and site variations helps teams document impact early and keep stakeholders aligned. The goal is speed with traceability.',
      ar: 'انحراف النطاق نادرًا ما يكون حدثًا واحدًا؛ بل تغييرات صغيرة تتراكم. بوابة بسيطة عند توضيحات التصميم واستبدالات المشتريات وتغييرات الموقع تساعد على توثيق الأثر مبكرًا والحفاظ على توافق أصحاب المصلحة. الهدف سرعة مع قابلية التتبع.',
    },
    highlights: {
      en: ['Capture impact early', 'Single owner per gate', 'Traceability over paperwork'],
      ar: ['توثيق الأثر مبكرًا', 'مسؤول واحد لكل بوابة', 'قابلية التتبع بدلًا من كثرة الأوراق'],
    },
    imageUploadId: null,
  },
  {
    slug: 'procurement-for-long-lead-items',
    sortOrder: 2,
    published: true,
    isFeatured: false,
    title: { en: 'Procurement for Long‑Lead Items', ar: 'مشتريات المواد طويلة التوريد' },
    dateLabel: { en: 'May 2025', ar: 'مايو 2025' },
    category: { en: 'Procurement', ar: 'المشتريات' },
    readTime: { en: '6 min read', ar: '6 دقائق قراءة' },
    summary: {
      en: 'A clear package plan and tracking rhythm prevents late surprises and rework.',
      ar: 'خطة حزَم واضحة وإيقاع متابعة منتظم يمنع المفاجآت المتأخرة وإعادة العمل.',
    },
    content: {
      en: 'Start with packages that map to critical path activities. Define submittals, approvals, and shipping checkpoints upfront. Weekly tracking is enough if the data is consistent: order date, factory readiness, shipping window, and site receiving constraints.',
      ar: 'ابدأ بحزم تربط أنشطة المسار الحرج. عرّف الاعتمادات ونقاط الشحن مسبقًا. المتابعة الأسبوعية كافية إذا كانت البيانات متسقة: تاريخ الطلب، جاهزية المصنع، نافذة الشحن، وقيود الاستلام في الموقع.',
    },
    highlights: {
      en: ['Package by critical path', 'Track four dates', 'Align site readiness'],
      ar: ['تقسيم حسب المسار الحرج', 'متابعة أربعة تواريخ', 'مواءمة جاهزية الموقع'],
    },
    imageUploadId: null,
  },
]

