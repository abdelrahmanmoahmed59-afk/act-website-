'use client'

import React, { useEffect, useState } from "react"
import Image from 'next/image'
import {
  Award,
  Eye,
  Target,
  Users,
} from 'lucide-react'

import Header from '@/components/header'
import AboutStory from '@/components/about-story-section'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import styles from './page.module.css'

const livingValues = {
  en: [
    {
      key: 'competent',
      image: '/about-values/website-icons1.png',
      imageAlt: 'Competent value card',
      statement: 'We are very good at what we do.',
      lead: 'We possess the skills and ability to do what you are currently doing or propose to do.',
      bullets: [
        'Performing consistently to the satisfaction of others against agreed upon standards.',
        'Developing and supporting others where that is part of your role, seniority, and ability.',
        `Knowing where you are competent and openly saying "I don't know" if appropriate.`,
      ],
    },
    {
      key: 'reliable',
      image: '/about-values/website-icons21.png',
      imageAlt: 'Reliable value card',
      statement: 'We follow through on our commitments.',
      lead: 'We meet the commitments we make and keep our promises.',
      bullets: [
        'Being on time for scheduled meetings and deliverables.',
        'Doing what you say you will do by the promised deadline. If for some reason completion is at risk, others are notified prior to the due date/time.',
      ],
    },
    {
      key: 'sincere',
      image: '/about-values/website-icons31.png',
      imageAlt: 'Sincere value card',
      statement: 'We mean what we say.',
      lead: 'We are honest. We say what we mean and mean what we say.',
      bullets: [
        'Raising concerns or offering feedback immediately. While valuing candor, openness, and transparency over conflict avoidance, but in a respectful manner.',
        `Bringing "background conversations" (what you are thinking) to the "foreground" (what you say out loud) tactfully so you are in genuine alignment with the team.`,
        'Listening to the views or concerns of others and repeating them back so they are clearly heard and understood.',
      ],
    },
    {
      key: 'care',
      image: '/about-values/website-icons41.png',
      imageAlt: 'Care value card',
      statement: 'We have a genuine desire to meet the needs of people.',
      lead: "We have the other's interests in mind as well as our own when we make decisions and take actions.",
      bullets: [
        'Asking for feedback on your relationships to ensure collaboration and teamwork with others.',
        'Building supportive and diverse teams that create stronger future promotion opportunities.',
        'Going out of your way to lift others up and help teammates who might be struggling.',
      ],
    },
  ],
  ar: [
    {
      key: 'competent',
      image: '/about-values/website-icons1.png',
      imageAlt: 'بطاقة قيمة الكفاءة',
      statement: 'نحن بارعون جدًا فيما نقوم به.',
      lead: 'نمتلك المهارات والقدرات اللازمة لإنجاز ما تقوم به الآن أو ما تنوي القيام به.',
      bullets: [
        'نؤدي عملنا باستمرار بما يحقق رضا الآخرين وفقًا للمعايير المتفق عليها.',
        'نطوّر الآخرين وندعمهم عندما يكون ذلك جزءًا من دورك أو خبرتك أو مستوى مسؤوليتك.',
        'نعرف حدود كفاءتنا، ونقول بصراحة "لا أعرف" عندما يكون ذلك هو الأنسب.',
      ],
    },
    {
      key: 'reliable',
      image: '/about-values/website-icons21.png',
      imageAlt: 'بطاقة قيمة الموثوقية',
      statement: 'نفي بالتزاماتنا.',
      lead: 'نلتزم بما نعد به ونحافظ على وعودنا.',
      bullets: [
        'نحضر في الوقت المحدد للاجتماعات وتسليمات العمل والمواعيد المتفق عليها.',
        'ننجز ما نلتزم به في الموعد الموعود. وإذا أصبح الإنجاز معرضًا للخطر لأي سبب، نبلغ الآخرين قبل موعد الاستحقاق.',
      ],
    },
    {
      key: 'sincere',
      image: '/about-values/website-icons31.png',
      imageAlt: 'بطاقة قيمة الصدق',
      statement: 'نقول ما نعنيه بصدق.',
      lead: 'نحن صادقون؛ نقول ما نقصده ونقصد ما نقوله.',
      bullets: [
        'نطرح المخاوف أو الملاحظات مباشرة وباحترام، مع تفضيل الصراحة والانفتاح والشفافية على تجنب الخلاف.',
        'نُخرج "الأحاديث الجانبية" أي ما نفكر فيه إلى "الواجهة" أي ما نقوله بصوت مسموع، بأسلوب لبق يضمن الانسجام الحقيقي مع الفريق.',
        'نستمع إلى آراء الآخرين ومخاوفهم ونعيد صياغتها للتأكد من أنها فُهمت ووصلت بوضوح.',
      ],
    },
    {
      key: 'care',
      image: '/about-values/website-icons41.png',
      imageAlt: 'بطاقة قيمة الاهتمام',
      statement: 'لدينا رغبة صادقة في تلبية احتياجات الناس.',
      lead: 'نضع مصالح الآخرين في اعتبارنا إلى جانب مصالحنا عندما نتخذ القرارات وننفذ الإجراءات.',
      bullets: [
        'نطلب ملاحظات حول علاقاتنا المهنية لضمان التعاون والعمل الجماعي مع الآخرين.',
        'نبني فرقًا داعمة ومتنوعة تتيح فرصًا أفضل للتطور والترقي مستقبلًا.',
        'نبذل جهدًا إضافيًا لرفع معنويات الآخرين ومساندة الزملاء الذين قد يمرون بصعوبات.',
      ],
    },
  ],
} as const

