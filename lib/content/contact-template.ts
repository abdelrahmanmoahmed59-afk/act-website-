import type { ContactSettingsInput } from '@/lib/validation/contact'

export const contactTemplate: ContactSettingsInput = {
  title: { en: 'Get In Touch', ar: 'اتصل بنا' },
  intro: {
    en: 'Have a project in mind? Contact us today and our team will reach out.',
    ar: 'هل لديك مشروع؟ تواصل معنا اليوم وسنقوم بالرد عليك في أقرب وقت.',
  },
  emailText: 'info@actgroup.com.kw',
  phoneNum: '+965 2246 8899',
  address: { en: 'Shuwaikh, Kuwait', ar: 'الشويخ، الكويت' },
  mapSrc: 'https://www.google.com/maps?q=Shuwaikh%2C%20Kuwait&output=embed',
}

