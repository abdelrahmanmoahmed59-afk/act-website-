import type { MediaItemInput, MediaSettingsInput } from '@/lib/validation/media'

export const mediaTemplateSettings: MediaSettingsInput = {
  title: { en: 'Media', ar: 'الإعلام' },
  subtitle: { en: 'Project visuals, milestones, and press highlights from ACT.', ar: 'مواد مرئية وبيانات صحفية عن مشاريع ACT.' },
  intro: { en: 'Browse recent footage, photo stories, and media releases.', ar: 'تصفح أحدث المقاطع والصور والبيانات الإعلامية.' },
}

export const mediaTemplateItems: MediaItemInput[] = [
  {
    sortOrder: 0,
    published: true,
    type: 'press',
    title: { en: 'ACT Completes Coastal Protection Package', ar: 'ACT تُنجز حزمة حماية ساحلية' },
    dateLabel: { en: 'August 2025', ar: 'أغسطس 2025' },
    description: {
      en: 'Milestone handover completed with coordinated QA/QC documentation and commissioning records.',
      ar: 'تم تسليم مرحلة رئيسية مع توثيق جودة منسق وسجلات تشغيل واختبار.',
    },
    linkUrl: '',
    imageUploadId: null,
  },
  {
    sortOrder: 1,
    published: true,
    type: 'photo',
    title: { en: 'Site Progress Photo Story', ar: 'قصة صور لتقدم الموقع' },
    dateLabel: { en: 'July 2025', ar: 'يوليو 2025' },
    description: {
      en: 'A snapshot of key works across structure, finishes, and services integration.',
      ar: 'لمحة عن الأعمال الرئيسية عبر الهيكل والتشطيبات وتكامل الخدمات.',
    },
    linkUrl: '',
    imageUploadId: null,
  },
  {
    sortOrder: 2,
    published: true,
    type: 'video',
    title: { en: 'Safety Walkthrough: Daily Controls', ar: 'جولة سلامة: ضوابط يومية' },
    dateLabel: { en: 'June 2025', ar: 'يونيو 2025' },
    description: {
      en: 'Short walkthrough covering daily briefings, housekeeping, and permit-to-work checks.',
      ar: 'جولة قصيرة حول الإحاطات اليومية والنظافة وفحوصات تصاريح العمل.',
    },
    linkUrl: '',
    imageUploadId: null,
  },
]

