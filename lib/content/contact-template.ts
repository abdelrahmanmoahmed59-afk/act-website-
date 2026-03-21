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
  address: { en: 'Shuwaikh, Kuwait', ar: 'الشويخ، الكويت' },
  mapSrc: 'https://www.google.com/maps?q=Shuwaikh%2C%20Kuwait&output=embed',
}
