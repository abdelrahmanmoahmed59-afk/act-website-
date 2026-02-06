import type { PageContent } from '@/lib/server/pages'

export type ManagedPageKey = 'overview' | 'about' | 'services' | 'home' | 'get-quotation'

export const pagesTemplates: Record<ManagedPageKey, PageContent> = {
  overview: {
    en: {
      title: 'Overview',
      subtitle: 'Contracting delivery for public, commercial, and industrial clients across Kuwait.',
      intro:
        'ACT is a Kuwaiti contracting company delivering civil, building, and infrastructure works. We manage the full project lifecycle from preconstruction planning and procurement to execution and commissioning so clients get predictable schedules, controlled costs, and safe sites.',
      ctaTitle: 'Plan your next project',
      ctaDesc: 'Share scope, schedule, and requirements. We will propose a delivery approach and timeline.',
      ctaButton: 'Contact us',
    },
    ar: {
      title: 'نظرة عامة',
      subtitle: 'تنفيذ أعمال المقاولات للجهات الحكومية والتجارية والصناعية في الكويت.',
      intro:
        'نحن شركة مقاولات كويتية تنفذ الأعمال المدنية وأعمال المباني والبنية التحتية. ندير دورة المشروع بالكامل من التخطيط المسبق والمشتريات إلى التنفيذ والتسليم لضمان جدول زمني واضح وتكاليف مضبوطة ومواقع عمل آمنة.',
      ctaTitle: 'خطط لمشروعك القادم',
      ctaDesc: 'شاركنا نطاق العمل والجدول الزمني والمتطلبات لنقترح أسلوب التنفيذ الأنسب.',
      ctaButton: 'تواصل معنا',
    },
  },
  about: {
    en: {
      title: 'About ACT',
      subtitle: 'Advanced Combined Group',
      intro:
        'We are a leading construction and contracting company in Kuwait, dedicated to building the future with innovation, precision, and excellence.',
      mission: 'Our Mission',
      missionDesc:
        "To deliver exceptional construction and development solutions that exceed client expectations and contribute to Kuwait's sustainable growth.",
      vision: 'Our Vision',
      visionDesc:
        'To be the most trusted and innovative construction partner in the region, known for quality, reliability, and transformative projects.',
    },
    ar: {
      title: 'من نحن',
      subtitle: 'المجموعة المتقدمة المتكاملة',
      intro:
        'نحن شركة بناء ومقاولات رائدة في الكويت، ملتزمون ببناء المستقبل بالابتكار والدقة والتميّز.',
      mission: 'مهمتنا',
      missionDesc:
        'تقديم حلول بناء وتطوير استثنائية تتجاوز توقعات العملاء وتساهم في النمو المستدام للكويت.',
      vision: 'رؤيتنا',
      visionDesc:
        'أن نكون الشريك الإنشائي الأكثر موثوقية وابتكاراً في المنطقة، معروفين بالجودة والموثوقية والمشاريع التحويلية.',
    },
  },
  services: {
    en: {
      title: 'Our Services',
      intro: 'Comprehensive construction and contracting solutions tailored to meet your project needs.',
      readyTitle: 'Ready to start?',
      readyDesc: 'Share your scope, schedule, and requirements. We will propose the right delivery plan.',
      readyButton: 'Get a quotation',
    },
    ar: {
      title: 'خدماتنا',
      intro: 'حلول شاملة للبناء والمقاولات مصممة لتلبية احتياجات مشروعك.',
      readyTitle: 'جاهز للبدء؟',
      readyDesc: 'شاركنا نطاق العمل والجدول الزمني والمتطلبات لنقترح خطة التسليم المناسبة.',
      readyButton: 'اطلب عرض سعر',
    },
  },
  home: {
    en: {},
    ar: {},
  },
  'get-quotation': {
    en: {},
    ar: {},
  },
}

