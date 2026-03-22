import type { ContactSettingsInput } from '@/lib/validation/contact'

export const contactTemplate: ContactSettingsInput = {
  title: { en: 'Get In Touch', ar: 'اتصل بنا' },
  introLineOne: {
    en: "Let's Discuss Your Construction Projects",
    ar: 'دعونا نناقش مشاريع البناء الخاصة بك',
  },
  introLineTwo: {
    en: 'Our Team is ready to discuss your project requirements and provide professional construction solutions.',
    ar: 'فريقنا جاهز لمناقشة متطلبات مشروعك وتقديم حلول بناء احترافية.',
  },
  emailText: 'info@act-kw.com',
  phoneNum: '+965 9558 8251',
  address: { en: 'Khaitan - Block 6 - Ibn Zuhair Street - Suleiman Abdullah Al-Dabbous Center - First Floor - Office 5, Kuwait City', ar: 'خيطان - بلوك 6 - شارع ابن زهير - مركز سليمان عبد الله الدبوس - الطابق الأول - مكتب 5، مدينة الكويت ' },
  mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27839.26567672481!2d47.93666466803621!3d29.285023678612816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3fcf9bc770801153%3A0xb6ec5934c8cb3494!2sKhaitan%2C%20Kuwait!5e0!3m2!1sen!2seg!4v1774188843025!5m2!1sen!2seg',
}
