'use client'

import React, { useEffect, useState } from "react"
import Image from 'next/image'
import {
  Award,
  Briefcase,
  ClipboardCheck,
  Eye,
  FileText,
  Handshake,
  Lightbulb,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'

import Header from '@/components/header'
import AboutStory from '@/components/about-story-section'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import styles from './page.module.css'

function AboutContent() {
  const { language } = useLanguage()

  const valueIcons = [Award, Lightbulb, Handshake, ShieldCheck] as const
  const leaderIcons = [Briefcase, ClipboardCheck, FileText, ShieldCheck] as const

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
        'To be the most trusted and innovative construction partner in the region, known for quality, reliability, and transformative projects.',
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
          name: 'Eng. Ahmad Al Rashid',
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
        'أن نكون الشريك الإنشائي الأكثر موثوقية وابتكاراً في المنطقة، معروفين بالجودة والموثوقية والمشاريع التحويلية.',
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
          name: 'المهندس أحمد الراشد',
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

        <section className={styles.leadership}>
          <div className={styles.container}>
            <div className={styles.leadershipHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                  <Users className={styles.titleIconSvg} data-reveal-skip />
                </span>
                <span className={styles.titleText}>{data.leadershipTitle}</span>
              </h2>
              <p className={styles.leadershipIntro}>{data.leadershipIntro}</p>
            </div>
            <div className={styles.leadershipGrid}>
              {data.leadership.map(
                (
                  member: { name: string; image: string; role: string; summary: string },
                  index: number
                ) => {
                const Icon = leaderIcons[index % leaderIcons.length]
                return (
                  <article
                    key={member.name}
                    className={styles.leaderCard}
                    style={{ '--leader-index': index } as React.CSSProperties}
                  >
                    <div className={styles.leaderImageWrap}>
                      <span className={styles.leaderIconBadge} aria-hidden="true" data-reveal-skip>
                        <Icon className={styles.leaderIconSvg} data-reveal-skip />
                      </span>
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 25vw"
                        className={styles.leaderImage}
                      />
                    </div>
                    <div className={styles.leaderBody}>
                      <h3 className={styles.leaderName}>{member.name}</h3>
                      <p className={styles.leaderRole}>{member.role}</p>
                      <p className={styles.leaderSummary}>{member.summary}</p>
                    </div>
                  </article>
                )
                }
              )}
            </div>
          </div>
        </section>

        <section className={styles.values}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                <Award className={styles.titleIconSvg} data-reveal-skip />
              </span>
              <span className={styles.titleText}>{data.values}</span>
            </h2>
            <div className={styles.valuesGrid}>
              {data.valuesList.map((value: { title: string; desc: string }, index: number) => {
                const Icon = valueIcons[index % valueIcons.length]
                return (
                  <div
                    key={index}
                    className={styles.valueCard}
                    style={{ '--value-index': index } as React.CSSProperties}
                  >
                    <div className={styles.valueHeader}>
                      <span className={styles.valueIcon} aria-hidden="true" data-reveal-skip>
                        <Icon className={styles.valueIconSvg} data-reveal-skip />
                      </span>
                      <h3 className={styles.valueTitle}>{value.title}</h3>
                    </div>
                    <p className={styles.valueDesc}>{value.desc}</p>
                  </div>
                )
              })}
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
