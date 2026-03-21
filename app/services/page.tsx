'use client'

import React, { useEffect, useState } from "react"
import Link from 'next/link'
import {
  AlarmClock,
  BadgeCheck,
  Building2,
  Calculator,
  ClipboardList,
  DraftingCompass,
  Factory,
  Handshake,
  Home,
  Landmark,
  Layers,
  MapPinned,
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

  const serviceIcons = [
    Building2,
    Calculator,
    ClipboardList,
    Home,
    Landmark,
    Route,
    Wrench,
    MapPinned,
    DraftingCompass,
  ] as const
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
          title: 'General Construction & Allied Services',
          description:
            'Integrated construction delivery for buildings, fit-out packages, and support trades managed under one coordinated team.',
          features: [
            'Main contracting and site execution',
            'Structural, finishing, and allied trade packages',
            'MEP coordination and handover support',
            'Quality, safety, and schedule control',
          ],
        },
        {
          id: 2,
          title: 'Construction Cost Consultancy',
          description:
            'Commercial guidance that helps clients understand budgets early, compare options, and keep construction costs under control.',
          features: [
            'Preliminary cost planning and benchmarking',
            'Bill of quantities and tender reviews',
            'Value engineering recommendations',
            'Budget tracking across project stages',
          ],
        },
        {
          id: 3,
          title: 'Project Management',
          description:
            'Structured project leadership from kickoff to closeout with clear reporting, risk control, and stakeholder coordination.',
          features: [
            'Program planning and milestone control',
            'Consultant and contractor coordination',
            'Progress reporting and issue escalation',
            'Risk, quality, and procurement oversight',
          ],
        },
        {
          id: 4,
          title: 'Real Estate',
          description:
            'Real estate support for clients seeking property opportunities, development positioning, and transaction guidance in Kuwait.',
          features: [
            'Property sourcing and opportunity review',
            'Market-oriented asset evaluation',
            'Buyer and seller coordination',
            'Development feasibility input',
          ],
        },
        {
          id: 5,
          title: 'Property Development & Investment',
          description:
            'Development planning and investment support focused on long-term value, workable phasing, and commercially viable delivery models.',
          features: [
            'Site potential and concept review',
            'Investment and development planning',
            'Phasing and delivery strategy',
            'Commercial positioning for projects',
          ],
        },
        {
          id: 6,
          title: 'Civil Engineering Works',
          description:
            'Execution of civil works packages for infrastructure, utilities, and external works with disciplined site controls.',
          features: [
            'Roads, pavements, and grading',
            'Drainage and utility networks',
            'Earthworks and enabling works',
            'Public realm and infrastructure support',
          ],
        },
        {
          id: 7,
          title: 'Facility Management',
          description:
            'Operational support services that help facilities remain safe, functional, and efficient after project completion.',
          features: [
            'Preventive and corrective maintenance',
            'MEP systems monitoring and upkeep',
            'Asset condition and service coordination',
            'Operational readiness support',
          ],
        },
        {
          id: 8,
          title: 'Land Sales',
          description:
            'Professional assistance for land transactions with practical evaluation of location, use potential, and development readiness.',
          features: [
            'Land parcel review and matching',
            'Use-case and development suitability checks',
            'Transaction coordination support',
            'Owner and buyer communication',
          ],
        },
        {
          id: 9,
          title: 'Architectural Drawings',
          description:
            'Architectural drawing services that translate project requirements into clear layouts, presentation sets, and coordinated documents.',
          features: [
            'Concept and schematic layouts',
            'Permit and presentation drawing sets',
            'Detailed architectural drafting',
            'Coordination with engineering disciplines',
          ],
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
      caseIntro: 'Selected completed projects that reflect our practical experience in contracting, construction, renovation, and residential delivery.',
      caseStudies: [
        {
          title: "Workers' Housing Project",
          scope: "Execution of full workers' housing facilities including structural works, internal services, finishing packages, and supporting site infrastructure.",
          result: 'Delivered as a complete accommodation project ready for occupancy with coordinated finishing, utilities, and handover requirements.',
        },
        {
          title: 'Mosque Renovation & Maintenance',
          scope: 'Renovation, repair, and maintenance works covering architectural finishes, essential building services, and ongoing site coordination.',
          result: 'Completed with careful attention to building condition, service continuity, and the functional requirements of an active mosque facility.',
        },
        {
          title: 'Commercial Building Project',
          scope: 'Full construction delivery including structural frame, envelope, internal finishes, electromechanical coordination, and external works.',
          result: 'Handed over as a complete commercial asset with controlled execution, coordinated trades, and readiness for tenant or owner use.',
        },
        {
          title: 'Large-Scale Housing Development',
          scope: 'Residential construction program covering repeated housing units, utility connections, road interfaces, and phased site delivery.',
          result: 'Managed as a large-scale housing package with consistent quality control, organized sequencing, and practical handover across multiple units.',
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
          title: 'الإنشاءات العامة والخدمات المساندة',
          description:
            'تنفيذ متكامل لأعمال البناء والمباني وحزم التشطيبات والأعمال المساندة من خلال فريق واحد منسق.',
          features: [
            'المقاولات الرئيسية وتنفيذ الأعمال بالموقع',
            'الأعمال الإنشائية والتشطيبات والحزم المساندة',
            'تنسيق أعمال الكهروميكانيك ودعم التسليم',
            'ضبط الجودة والسلامة والجدول الزمني',
          ],
        },
        {
          id: 2,
          title: 'استشارات تكاليف البناء',
          description: 'استشارات تجارية تساعد العملاء على فهم الميزانيات مبكرًا ومقارنة البدائل وضبط تكاليف التنفيذ.',
          features: [
            'التخطيط التقديري للتكلفة والمقارنات المرجعية',
            'حصر الكميات ومراجعة العطاءات',
            'اقتراحات الهندسة القيمية',
            'متابعة الميزانية خلال مراحل المشروع',
          ],
        },
        {
          id: 3,
          title: 'إدارة المشاريع',
          description: 'قيادة منظمة للمشروع من البداية حتى الإقفال مع تقارير واضحة وضبط للمخاطر وتنسيق بين جميع الأطراف.',
          features: [
            'التخطيط البرنامجي وضبط المراحل',
            'التنسيق بين الاستشاريين والمقاولين',
            'تقارير التقدم ومعالجة التحديات',
            'الإشراف على المخاطر والجودة والمشتريات',
          ],
        },
        {
          id: 4,
          title: 'العقارات',
          description:
            'دعم عقاري للعملاء الباحثين عن فرص مناسبة وتقييم الأصول وربط القرارات العقارية بأهداف التطوير.',
          features: [
            'البحث عن الفرص العقارية المناسبة',
            'تقييم الأصول من منظور السوق',
            'التنسيق بين البائعين والمشترين',
            'مدخلات أولية لجدوى التطوير',
          ],
        },
        {
          id: 5,
          title: 'تطوير واستثمار العقارات',
          description:
            'خدمات تخطيط التطوير والاستثمار بما يركز على القيمة طويلة الأجل ومراحل تنفيذ عملية ونماذج تطوير مجدية.',
          features: [
            'دراسة إمكانات الموقع والفكرة التطويرية',
            'التخطيط الاستثماري والتطويري',
            'وضع مراحل التنفيذ والاستراتيجية',
            'التموضع التجاري للمشاريع',
          ],
        },
        {
          id: 6,
          title: 'الأعمال الهندسية المدنية',
          description:
            'تنفيذ حزم الأعمال المدنية للبنية التحتية والمرافق والأعمال الخارجية مع ضبط دقيق للموقع.',
          features: [
            'الطرق والساحات وأعمال التسوية',
            'شبكات التصريف والمرافق',
            'أعمال الحفر والتهيئة',
            'دعم البنية التحتية والأعمال الخارجية',
          ],
        },
        {
          id: 7,
          title: 'إدارة المرافق',
          description:
            'خدمات تشغيلية تساعد المنشآت على البقاء آمنة وفعالة وجاهزة للتشغيل بعد اكتمال المشروع.',
          features: [
            'الصيانة الوقائية والتصحيحية',
            'متابعة وصيانة أنظمة الكهروميكانيك',
            'تنسيق الأصول والخدمات التشغيلية',
            'دعم الجاهزية التشغيلية',
          ],
        },
        {
          id: 8,
          title: 'بيع الأراضي',
          description:
            'مساندة مهنية لعمليات بيع وشراء الأراضي مع تقييم عملي للموقع وقابلية الاستخدام والاستعداد للتطوير.',
          features: [
            'مراجعة قطع الأراضي ومطابقتها للاحتياج',
            'فحص ملاءمة الاستخدام والتطوير',
            'دعم تنسيق العملية البيعية',
            'التواصل بين الملاك والمشترين',
          ],
        },
        {
          id: 9,
          title: 'الرسومات المعمارية',
          description:
            'خدمات إعداد الرسومات المعمارية لتحويل متطلبات المشروع إلى مخططات واضحة وعروض تقديمية ووثائق منسقة.',
          features: [
            'المخططات المفاهيمية والابتدائية',
            'رسومات التقديم والتراخيص',
            'إعداد الرسومات المعمارية التفصيلية',
            'التنسيق مع التخصصات الهندسية',
          ],
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
      caseIntro: 'نماذج من المشاريع المنجزة التي تعكس خبرتنا العملية في المقاولات وأعمال البناء والترميم وتنفيذ المشروعات السكنية.',
      caseStudies: [
        {
          title: 'مشروع سكن عمال',
          scope: 'تنفيذ متكامل لمرافق سكن العمال بما يشمل الأعمال الإنشائية والخدمات الداخلية والتشطيبات والبنية التحتية المساندة للموقع.',
          result: 'تم تسليم المشروع كمجمع سكني مكتمل وجاهز للإشغال مع تنسيق أعمال التشطيبات والمرافق ومتطلبات التسليم.',
        },
        {
          title: 'ترميم وصيانة مسجد',
          scope: 'أعمال ترميم وإصلاح وصيانة شملت التشطيبات المعمارية والخدمات الأساسية للمبنى والتنسيق الموقعي المستمر.',
          result: 'أُنجزت الأعمال مع مراعاة حالة المبنى واستمرارية الخدمة والمتطلبات التشغيلية لمسجد قائم.',
        },
        {
          title: 'مشروع مبنى تجاري',
          scope: 'تنفيذ كامل للمبنى من الهيكل الإنشائي والواجهات والتشطيبات الداخلية وتنسيق الأعمال الكهروميكانيكية والأعمال الخارجية.',
          result: 'تم تسليم المبنى كأصل تجاري متكامل مع ضبط جيد للتنفيذ وتنسيق فعّال بين مختلف البنود والتخصصات.',
        },
        {
          title: 'مشروع إسكان واسع النطاق',
          scope: 'برنامج إنشاء سكني شمل وحدات متكررة مع توصيلات الخدمات والواجهات المرتبطة بالطرق وتسليم الموقع على مراحل.',
          result: 'تمت إدارة المشروع كحزمة إسكانية واسعة النطاق مع توحيد معايير الجودة وحسن ترتيب مراحل التنفيذ والتسليم العملي لعدة وحدات.',
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
