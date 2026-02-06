import type { Language } from '@/lib/i18n/base-translations'

export type SuccessClientsLogoTemplate = {
  imageUrl: string
  alt: Record<Language, string>
  sortOrder: number
}

export const successClientsTemplate = {
  title: { en: 'Our Success Clients', ar: 'عملاؤنا الناجحون' },
  subtitle: {
    en: 'OUR COMMON SUCCESS IS THE BASE OF OUR PARTNERSHIP, WHETHER YOU ARE A SUPPLIER OR CUSTOMER',
    ar: 'نجاحنا المشترك هو أساس شراكتنا، سواء كنت مورّدًا أو عميلًا',
  },
  logos: [
    { imageUrl: '/placeholder-logo.png', alt: { en: 'Tiba Mills', ar: 'تيبا ميلز' }, sortOrder: 0 },
    { imageUrl: '/placeholder-logo.png', alt: { en: 'Egyptian Railways', ar: 'سكك حديد مصر' }, sortOrder: 1 },
    { imageUrl: '/placeholder-logo.png', alt: { en: 'SEDIC', ar: 'سيديك' }, sortOrder: 2 },
    { imageUrl: '/placeholder-logo.png', alt: { en: 'Concord Real Estate', ar: 'كونكورد العقارية' }, sortOrder: 3 },
    { imageUrl: '/placeholder-logo.png', alt: { en: 'Partner Logo', ar: 'شعار شريك' }, sortOrder: 4 },
    { imageUrl: '/placeholder-logo.png', alt: { en: 'GIZ', ar: 'GIZ' }, sortOrder: 5 },
  ] as SuccessClientsLogoTemplate[],
}

