'use client'

import React, { useEffect, useState } from "react"
import Link from 'next/link'
import {
  AlarmClock,
  BadgeCheck,
  Building2,
  ClipboardList,
  Factory,
  Handshake,
  Home,
  Layers,
  MessageCircle,
  Network,
  Route,
  Sparkles,
  Warehouse,
  Wrench,
} from 'lucide-react'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import styles from './page.module.css'

function ServicesContent() {
  const { language } = useLanguage()

  const serviceIcons = [Building2, Home, Route, Wrench] as const
  const whyIcons = [Layers, BadgeCheck, AlarmClock, Network, Factory, MessageCircle] as const
  const caseIcons = [Building2, Warehouse, Route] as const

  const localContent = {
    en: {
      title: 'Our Services',
      intro:
        'Comprehensive construction and contracting solutions tailored to meet your project needs.',
      services: [
        {
          id: 1,
          title: 'Commercial Construction',
          description:
            'From concept to completion, we deliver state-of-the-art commercial buildings with modern designs and sustainable practices.',
          features: [
            'Office buildings',
            'Retail complexes',
            'Mixed-use developments',
            'Business parks',
          ],
        },
        {
          id: 2,
          title: 'Residential Development',
          description:
            'We create quality residential spaces that combine comfort, luxury, and durability.',
          features: ['Apartment complexes', 'Villas', 'Town houses', 'Master-planned communities'],
        },
        {
          id: 3,
          title: 'Infrastructure Projects',
          description:
            'Government and public infrastructure contracts delivered with precision and adherence to schedules.',
          features: ['Roads and highways', 'Water systems', 'Power facilities', 'Public buildings'],
        },
        {
          id: 4,
          title: 'Renovation & Restoration',
          description:
            'Complete modernization and restoration of existing structures while preserving structural integrity.',
          features: ['Building refurbishment', 'System upgrades', 'Interior redesign', 'Heritage restoration'],
        },
      ],
      whyTitle: 'Why Choose ACT',
      whyIntro: 'Operational discipline, local expertise, and a delivery model built for complex projects.',
      whyPoints: [
        {
          title: 'End-to-end delivery',
          description: 'Preconstruction, procurement, execution, and commissioning managed under one team.',
        },
        {
          title: 'Safety and QA/QC focus',
          description: 'HSE leadership, inspection gates, and daily site controls keep people and scope protected.',
        },
        {
          title: 'Schedule confidence',
          description: 'Detailed planning, real-time reporting, and proactive risk management on every site.',
        },
        {
          title: 'Local supply strength',
          description: 'Established vendor network and logistics planning to protect cost and lead times.',
        },
        {
          title: 'Multi-sector experience',
          description: 'Government, commercial, residential, and industrial programs delivered across Kuwait.',
        },
        {
          title: 'Transparent collaboration',
          description: 'Clear communication with owners, consultants, and stakeholders at every phase.',
        },
      ],
      caseTitle: 'Case Studies',
      caseIntro: 'A snapshot of how our teams deliver complex projects across Kuwait.',
      caseStudies: [
        {
          title: 'Kuwait City Mixed-Use Complex',
          scope: 'Commercial towers, retail podium, and MEP coordination.',
          result: 'Delivered phased handovers with strict safety controls and zero critical delays.',
        },
        {
          title: 'Industrial Logistics Hub',
          scope: 'Warehousing, utilities, and heavy-duty pavements.',
          result: 'Optimized site logistics and commissioning for 24/7 operations readiness.',
        },
        {
          title: 'Public Infrastructure Corridor',
          scope: 'Roadworks, drainage, and traffic management.',
          result: 'Maintained live traffic flow while meeting government milestones.',
        },
      ],
      readyTitle: 'Ready to Get Started',
      readyDesc: 'Tell us about your scope, schedule, and requirements. We will respond with the right delivery plan.',
      readyButton: 'Start a Project',
    },
    ar: {
      title: 'خدماتنا',
      intro: 'حلول بناء ومقاولات شاملة مصممة لتلبية احتياجات مشروعك.',
      services: [
        {
          id: 1,
          title: 'البناء التجاري',
          description:
            'من المفهوم إلى الإنجاز، نقدم مباني تجارية حديثة بتصاميم عصرية وممارسات مستدامة.',
          features: ['مباني المكاتب', 'المجمعات التجارية', 'المشاريع المختلطة', 'مدن الأعمال'],
        },
        {
          id: 2,
          title: 'التطوير السكني',
          description: 'نحن ننشئ مساحات سكنية عالية الجودة تجمع بين الراحة والفخامة والمتانة.',
          features: ['المجمعات السكنية', 'الفلل', 'التاون هاوسات', 'المجتمعات المخططة'],
        },
        {
          id: 3,
          title: 'المشاريع الهندسية',
          description: 'عقود البنية التحتية الحكومية والعامة المنفذة بدقة والالتزام بالجداول الزمنية.',
          features: ['الطرق والطرق السريعة', 'الأنظمة المائية', 'مرافق الطاقة', 'المباني العامة'],
        },
        {
          id: 4,
          title: 'التجديد والترميم',
          description:
            'تحديث وترميم شامل للهياكل الموجودة مع الحفاظ على سلامة البناء الهيكلي.',
          features: ['تجديد المباني', 'تحديث الأنظمة', 'إعادة تصميم داخلي', 'ترميم التراث'],
        },
      ],
      whyTitle: 'لماذا تختار ACT',
      whyIntro: 'انضباط تشغيلي وخبرة محلية ونموذج تسليم مناسب للمشاريع المعقدة.',
      whyPoints: [
        {
          title: 'تسليم متكامل',
          description: 'إدارة التخطيط المسبق والمشتريات والتنفيذ والتشغيل ضمن فريق واحد.',
        },
        {
          title: 'تركيز على السلامة والجودة',
          description: 'قيادة HSE ونقاط فحص الجودة وضبط يومي للمواقع.',
        },
        {
          title: 'ثقة في الجداول الزمنية',
          description: 'تخطيط تفصيلي وتقارير فورية وإدارة مخاطر استباقية.',
        },
        {
          title: 'قوة سلسلة التوريد',
          description: 'شبكة موردين راسخة وخطط لوجستية تحمي التكلفة والمدة.',
        },
        {
          title: 'خبرة متعددة القطاعات',
          description: 'تنفيذ مشاريع حكومية وتجارية وسكنية وصناعية داخل الكويت.',
        },
        {
          title: 'تعاون شفاف',
          description: 'تواصل واضح مع المالكين والاستشاريين وأصحاب المصلحة.',
        },
      ],
      caseTitle: 'دراسات حالة',
      caseIntro: 'لمحة عن كيفية تنفيذ فرقنا لمشاريع معقدة في الكويت.',
      caseStudies: [
        {
          title: 'مجمع متعدد الاستخدامات في مدينة الكويت',
          scope: 'أبراج تجارية ومنصة تجزئة وتنسيق أعمال MEP.',
          result: 'تسليم مرحلي مع ضوابط سلامة صارمة ودون تأخير حرج.',
        },
        {
          title: 'مركز لوجستي صناعي',
          scope: 'مستودعات ومرافق وخدمات وبلاطات تحميل ثقيلة.',
          result: 'تحسين لوجستيات الموقع والتشغيل لتجهيز العمل 24/7.',
        },
        {
          title: 'ممر بنية تحتية عامة',
          scope: 'أعمال طرق وتصريف وإدارة مرور.',
          result: 'الحفاظ على حركة المرور أثناء تحقيق معالم الجهة المالكة.',
        },
      ],
      readyTitle: 'جاهز للبدء',
      readyDesc: 'شاركنا نطاق العمل والجدول الزمني والمتطلبات لنقترح خطة التسليم المناسبة.',
      readyButton: 'ابدأ مشروعك',
    },
  }

  const [pageContent, setPageContent] = useState<any | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/pages/services', { cache: 'no-store' })
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
  const services = data.services

  return (
    <main className={styles.page}>
      <Header />

      <div className={styles.content}>
        <section id="main-content" tabIndex={-1} className={styles.servicesHero}>
          <div className={styles.heroBackdrop} aria-hidden="true" data-reveal-skip>
            <div className={styles.heroGrid} />
            <div className={styles.heroOrb} data-variant="one" />
            <div className={styles.heroOrb} data-variant="two" />
            <div className={styles.heroOrb} data-variant="three" />
          </div>

          <div className={styles.container}>
            <div className={styles.heroInner}>
              <h1 className={styles.title}>
                <span className={styles.heroTitleIcon} aria-hidden="true" data-reveal-skip>
                  <Sparkles className={styles.heroTitleIconSvg} data-reveal-skip />
                </span>
                <span className={styles.titleText}>{data.title}</span>
              </h1>
              <p className={styles.intro}>{data.intro}</p>
            </div>
          </div>
        </section>

      <section className={styles.servicesGrid}>
        <div className={styles.sectionBackdrop} aria-hidden="true" data-reveal-skip />
        <div className={styles.container}>
          <div className={styles.servicesCards}>
            {services.map(
              (
                service: { id: string; title: string; description: string; features: string[] },
                index: number
              ) => (
             <div
               key={service.id}
               className={styles.serviceCard}
               style={{ '--service-index': index } as React.CSSProperties}
             >
              <div className={styles.cardNumber}>{String(index + 1).padStart(2, '0')}</div>

              <div className={styles.serviceHeader}>
                <span className={styles.serviceIcon} aria-hidden="true" data-reveal-skip>
                  {React.createElement(serviceIcons[index % serviceIcons.length], {
                    className: styles.serviceIconSvg,
                  })}
                </span>
                <h2 className={styles.serviceTitle}>{service.title}</h2>
              </div>
              <p className={styles.serviceDescription}>{service.description}</p>

              <div className={styles.features}>
                <h3 className={styles.featuresTitle}>
                  {language === 'en' ? 'What we offer:' : 'ما نقدمه:'}
                 </h3>
                 <ul className={styles.featuresList}>
                  {service.features.map((feature: string, i: number) => (
                    <li key={i} className={styles.featureItem}>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.cardAccent} />
            </div>
            )
            )}
          </div>
        </div>
      </section>

      <section className={styles.caseStudies}>
        <div className={styles.container}>
          <div className={styles.caseHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                <ClipboardList className={styles.titleIconSvg} data-reveal-skip />
              </span>
              <span className={styles.titleText}>{data.caseTitle}</span>
            </h2>
            <p className={styles.caseIntro}>{data.caseIntro}</p>
          </div>
          <div className={styles.caseGrid}>
            {data.caseStudies.map((study: { title: string; scope: string; result: string }, index: number) => (
              <article
                key={study.title}
                className={styles.caseCard}
                style={{ '--case-index': index } as React.CSSProperties}
              >
                <div className={styles.caseCardHeader}>
                  <span className={styles.caseIcon} aria-hidden="true" data-reveal-skip>
                    {React.createElement(caseIcons[index % caseIcons.length], {
                      className: styles.caseIconSvg,
                    })}
                  </span>
                  <h3 className={styles.caseCardTitle}>{study.title}</h3>
                </div>
                <p className={styles.caseMeta}>
                  <span className={styles.caseLabel}>
                    {language === 'en' ? 'Scope:' : 'النطاق:'}
                  </span>
                  {study.scope}
                </p>
                <p className={styles.caseMeta}>
                  <span className={styles.caseLabel}>
                    {language === 'en' ? 'Result:' : 'النتيجة:'}
                  </span>
                  {study.result}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.whyChoose}>
        <div className={styles.container}>
          <div className={styles.whyHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon} aria-hidden="true" data-reveal-skip>
                <BadgeCheck className={styles.titleIconSvg} data-reveal-skip />
              </span>
              <span className={styles.titleText}>{data.whyTitle}</span>
            </h2>
            <p className={styles.whyIntro}>{data.whyIntro}</p>
          </div>
          <div className={styles.whyGrid}>
            {data.whyPoints.map((point: { title: string; description: string }, index: number) => (
              <div
                key={point.title}
                className={styles.whyCard}
                style={{ '--why-index': index } as React.CSSProperties}
              >
                <div className={styles.whyCardHeader}>
                  <span className={styles.whyIcon} aria-hidden="true" data-reveal-skip>
                    {React.createElement(whyIcons[index % whyIcons.length], {
                      className: styles.whyIconSvg,
                    })}
                  </span>
                  <h3 className={styles.whyCardTitle}>{point.title}</h3>
                </div>
                <p className={styles.whyCardText}>{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ready}>
        <div className={styles.container}>
          <div className={styles.readyCard}>
            <div className={styles.readyGlow} aria-hidden="true" data-reveal-skip />
            <div>
              <h2 className={styles.readyTitle}>
                <span className={styles.readyTitleIcon} aria-hidden="true" data-reveal-skip>
                  <Handshake className={styles.readyTitleIconSvg} data-reveal-skip />
                </span>
                <span className={styles.titleText}>{data.readyTitle}</span>
              </h2>
              <p className={styles.readyText}>{data.readyDesc}</p>
            </div>
            <Link href="/contact" className={styles.readyButton}>
              {data.readyButton}
            </Link>
          </div>
        </div>
      </section>

      </div>

      <Footer />
    </main>
  )
}

export default function Services() {
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

  return <ServicesContent />
}
