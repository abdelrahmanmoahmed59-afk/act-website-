'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  MapPin,
  Tag,
  Wallet,
  Wrench,
} from 'lucide-react'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import type { LocalizedProject } from '@/lib/projects'
import styles from './page.module.css'

function normalizeSlug(value: string | string[] | undefined) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] ?? ''
  return ''
}

function getMediaFit(src: string) {
  const normalized = src.toLowerCase()
  if (normalized.endsWith('.svg')) return 'contain'
  if (normalized.startsWith('/projects/') && normalized.endsWith('.png')) return 'contain'
  return 'cover'
}

function ProjectDetailsContent({ slug }: { slug: string }) {
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const [galleryAspects, setGalleryAspects] = useState<Record<string, string>>({})
  const [project, setProject] = useState<LocalizedProject | null>(null)
  const [loaded, setLoaded] = useState(false)

  const ui = useMemo(
    () => ({
      en: {
        back: 'Back to Projects',
        eyebrow: 'PROJECT DETAILS',
        overviewTitle: 'Project Industry Excellence',
        overviewLead:
          'Each delivery combines disciplined planning, safety-first execution, and QA/QC controls to protect schedule and quality.',
        detailsCardTitle: 'Project Details',
        detailsLabels: {
          sector: 'Sector',
          projectType: 'Project Type',
          year: 'Year',
          status: 'Status',
          client: 'Client',
          location: 'Location',
          cost: 'Contract Value',
        },
        solutionsTitle: 'Key Solutions',
        solutionsIntro: 'A consistent delivery model across complex project scopes.',
        operationsTitle: 'Operational Areas',
        operationsIntro: 'Comprehensive coverage across construction operations',
        galleryTitle: 'Project Gallery',
        galleryIntro: 'Selected visuals and reference material from the project delivery.',
        highlightsTitle: 'Project Highlights',
        ctaTitle: 'Optimize Project Delivery',
        ctaText: 'Partner with ACT for reliable contracting solutions, delivered with clarity and control.',
        ctaButton: 'Contact Our Team',
        notFoundTitle: 'Project not found',
        notFoundText:
          'The project you’re looking for does not exist, or the link is no longer available.',
        notFoundButton: 'View all projects',
      },
      ar: {
        back: 'العودة إلى المشاريع',
        eyebrow: 'تفاصيل المشروع',
        overviewTitle: 'تميّز التنفيذ',
        overviewLead:
          'نعتمد على التخطيط المنضبط، وتنفيذ يضع السلامة أولاً، وضوابط الجودة لضمان الالتزام بالوقت والجودة.',
        detailsCardTitle: 'تفاصيل المشروع',
        detailsLabels: {
          sector: 'القطاع',
          projectType: 'نوع المشروع',
          year: 'السنة',
          status: 'الحالة',
          client: 'العميل',
          location: 'الموقع',
          cost: 'قيمة العقد',
        },
        solutionsTitle: 'حلول رئيسية',
        solutionsIntro: 'نموذج تسليم ثابت لمشاريع معقّدة وبنطاقات متعددة.',
        operationsTitle: 'مجالات التشغيل',
        operationsIntro: 'تغطية شاملة عبر عمليات التنفيذ',
        galleryTitle: 'معرض الصور',
        galleryIntro: 'مجموعة من المرئيات والمواد المرجعية من تنفيذ المشروع.',
        highlightsTitle: 'أبرز النقاط',
        ctaTitle: 'حسّن تسليم مشروعك',
        ctaText: 'تعاون مع ACT للحصول على حلول مقاولات موثوقة بوضوح وتحكم.',
        ctaButton: 'تواصل مع فريقنا',
        notFoundTitle: 'لم يتم العثور على المشروع',
        notFoundText: 'المشروع المطلوب غير موجود أو تم نقل الرابط.',
        notFoundButton: 'عرض كل المشاريع',
      },
    }),
    []
  )

  const t = ui[language]
  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoaded(false)
      try {
        const res = await fetch(`/api/projects/${slug}?lang=${language}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('project')
        const json = await res.json()
        const next = (json?.project as LocalizedProject) ?? null
        if (!alive) return
        setProject(next ?? null)
        setLoaded(true)
      } catch {
        if (!alive) return
        setProject(null)
        setLoaded(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [slug, language])

  const opsCards = useMemo(
    () => [
      {
        icon: Wrench,
        title: language === 'ar' ? 'التخطيط والتحضير' : 'Planning & Setup',
        description: project?.methodology?.[0] ?? '',
      },
      {
        icon: BriefcaseBusiness,
        title: language === 'ar' ? 'المشتريات واللوجستيات' : 'Procurement & Logistics',
        description: project?.methodology?.[1] ?? '',
      },
      {
        icon: BadgeCheck,
        title: language === 'ar' ? 'التنفيذ وضبط الجودة' : 'Execution & QA/QC',
        description: project?.methodology?.[2] ?? '',
      },
      {
        icon: Calendar,
        title: language === 'ar' ? 'التسليم والإغلاق' : 'Handover & Closeout',
        description: project?.methodology?.[3] ?? '',
      },
    ],
    [language, project?.methodology]
  )

  const keySolutions = useMemo(
    () =>
      language === 'ar'
        ? [
            'مراقبة الجدول والتقدم',
            'تنسيق المقاولين والموردين',
            'ضبط الجودة QA/QC',
            'أنظمة السلامة وإدارة الموقع',
            'الامتثال والمتطلبات التنظيمية',
            'التشغيل والتسليم',
          ]
        : [
            'Schedule & progress monitoring',
            'Subcontractor and vendor coordination',
            'QA/QC inspection gates',
            'Safety systems and site controls',
            'Compliance and stakeholder reporting',
            'Commissioning and handover readiness',
          ],
    [language]
  )

  const highlightCards = useMemo(
    () => [
      {
        title: language === 'ar' ? 'إدارة المشروع' : 'Project Management',
        description: language === 'ar' ? 'تخطيط وتقارير واضحة' : 'Clear plans and reporting cadence',
      },
      {
        title: language === 'ar' ? 'السلامة' : 'Safety Systems',
        description:
          language === 'ar' ? 'قيادة HSE وضوابط الموقع' : 'HSE leadership and daily site controls',
      },
      {
        title: language === 'ar' ? 'الجودة' : 'Quality Assurance',
        description:
          language === 'ar' ? 'بوابات فحص وتوثيق' : 'Inspection gates and documentation',
      },
      {
        title: language === 'ar' ? 'تنسيق MEP' : 'MEP Coordination',
        description:
          language === 'ar' ? 'دمج الخدمات بدون تعارضات' : 'Integrated services without clashes',
      },
      {
        title: language === 'ar' ? 'إدارة التكلفة' : 'Cost Tracking',
        description:
          language === 'ar' ? 'شفافية في التكاليف والتغييرات' : 'Transparent variations and controls',
      },
      {
        title: language === 'ar' ? 'التسليم' : 'Handover Support',
        description:
          language === 'ar' ? 'تشغيل وتسليم منظم' : 'Commissioning-ready closeout packages',
      },
    ],
    [language]
  )

  if (!loaded) {
    return (
      <main className={styles.page}>
        <Header />
        <section id="main-content" tabIndex={-1} className={styles.content}>
          <div className={styles.container}>
            <p style={{ color: 'rgba(226,232,240,0.72)' }}>Loading…</p>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  if (!project) {
    return (
      <main className={styles.page}>
        <Header />
        <section id="main-content" tabIndex={-1} className={styles.content}>
          <div className={styles.background} aria-hidden="true" data-reveal-skip>
            <div className={styles.backgroundGrid} />
            <div className={styles.backgroundOrb} data-variant="one" />
            <div className={styles.backgroundOrb} data-variant="two" />
            <div className={styles.backgroundOrb} data-variant="three" />
          </div>

          <div className={styles.container}>
            <div className={styles.notFoundCard}>
              <h1 className={styles.notFoundTitle}>{t.notFoundTitle}</h1>
              <p className={styles.notFoundText}>{t.notFoundText}</p>
              <Link href="/projects" className={styles.notFoundButton}>
                {t.notFoundButton}
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  const BackIcon = isArabic ? ArrowRight : ArrowLeft
  const CtaIcon = isArabic ? ArrowLeft : ArrowRight

  const detailsItems = [
    { icon: Tag, label: t.detailsLabels.sector, value: project.sector },
    { icon: BriefcaseBusiness, label: t.detailsLabels.projectType, value: project.projectType },
    { icon: Calendar, label: t.detailsLabels.year, value: project.year },
    { icon: BadgeCheck, label: t.detailsLabels.status, value: project.status },
    { icon: Building2, label: t.detailsLabels.client, value: project.client },
    { icon: MapPin, label: t.detailsLabels.location, value: project.location },
    { icon: Wallet, label: t.detailsLabels.cost, value: project.cost },
  ]

  const heroSrc = project.images[0] || '/placeholder.jpg'
  const heroFit = getMediaFit(heroSrc)

  return (
    <main className={styles.page}>
      <Header />

      <section id="main-content" tabIndex={-1} className={styles.content}>
        <div className={styles.background} aria-hidden="true" data-reveal-skip>
          <div className={styles.backgroundGrid} />
          <div className={styles.backgroundOrb} data-variant="one" />
          <div className={styles.backgroundOrb} data-variant="two" />
          <div className={styles.backgroundOrb} data-variant="three" />
        </div>

        <div className={styles.container}>
          <header className={styles.hero}>
            <div
              className={styles.heroMedia}
              aria-hidden="true"
              data-reveal-skip
              data-fit={heroFit}
            >
              <Image
                src={heroSrc}
                alt=""
                fill
                sizes="100vw"
                priority
                className={styles.heroImage}
              />
              <div className={styles.heroMediaOverlay} />
            </div>

            <Link href="/projects" className={styles.backLink} aria-label={t.back}>
              <BackIcon className={styles.backIcon} aria-hidden="true" />
              <span>{t.back}</span>
            </Link>

            <p className={styles.eyebrow}>{t.eyebrow}</p>
            <h1 className={styles.heroTitle}>{project.title}</h1>
            <p className={styles.heroSubtitle}>{project.summary}</p>
          </header>

          <section className={styles.splitSection} aria-label={t.overviewTitle}>
            <div className={styles.splitGrid}>
              <div className={styles.overview}>
                <h2 className={styles.sectionTitle}>{t.overviewTitle}</h2>
                <p className={styles.lead}>{t.overviewLead}</p>
                <p className={styles.overviewText}>{project.details}</p>
              </div>

              <div className={styles.sidebar}>
                <aside className={styles.detailsCard} aria-label={t.detailsCardTitle}>
                  <h2 className={styles.cardTitle}>{t.detailsCardTitle}</h2>
                  <ul className={styles.detailsList}>
                    {detailsItems.map((item) => (
                      <li key={item.label} className={styles.detailsItem}>
                        <span className={styles.detailsIcon} aria-hidden="true" data-reveal-skip>
                          <item.icon className={styles.detailsIconSvg} data-reveal-skip />
                        </span>
                        <div className={styles.detailsBody}>
                          <p className={styles.detailsLabel}>{item.label}</p>
                          <p className={styles.detailsValue}>{item.value}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </aside>

                <aside className={styles.solutionsCard} aria-label={t.solutionsTitle}>
                  <h2 className={styles.cardTitle}>{t.solutionsTitle}</h2>
                  <p className={styles.solutionsIntro}>{t.solutionsIntro}</p>
                  <ul className={styles.solutionsList}>
                    {keySolutions.map((solution) => (
                      <li key={solution} className={styles.solutionItem}>
                        <span className={styles.solutionIcon} aria-hidden="true" data-reveal-skip>
                          <CheckCircle2 className={styles.solutionIconSvg} data-reveal-skip />
                        </span>
                        <span className={styles.solutionText}>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </div>
          </section>

          <section className={styles.gallerySection} aria-label={t.galleryTitle}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitleCentered}>{t.galleryTitle}</h2>
              <p className={styles.sectionIntro}>{t.galleryIntro}</p>
            </header>

            <div className={styles.galleryGrid} role="list">
              {project.images.map((src, index) => {
                const fit = getMediaFit(src)
                const itemKey = `${src}-${index}`
                const aspect = galleryAspects[itemKey]
                return (
                  <div key={`${src}-${index}`} className={styles.galleryItem} role="listitem">
                    <div
                      className={styles.galleryMedia}
                      data-fit={fit}
                      style={
                        aspect
                          ? ({ '--gallery-aspect': aspect } as React.CSSProperties)
                          : undefined
                      }
                    >
                      <Image
                        src={src}
                        alt={
                          isArabic
                            ? `صورة ${index + 1} لمشروع ${project.title}`
                            : `Project image ${index + 1} for ${project.title}`
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                        className={styles.galleryImage}
                        onLoadingComplete={(imageElement) => {
                          const width = imageElement.naturalWidth
                          const height = imageElement.naturalHeight
                          if (!width || !height) return

                          const ratio = (width / height).toFixed(4)
                          setGalleryAspects((prev) => {
                            if (prev[itemKey] === ratio) return prev
                            return { ...prev, [itemKey]: ratio }
                          })
                        }}
                      />
                      <div className={styles.galleryOverlay} aria-hidden="true" data-reveal-skip />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className={styles.operationsSection} aria-label={t.operationsTitle}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitleCentered}>{t.operationsTitle}</h2>
              <p className={styles.sectionIntro}>{t.operationsIntro}</p>
            </header>

            <div className={styles.operationsGrid}>
              {opsCards.map((card, index) => (
                <article
                  key={card.title}
                  className={styles.operationCard}
                  style={{ '--op-index': index } as React.CSSProperties}
                >
                  <span className={styles.operationIcon} aria-hidden="true" data-reveal-skip>
                    <card.icon className={styles.operationIconSvg} data-reveal-skip />
                  </span>
                  <h3 className={styles.operationTitle}>{card.title}</h3>
                  <p className={styles.operationText}>{card.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.highlightsSection} aria-label={t.highlightsTitle}>
            <h2 className={styles.sectionTitleCentered}>{t.highlightsTitle}</h2>
            <div className={styles.highlightsGrid}>
              {highlightCards.map((card, index) => (
                <article
                  key={card.title}
                  className={styles.highlightCard}
                  style={{ '--highlight-index': index } as React.CSSProperties}
                >
                  <h3 className={styles.highlightTitle}>{card.title}</h3>
                  <p className={styles.highlightText}>{card.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.ctaSection} aria-label={t.ctaTitle}>
            <div className={styles.ctaCard}>
              <div>
                <h2 className={styles.ctaTitle}>{t.ctaTitle}</h2>
                <p className={styles.ctaText}>{t.ctaText}</p>
              </div>
              <Link href="/contact" className={styles.ctaButton}>
                {t.ctaButton}
                <CtaIcon className={styles.ctaIcon} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function ProjectDetailsPage() {
  const params = useParams<{ slug?: string | string[] }>()
  const slug = normalizeSlug(params?.slug)
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

  return <ProjectDetailsContent slug={slug} />
}
