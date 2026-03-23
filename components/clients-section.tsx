'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'

import { useLanguage } from '@/providers/language-provider'
import styles from './clients-section.module.css'
import type { Language } from '@/lib/i18n/base-translations'

type ClientLogo = {
  src: string
  alt: { en: string; ar: string }
}

export type SuccessClientsContentByLanguage = Record<
  Language,
  {
    title: string
    subtitle: string
    logos: Array<{ src: string; alt: string }>
  }
>

const DEFAULT_LOGOS: ClientLogo[] = [
  { src: '/placeholder-logo.png', alt: { en: 'Tiba Mills', ar: 'تيبا ميلز' } },
  { src: '/placeholder-logo.png', alt: { en: 'Egyptian Railways', ar: 'سكك حديد مصر' } },
  { src: '/placeholder-logo.png', alt: { en: 'SEDIC', ar: 'سيديك' } },
  { src: '/placeholder-logo.png', alt: { en: 'Concord Real Estate', ar: 'كونكورد العقارية' } },
  { src: '/placeholder-logo.png', alt: { en: 'Partner Logo', ar: 'شعار شريك' } },
  { src: '/placeholder-logo.png', alt: { en: 'GIZ', ar: 'GIZ' } },
  { src: '/placeholder-logo.png', alt: { en: 'Partner Logo', ar: 'شعار شريك' } },
  { src: '/placeholder-logo.png', alt: { en: 'Partner Logo', ar: 'شعار شريك' } },
]

function normalizeRemoteLogos(logos: Array<{ src: string; alt: string }> | undefined): ClientLogo[] {
  if (!Array.isArray(logos) || !logos.length) return []

  return logos
    .filter((logo) => typeof logo?.src === 'string' && logo.src.trim())
    .map((logo, index) => {
      const fallbackIndex = index + 1
      const labelEn =
        typeof logo.alt === 'string' && logo.alt.trim() ? logo.alt.trim() : `Client logo ${fallbackIndex}`
      const labelAr =
        typeof logo.alt === 'string' && logo.alt.trim() ? logo.alt.trim() : `شعار عميل ${fallbackIndex}`

      return {
        src: logo.src,
        alt: { en: labelEn, ar: labelAr },
      }
    })
}

function ClientsSectionContent({ content }: { content?: SuccessClientsContentByLanguage }) {
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const copy = useMemo(
    () => ({
      en: {
        title: 'Our Clients',
        subtitle:
          'OUR COMMON SUCCESS IS THE BASE OF OUR PARTNERSHIP, WHETHER YOU ARE A SUPPLIER OR CUSTOMER',
      },
      ar: {
        title: 'عملاؤنا الناجحون',
        subtitle: 'نجاحنا المشترك هو أساس شراكتنا، سواء كنت مورّدًا أو عميلًا',
      },
    }),
    []
  )

  const contentForLanguage = content?.[language] ?? content?.en
  const text = contentForLanguage
    ? { title: contentForLanguage.title, subtitle: contentForLanguage.subtitle }
    : copy[language]

  const logos = useMemo(() => {
    const localized = normalizeRemoteLogos(contentForLanguage?.logos)
    if (localized.length) return localized

    const englishFallback = normalizeRemoteLogos(content?.en?.logos)
    if (englishFallback.length) return englishFallback

    return DEFAULT_LOGOS
  }, [content, contentForLanguage])

  if (!logos.length) return null

  return (
    <section className={styles.section} aria-label={text.title}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{text.title}</h2>
          <p className={styles.subtitle}>{text.subtitle}</p>
        </div>

        <div
          className={styles.sliderShell}
          aria-label={isArabic ? 'شريط شعارات العملاء' : 'Client logo slider'}
          data-direction={isArabic ? 'rtl' : 'ltr'}
        >
          <div className={styles.sliderFadeLeft} aria-hidden="true" />
          <div className={styles.sliderFadeRight} aria-hidden="true" />

          <div className={styles.sliderViewport} dir="ltr">
            <div key={language} className={styles.track} role="list">
              {logos.concat(logos).map((logo, index) => {
                const alt = isArabic ? logo.alt.ar : logo.alt.en

                return (
                  <div key={`${language}-${logo.src}-${index}`} className={styles.card} role="listitem" aria-label={alt}>
                    <div className={styles.cardInner}>
                      <Image
                        src={logo.src}
                        alt={alt}
                        width={280}
                        height={116}
                        sizes="280px"
                        className={styles.logo}
                        priority={index < logos.length}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ClientsSection({ content }: { content?: SuccessClientsContentByLanguage }) {
  return <ClientsSectionContent content={content} />
}
