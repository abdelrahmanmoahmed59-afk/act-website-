'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, FileText, MessageCircle } from 'lucide-react'

import ClientsSection, { type SuccessClientsContentByLanguage } from '@/components/clients-section'
import { useLanguage } from '@/providers/language-provider'
import styles from './page.module.css'
import type { Language } from '@/lib/i18n/base-translations'

type ClientsStat = { value: string; label: string }
type ClientsSegment = { title: string; description: string }
type ClientsTestimonial = { quote: string; name: string; role: string }

type ClientsPageCopy = {
  eyebrow: string
  title: string
  subtitle: string
  primaryAction: string
  secondaryAction: string
  introTitle: string
  intro: string
  stats: ClientsStat[]
  segmentsTitle: string
  segments: ClientsSegment[]
  testimonialsTitle: string
  testimonials: ClientsTestimonial[]
  logosTitle: string
  logosIntro: string
  logosText: string[]
  ctaTitle: string
  ctaDesc: string
  ctaButton: string
}

export type ClientsContentByLanguage = Record<Language, ClientsPageCopy>

export default function ClientsClient({
  content,
  successClientsContent,
}: {
  content?: ClientsContentByLanguage
  successClientsContent?: SuccessClientsContentByLanguage
}) {
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight

  const [remoteContent, setRemoteContent] = useState<ClientsContentByLanguage | null>(() => content ?? null)
  const [remoteSuccess, setRemoteSuccess] = useState<SuccessClientsContentByLanguage | undefined>(() => successClientsContent)
  const [loading, setLoading] = useState(() => !content)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (content) return
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const languages: Language[] = ['en', 'ar']

        const [clientsResponses, successResponses] = await Promise.all([
          Promise.all(
            languages.map(async (lang) => {
              const res = await fetch(`/api/clients?lang=${lang}`, { cache: 'no-store' })
              const json = await res.json().catch(() => null)
              if (!res.ok) throw new Error((json as any)?.details ?? (json as any)?.error ?? 'Failed to load clients content')
              return { lang, json }
            })
          ),
          Promise.all(
            languages.map(async (lang) => {
              const res = await fetch(`/api/success-clients?lang=${lang}`, { cache: 'no-store' })
              const json = await res.json().catch(() => null)
              if (!res.ok) throw new Error((json as any)?.details ?? (json as any)?.error ?? 'Failed to load success clients content')
              return { lang, json }
            })
          ),
        ])

        const next: Partial<ClientsContentByLanguage> = {}
        for (const { lang, json } of clientsResponses) {
          if (!json?.settings) {
            if (!alive) return
            setRemoteContent(null)
            setRemoteSuccess(undefined)
            setLoading(false)
            return
          }
          next[lang] = {
            eyebrow: String(json.settings.eyebrow ?? ''),
            title: String(json.settings.title ?? ''),
            subtitle: String(json.settings.subtitle ?? ''),
            primaryAction: String(json.settings.primaryAction ?? ''),
            secondaryAction: String(json.settings.secondaryAction ?? ''),
            introTitle: String(json.settings.introTitle ?? ''),
            intro: String(json.settings.intro ?? ''),
            stats: Array.isArray(json.stats) ? json.stats.map((s: any) => ({ value: String(s.value ?? ''), label: String(s.label ?? '') })) : [],
            segmentsTitle: String(json.settings.segmentsTitle ?? ''),
            segments: Array.isArray(json.segments) ? json.segments.map((s: any) => ({ title: String(s.title ?? ''), description: String(s.description ?? '') })) : [],
            testimonialsTitle: String(json.settings.testimonialsTitle ?? ''),
            testimonials: Array.isArray(json.testimonials)
              ? json.testimonials.map((t: any) => ({ quote: String(t.quote ?? ''), name: String(t.name ?? ''), role: String(t.role ?? '') }))
              : [],
            logosTitle: String(json.settings.logosTitle ?? ''),
            logosIntro: String(json.settings.logosIntro ?? ''),
            logosText: Array.isArray(json.logosText) ? json.logosText.map((x: any) => String(x)) : [],
            ctaTitle: String(json.settings.ctaTitle ?? ''),
            ctaDesc: String(json.settings.ctaDesc ?? ''),
            ctaButton: String(json.settings.ctaButton ?? ''),
          }
        }

        const nextSuccess: Partial<SuccessClientsContentByLanguage> = {}
        for (const { lang, json } of successResponses) {
          if (!json?.settings) continue
          const logos = Array.isArray(json.logos) ? json.logos : []
          nextSuccess[lang] = {
            title: String(json.settings.title ?? ''),
            subtitle: String(json.settings.subtitle ?? ''),
            logos: logos.map((l: any) => ({ src: String(l.image ?? ''), alt: String(l.alt ?? '') })),
          }
        }

        if (!alive) return
        setRemoteContent(next as ClientsContentByLanguage)
        setRemoteSuccess(nextSuccess as SuccessClientsContentByLanguage)
        setLoading(false)
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Failed to load content.')
        setRemoteContent(null)
        setRemoteSuccess(undefined)
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [content])

  const data = remoteContent?.[language]

  const sections = useMemo(
    () => ({
      stats: data?.stats ?? [],
      segments: data?.segments ?? [],
      testimonials: data?.testimonials ?? [],
      logosText: data?.logosText ?? [],
    }),
    [data]
  )

  if (loading && !data) {
    return (
      <div className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <h1 className={styles.title}>{language === 'ar' ? '...جارٍ التحميل' : 'Loading…'}</h1>
            <p className={styles.subtitle}>{language === 'ar' ? 'يتم تحميل المحتوى من قاعدة البيانات.' : 'Fetching content from the database.'}</p>
          </div>
        </section>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <h1 className={styles.title}>{language === 'ar' ? 'لا يوجد محتوى بعد' : 'No content yet'}</h1>
            <p className={styles.subtitle} style={{ whiteSpace: 'pre-wrap' }}>
              {error ??
                (language === 'ar'
                  ? 'قم بإضافة المحتوى من لوحة التحكم ثم أعد تحميل الصفحة.'
                  : 'Add content from the admin dashboard, then refresh this page.')}
            </p>
            <div className={styles.heroActions}>
              <Link href="/admin/clients" className={`${styles.actionButton} ${styles.primaryAction}`}>
                <span className={styles.actionLabel}>{language === 'ar' ? 'فتح لوحة التحكم' : 'Open dashboard'}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className={styles.content}>
      <section id="main-content" tabIndex={-1} className={styles.hero}>
        <div className={styles.heroBackdrop} aria-hidden="true" data-reveal-skip>
          <div className={styles.heroGrid} />
          <div className={styles.heroOrb} data-variant="one" />
          <div className={styles.heroOrb} data-variant="two" />
          <div className={styles.heroOrb} data-variant="three" />
        </div>

        <div className={styles.container}>
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>{data.eyebrow}</span>
            <h1 className={styles.title}>{data.title}</h1>
            <p className={styles.subtitle}>{data.subtitle}</p>

            <div className={styles.heroActions}>
              <Link href="/get-quotation" className={`${styles.actionButton} ${styles.primaryAction}`}>
                <span className={styles.actionIcon} aria-hidden="true" data-reveal-skip>
                  <FileText className={styles.actionIconSvg} data-reveal-skip />
                </span>
                <span className={styles.actionLabel}>{data.primaryAction}</span>
                <ArrowIcon className={styles.actionArrow} aria-hidden="true" data-reveal-skip />
              </Link>

              <Link href="/contact" className={`${styles.actionButton} ${styles.secondaryAction}`}>
                <span className={styles.actionIcon} aria-hidden="true" data-reveal-skip>
                  <MessageCircle className={styles.actionIconSvg} data-reveal-skip />
                </span>
                <span className={styles.actionLabel}>{data.secondaryAction}</span>
                <ArrowIcon className={styles.actionArrow} aria-hidden="true" data-reveal-skip />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.intro}>
        <div className={styles.container}>
          <div className={styles.introGrid}>
            <div>
              <h2 className={styles.sectionTitle}>{data.introTitle}</h2>
              <p className={styles.introText}>{data.intro}</p>
            </div>
            <div className={styles.statsGrid}>
              {sections.stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className={styles.statCard} style={{ '--card-index': index } as any}>
                  <div className={styles.statValue} data-reveal-skip>
                    {stat.value}
                  </div>
                  <div className={styles.statLabel} data-reveal-skip>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.segments}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{data.segmentsTitle}</h2>
          <div className={styles.segmentGrid}>
            {sections.segments.map((segment, index) => (
              <div key={`${segment.title}-${index}`} className={styles.segmentCard} style={{ '--card-index': index } as any}>
                <h3 className={styles.segmentTitle} data-reveal-skip>
                  {segment.title}
                </h3>
                <p className={styles.segmentText} data-reveal-skip>
                  {segment.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.testimonials}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{data.testimonialsTitle}</h2>
          <div className={styles.testimonialGrid}>
            {sections.testimonials.map((t, index) => (
              <figure key={`${t.name}-${index}`} className={styles.testimonialCard} style={{ '--card-index': index } as any}>
                <blockquote className={styles.testimonialQuote} data-reveal-skip>
                  “{t.quote}”
                </blockquote>
                <figcaption className={styles.testimonialMeta} data-reveal-skip>
                  <span className={styles.testimonialName}>{t.name}</span>
                  <span className={styles.testimonialRole}>{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.logos}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{data.logosTitle}</h2>
          <p className={styles.sectionIntro}>{data.logosIntro}</p>
          <div className={styles.logoGrid} role="list">
            {sections.logosText.map((name, index) => (
              <div key={`${name}-${index}`} className={styles.logoBadge} role="listitem" data-reveal-skip>
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ClientsSection content={remoteSuccess} />

      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>{data.ctaTitle}</h2>
            <p className={styles.ctaDesc}>{data.ctaDesc}</p>
            <Link href="/contact" className={styles.ctaButton}>
              {data.ctaButton} <ArrowIcon className={styles.ctaArrow} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
