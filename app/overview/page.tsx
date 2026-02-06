'use client'

import React, { useEffect, useState } from "react"
import Link from 'next/link'
import {
  ClipboardList,
  DraftingCompass,
  Eye,
  HardHat,
  Hammer,
  Layers,
  MessageCircle,
  Milestone,
  PackageCheck,
  Route,
  ShieldCheck,
  Target,
  Truck,
  Wrench,
} from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import styles from './page.module.css'

function OverviewContent() {
  const { language } = useLanguage()

  const highlightIcons = [HardHat, DraftingCompass, Route, Wrench] as const
  const processIcons = [ClipboardList, Truck, Hammer, PackageCheck] as const

  const localContent = {
    en: {
      title: 'Overview',
      subtitle: 'Contracting delivery for public, commercial, and industrial clients across Kuwait.',
      intro:
        'ACT is a Kuwaiti contracting company delivering civil, building, and infrastructure works. We manage the full project lifecycle from preconstruction planning and procurement to execution and commissioning so clients get predictable schedules, controlled costs, and safe sites.',
      drivesTitle: 'What Drives Us',
      drivesIntro: 'Purpose-led delivery focused on safety, reliability, and long-term client partnerships.',
      missionTitle: 'Mission',
      missionDesc:
        'Keep projects on track with disciplined planning, safe sites, and transparent reporting at every stage.',
      visionTitle: 'Vision',
      visionDesc:
        'Be the trusted contracting partner in Kuwait for public, commercial, and infrastructure work.',
      valuesTitle: 'Values',
      values: [
        'Safety first',
        'Integrity and transparency',
        'On-time delivery',
        'Quality without compromise',
        'Continuous improvement',
      ],
      highlightsTitle: 'What We Deliver',
      highlights: [
        {
          title: 'General Contracting',
          description: 'Full-scope delivery with disciplined cost, schedule, and quality controls.',
        },
        {
          title: 'Design-Build',
          description: 'Integrated design and construction that reduces risk and accelerates delivery.',
        },
        {
          title: 'Civil & Infrastructure',
          description: 'Roads, utilities, and public works delivered with safety and traffic management plans.',
        },
        {
          title: 'MEP & Fit-Out',
          description: 'Coordinated mechanical, electrical, and interior packages for operational readiness.',
        },
      ],
      sectorsTitle: 'Sectors We Serve',
      sectors: ['Government', 'Commercial', 'Residential', 'Industrial', 'Healthcare', 'Education'],
      processTitle: 'How We Work',
      process: [
        {
          title: 'Plan',
          description: 'Align scope, risks, and procurement strategy with clients and consultants.',
        },
        {
          title: 'Mobilize',
          description: 'Deploy teams, safety systems, and site logistics before breaking ground.',
        },
        {
          title: 'Build',
          description: 'Deliver with daily reporting, inspections, and stakeholder updates.',
        },
        {
          title: 'Deliver',
          description: 'Commission systems, train operators, and hand over full documentation.',
        },
      ],
      journeyTitle: 'Our Journey',
      journeyIntro: 'Milestones that shaped our delivery model across Kuwait.',
      journey: [
        {
          year: '2008',
          title: 'Company founded',
          description: 'Launched as a civil contractor serving municipal and commercial works.',
        },
        {
          year: '2012',
          title: 'Public sector growth',
          description: 'Expanded delivery capacity for government and infrastructure programs.',
        },
        {
          year: '2016',
          title: 'MEP integration',
          description: 'Built in-house coordination for building systems and fit-out packages.',
        },
        {
          year: '2020',
          title: 'Program management',
          description: 'Standardized reporting, QA/QC gates, and safety leadership across sites.',
        },
        {
          year: '2024',
          title: 'Integrated delivery model',
          description: 'Unified preconstruction, procurement, and commissioning for faster handover.',
        },
      ],
      assuranceTitle: 'Safety and Quality',
      assuranceDesc:
        'Our HSE and QA/QC programs combine on-site supervision, toolbox talks, and inspection gates to protect people, assets, and specifications.',
      stats: [
        { value: '18+', label: 'Years of delivery' },
        { value: '200+', label: 'Projects completed' },
        { value: '35', label: 'Active sites' },
        { value: '3.2M', label: 'm2 built' },
      ],
      ctaTitle: 'Plan your next project',
      ctaDesc: 'Share your scope and timeline and we will respond with the right delivery approach.',
      ctaButton: 'Contact Us',
    },
    ar: {
      title: 'نظرة عامة',
      subtitle: 'تنفيذ أعمال المقاولات للقطاع العام والتجاري والصناعي في الكويت.',
      intro:
        'شركة ACT للمقاولات تقدم الأعمال المدنية والمباني والبنية التحتية. ندير دورة المشروع كاملة من التخطيط المسبق والمشتريات حتى التنفيذ والتشغيل التجريبي، لضمان جداول زمنية واضحة وتكاليف مضبوطة ومواقع آمنة.',
      drivesTitle: 'ما يحفزنا',
      drivesIntro: 'نركز على السلامة والموثوقية وبناء شراكات طويلة الأمد مع العملاء.',
      missionTitle: 'رسالتنا',
      missionDesc:
        'تنفيذ المشاريع بتخطيط منضبط ومواقع آمنة وتقارير واضحة ليبقى العميل مسيطرا على كل مرحلة.',
      visionTitle: 'رؤيتنا',
      visionDesc: 'أن نكون الشريك التعاقدي الموثوق في الكويت للمشاريع العامة والتجارية والبنية التحتية.',
      valuesTitle: 'قيمنا',
      values: [
        'السلامة أولاً',
        'النزاهة والشفافية',
        'الالتزام بالمواعيد',
        'جودة بلا تنازل',
        'تحسين مستمر',
      ],
      highlightsTitle: 'ما نقدمه',
      highlights: [
        {
          title: 'المقاولات العامة',
          description: 'تنفيذ متكامل بنظم ضبط الوقت والتكلفة والجودة.',
        },
        {
          title: 'تصميم وتنفيذ',
          description: 'حلول متكاملة تقلل المخاطر وتسرع الإنجاز.',
        },
        {
          title: 'الأعمال المدنية والبنية التحتية',
          description: 'طرق وشبكات وخدمات عامة مع خطط سلامة وتحويلات مرورية.',
        },
        {
          title: 'أعمال الكهروميكانيك والتشطيبات',
          description: 'تنسيق أعمال MEP والتشطيبات لضمان الجاهزية التشغيلية.',
        },
      ],
      sectorsTitle: 'القطاعات التي نخدمها',
      sectors: ['الجهات الحكومية', 'التجاري', 'السكني', 'الصناعي', 'الرعاية الصحية', 'التعليم'],
      processTitle: 'طريقة عملنا',
      process: [
        {
          title: 'التخطيط',
          description: 'توحيد النطاق والمخاطر واستراتيجية التوريد مع المالك والاستشاري.',
        },
        {
          title: 'التجهيز',
          description: 'تجهيز الفرق وأنظمة السلامة ولوجستيات الموقع قبل البدء.',
        },
        {
          title: 'التنفيذ',
          description: 'تنفيذ مع تقارير يومية وفحوصات وتحديثات لأصحاب المصلحة.',
        },
        {
          title: 'التسليم',
          description: 'تشغيل الأنظمة وتسليم المشروع مع جميع الوثائق.',
        },
      ],
      journeyTitle: 'رحلتنا',
      journeyIntro: 'محطات رئيسية شكلت نموذج تسليمنا في الكويت.',
      journey: [
        {
          year: '2008',
          title: 'تأسيس الشركة',
          description: 'انطلقنا كمقاول مدني يخدم الأعمال البلدية والتجارية.',
        },
        {
          year: '2012',
          title: 'النمو في القطاع الحكومي',
          description: 'وسعنا القدرة على تنفيذ برامج الجهات الحكومية والبنية التحتية.',
        },
        {
          year: '2016',
          title: 'تكامل أعمال MEP',
          description: 'طورنا التنسيق الداخلي لأنظمة المباني وحزم التشطيبات.',
        },
        {
          year: '2020',
          title: 'إدارة البرامج',
          description: 'وحدنا التقارير ونقاط فحص الجودة وقيادة السلامة عبر المواقع.',
        },
        {
          year: '2024',
          title: 'نموذج تسليم متكامل',
          description: 'جمعنا التخطيط المسبق والمشتريات والتشغيل لتسليم أسرع.',
        },
      ],
      assuranceTitle: 'السلامة والجودة',
      assuranceDesc:
        'برنامج HSE وQA/QC يجمع بين إشراف ميداني واجتماعات سلامة ونقاط فحص لضمان سلامة الأفراد والالتزام بالمواصفات.',
      stats: [
        { value: '18+', label: 'سنة خبرة' },
        { value: '200+', label: 'مشروع منجز' },
        { value: '35', label: 'موقع نشط' },
        { value: '3.2M', label: 'م2 منفذة' },
      ],
      ctaTitle: 'خطط لمشروعك القادم',
      ctaDesc: 'شاركنا نطاق العمل والجدول الزمني لنقترح أسلوب التنفيذ المناسب.',
      ctaButton: 'تواصل معنا',
    },

  }

  const [pageContent, setPageContent] = useState<any | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/pages/overview', { cache: 'no-store' })
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

  const baseData = localContent[language as keyof typeof localContent]
  const cmsData = (pageContent as any)?.[language] ?? null
  const data = { ...baseData, ...(cmsData && typeof cmsData === 'object' ? cmsData : {}) }

  return (
    <main className={styles.page}>
      <Header />

      <div className={styles.content}>
        <section id="main-content" tabIndex={-1} className={styles.overviewHero}>
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

        <section className={styles.intro}>
          <div className={styles.container}>
            <div className={styles.introCard}>
              <div className={styles.introGrid}>
                <p className={styles.introText}>{data.intro}</p>
                <div className={styles.statsGrid}>
                  {data.stats.map((stat: { label: string; value: string }, index: number) => (
                    <div
                      key={stat.label}
                      className={styles.statCard}
                      style={{ '--i': index } as React.CSSProperties}
                    >
                      <div className={styles.statValue}>{stat.value}</div>
                      <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.drives}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                  <Target className={styles.titleIconSvg} data-reveal-skip />
                </span>
                <span className={styles.titleText}>{data.drivesTitle}</span>
              </h2>
              <p className={styles.sectionIntro}>{data.drivesIntro}</p>
            </div>
            <div className={styles.drivesGrid}>
              <div className={styles.driveCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon} aria-hidden="true" data-reveal-skip>
                    <Milestone className={styles.cardIconSvg} data-reveal-skip />
                  </span>
                  <h3 className={styles.cardTitle}>{data.missionTitle}</h3>
                </div>
                <p className={styles.cardText}>{data.missionDesc}</p>
              </div>
              <div className={styles.driveCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon} aria-hidden="true" data-reveal-skip>
                    <Eye className={styles.cardIconSvg} data-reveal-skip />
                  </span>
                  <h3 className={styles.cardTitle}>{data.visionTitle}</h3>
                </div>
                <p className={styles.cardText}>{data.visionDesc}</p>
              </div>
              <div className={styles.valuesCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon} aria-hidden="true" data-reveal-skip>
                    <ShieldCheck className={styles.cardIconSvg} data-reveal-skip />
                  </span>
                  <h3 className={styles.cardTitle}>{data.valuesTitle}</h3>
                </div>
                <div className={styles.valuesList}>
                  {data.values.map((value: string, index: number) => (
                    <span
                      key={value}
                      className={styles.valuePill}
                      style={{ '--i': index } as React.CSSProperties}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.highlights}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                <HardHat className={styles.titleIconSvg} data-reveal-skip />
              </span>
              <span className={styles.titleText}>{data.highlightsTitle}</span>
            </h2>
            <div className={styles.highlightGrid}>
              {data.highlights.map((item: { title: string; description: string }, index: number) => {
                const Icon = highlightIcons[index % highlightIcons.length]
                return (
                  <div
                    key={item.title}
                    className={styles.highlightCard}
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.cardIcon} aria-hidden="true" data-reveal-skip>
                        <Icon className={styles.cardIconSvg} data-reveal-skip />
                      </span>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                    </div>
                    <p className={styles.cardText}>{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className={styles.sectors}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                <Layers className={styles.titleIconSvg} data-reveal-skip />
              </span>
              <span className={styles.titleText}>{data.sectorsTitle}</span>
            </h2>
            <div className={styles.sectorGrid}>
              {data.sectors.map((sector: string, index: number) => (
                <span
                  key={sector}
                  className={styles.sectorPill}
                  style={{ '--i': index } as React.CSSProperties}
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.process}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                <ClipboardList className={styles.titleIconSvg} data-reveal-skip />
              </span>
              <span className={styles.titleText}>{data.processTitle}</span>
            </h2>
            <div className={styles.processGrid}>
              {data.process.map((step: { title: string; description: string }, index: number) => {
                const Icon = processIcons[index % processIcons.length]
                return (
                  <div
                    key={step.title}
                    className={styles.processCard}
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    <div className={styles.processIndexRow}>
                      <div className={styles.processIndex}>{String(index + 1).padStart(2, '0')}</div>
                      <span className={styles.processIcon} aria-hidden="true" data-reveal-skip>
                        <Icon className={styles.processIconSvg} data-reveal-skip />
                      </span>
                    </div>
                    <h3 className={styles.cardTitle}>{step.title}</h3>
                    <p className={styles.cardText}>{step.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className={styles.journey}>
          <div className={styles.container}>
            <div className={`${styles.sectionHeader} ${styles.journeyHeader}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                  <Milestone className={styles.titleIconSvg} data-reveal-skip />
                </span>
                <span className={styles.titleText}>{data.journeyTitle}</span>
              </h2>
              <p className={styles.sectionIntro}>{data.journeyIntro}</p>
            </div>
            <ol className={styles.journeyTimeline} aria-label={data.journeyTitle}>
              {data.journey.map((item: { year: string; title: string; description: string }) => (
                <li key={item.year} className={styles.journeyItem}>
                  <div className={styles.journeyMarker}>
                    <time className={styles.journeyYearBadge} dateTime={item.year}>
                      {item.year}
                    </time>
                  </div>
                  <div className={styles.journeyBody}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardText}>{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.assurance}>
          <div className={styles.container}>
            <div className={styles.assuranceCard}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                  <ShieldCheck className={styles.titleIconSvg} data-reveal-skip />
                </span>
                <span className={styles.titleText}>{data.assuranceTitle}</span>
              </h2>
              <p className={styles.assuranceText}>{data.assuranceDesc}</p>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.container}>
            <div className={styles.ctaCard}>
              <div className={styles.ctaGlow} aria-hidden="true" data-reveal-skip />
              <div>
                <h2 className={styles.ctaTitle}>
                  <span className={styles.ctaTitleIcon} aria-hidden="true" data-reveal-skip>
                    <MessageCircle className={styles.ctaTitleIconSvg} data-reveal-skip />
                  </span>
                  <span className={styles.titleText}>{data.ctaTitle}</span>
                </h2>
                <p className={styles.ctaText}>{data.ctaDesc}</p>
              </div>
              <Link href="/contact" className={styles.ctaButton}>
                {data.ctaButton}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}

export default function Overview() {
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

  return <OverviewContent />
}