function AboutContent() {
  const { language } = useLanguage()
  const localizedValues = livingValues[language === 'ar' ? 'ar' : 'en']

  const content = {
    en: {
      title: 'About ACT',
      subtitle: 'Advanced Combined Group',
      intro:
        'We are a leading construction and contracting company in Kuwait, dedicated to building the future with innovation, precision, and excellence.',
      mission: 'Our Mission',
      missionDesc:
        'To deliver exceptional construction and development solutions that exceed client expectations and contribute to Kuwait\'s sustainable growth.',
      vision: 'Our Vision',
      visionDesc:
        "We want to build the best place to work. Our employees' high level of engagement comes from our focus on having a culture centered on caring for each other. We truly desire the best for everyone, which includes investing in mentorship, career planning, education, training, and goals. Engaged employees, in turn, create better project outcomes, stronger client relationships, and an exceptional work environment overall",
      values: 'Our Core Values',
      valuesList: [
        { title: 'Excellence', desc: 'Unwavering commitment to quality in every project' },
        { title: 'Innovation', desc: 'Leveraging modern technology and practices' },
        { title: 'Integrity', desc: 'Operating with honesty and transparency' },
        { title: 'Safety', desc: 'Prioritizing worker and public safety' },
      ],
      leadershipTitle: 'Leadership Team',
      leadershipIntro: 'Experienced leaders guiding delivery, safety, and client outcomes.',
      leadership: [
        {
          name: 'Eng. Wessam Ibrahim',
          role: 'Managing Director',
          summary: 'Leads strategic growth and program governance across public and private clients.',
          image: '/placeholder-user.jpg',
        },
        {
          name: 'Sara Al Nasser',
          role: 'Head of Project Delivery',
          summary: 'Drives execution standards, site coordination, and on-time handovers.',
          image: '/placeholder-user.jpg',
        },
        {
          name: 'Khaled Al Mutairi',
          role: 'Commercial & Contracts',
          summary: 'Oversees procurement, claims, and cost control to protect project value.',
          image: '/placeholder-user.jpg',
        },
        {
          name: 'Reem Al Faraj',
          role: 'HSE & Quality Lead',
          summary: 'Maintains safety culture, audits, and compliance with QA/QC plans.',
          image: '/placeholder-user.jpg',
        },
      ],
    },
    ar: {
      title: 'من نحن',
      subtitle: 'المجموعة المتقدمة المتكاملة',
      intro:
        'نحن شركة بناء ومقاولات رائدة في الكويت، ملتزمة ببناء المستقبل بالابتكار والدقة والتميز.',
      mission: 'مهمتنا',
      missionDesc:
        'تقديم حلول بناء وتطوير استثنائية تتجاوز توقعات العملاء وتساهم في النمو المستدام للكويت.',
      vision: 'رؤيتنا',
      visionDesc:
        'نريد بناء أفضل مكان للعمل. يأتي مستوى مشاركة موظفينا العالي من تركيزنا على وجود ثقافة تتمحور حول رعاية بعضنا البعض. نرغب حقًا في الأفضل للجميع، وهو ما يشمل الاستثمار في الإرشاد والتخطيط الوظيفي والتعليم والتدريب والأهداف. بدوره، يخلق الموظفون الملتزمون نتائج أفضل للمشاريع، وعلاقات أقوى مع العملاء، وبيئة عمل استثنائية بشكل عام',
      values: 'قيمنا الأساسية',
      valuesList: [
        { title: 'التميز', desc: 'التزام ثابت بالجودة في كل مشروع' },
        { title: 'الابتكار', desc: 'الاستفادة من التكنولوجيا والممارسات الحديثة' },
        { title: 'النزاهة', desc: 'العمل بصدق وشفافية' },
        { title: 'السلامة', desc: 'إعطاء الأولوية لسلامة العمال والجمهور' },
      ],
      leadershipTitle: 'فريق القيادة',
      leadershipIntro: 'قادة خبراء يوجهون التسليم والسلامة ونتائج العملاء.',
      leadership: [
        {
          name: 'المهندس وسام ابراهيم',
          role: 'المدير العام',
          summary: 'يقود التوجه الاستراتيجي وحوكمة البرامج مع الجهات الحكومية والقطاع الخاص.',
          image: '/placeholder-user.jpg',
        },
        {
          name: 'سارة النصار',
          role: 'رئيسة إدارة المشاريع',
          summary: 'تشرف على معايير التنفيذ وتنسيق المواقع وتسليم المشاريع في الوقت المحدد.',
          image: '/placeholder-user.jpg',
        },
        {
          name: 'خالد المطيري',
          role: 'مدير الشؤون التجارية والعقود',
          summary: 'يتولى المشتريات والمطالبات وضبط التكاليف لحماية قيمة المشروع.',
          image: '/placeholder-user.jpg',
        },
        {
          name: 'ريم الفرج',
          role: 'قائدة السلامة والجودة',
          summary: 'تعزز ثقافة السلامة والتدقيق والالتزام بخطط ضمان الجودة.',
          image: '/placeholder-user.jpg',
        },
      ],
    },
  }

  const [pageContent, setPageContent] = useState<any | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/pages/about', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return
        const c = (json as any)?.content
        if (c && typeof c === 'object') setPageContent(c)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const baseData = content[language as keyof typeof content]
  const cmsData = (pageContent as any)?.[language] ?? null
  const data = { ...baseData, ...(cmsData && typeof cmsData === 'object' ? cmsData : {}) }

  return (
    <main className={styles.page}>
      <Header />

      <div className={styles.content}>
        <section id="main-content" tabIndex={-1} className={styles.aboutHero}>
          <div className={styles.heroBackdrop} aria-hidden="true" data-reveal-skip>
            <div className={styles.heroGrid} />
            <div className={styles.heroOrb} data-variant="one" />
            <div className={styles.heroOrb} data-variant="two" />
            <div className={styles.heroOrb} data-variant="three" />
          </div>

          <div className={styles.container}>
            <div className={styles.heroInner}>
              <h1 className={styles.title}>{data.title}</h1>
              <p className={styles.subtitle}>{data.subtitle}</p>
            </div>
          </div>
        </section>

        <AboutStory />

        <section className={styles.intro}>
          <div className={styles.container}>
            <div className={styles.introCard}>
              <span className={styles.introIconWrap} aria-hidden="true" data-reveal-skip>
                <Users className={styles.introIcon} data-reveal-skip />
              </span>
              <p className={styles.introText}>{data.intro}</p>
            </div>
          </div>
        </section>

        <section className={styles.missionVision}>
          <div className={styles.container}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon} aria-hidden="true" data-reveal-skip>
                  <Target className={styles.cardIconSvg} data-reveal-skip />
                </span>
                <h2 className={styles.sectionTitle}>{data.mission}</h2>
              </div>
              <p className={styles.sectionText}>{data.missionDesc}</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon} aria-hidden="true" data-reveal-skip>
                  <Eye className={styles.cardIconSvg} data-reveal-skip />
                </span>
                <h2 className={styles.sectionTitle}>{data.vision}</h2>
              </div>
              <p className={styles.sectionText}>{data.visionDesc}</p>
            </div>
          </div>
        </section>

        <section className={styles.values} aria-labelledby="about-values-title">
          <div className={styles.container}>
            <h2 id="about-values-title" className={styles.sectionTitle}>
              <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                <Award className={styles.titleIconSvg} data-reveal-skip />
              </span>
              <span className={styles.titleText}>{data.values}</span>
            </h2>
            <div className={styles.valuesGrid}>
              {localizedValues.map((value, index) => (
                <article
                  key={value.key}
                  className={styles.valueCard}
                  style={{ '--value-index': index } as React.CSSProperties}
                >
                  <div className={styles.valuePosterWrap}>
                    <Image
                      src={value.image}
                      alt={value.imageAlt}
                      width={360}
                      height={360}
                      className={styles.valuePoster}
                    />
                  </div>
                  <div className={styles.valueBody}>
                    <h3 className={styles.valueTitle}>{value.statement}</h3>
                    <p className={styles.valueLead}>{value.lead}</p>
                    <ul className={styles.valueList}>
                      {value.bullets.map((bullet) => (
                        <li key={bullet} className={styles.valueListItem}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}

export default function About() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className={styles.page}>
        <Header />
      </main>
    )
  }

  return <AboutContent />
}
