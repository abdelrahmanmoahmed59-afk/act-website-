'use client'

import React, { useMemo } from "react"
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

function ClientsSectionContent({ content }: { content?: SuccessClientsContentByLanguage }) {
  const { language } = useLanguage()

  const copy = useMemo(
    () => ({
      en: {
        title: 'Our Success Clients',
        subtitle:
          'OUR COMMON SUCCESS IS THE BASE OF OUR PARTNERSHIP, WHETHER YOU ARE A SUPPLIER OR CUSTOMER',
      },
      ar: {
        title: 'عملاؤنا الناجحون',
        subtitle:
          'نجاحنا المشترك هو أساس شراكتنا، سواء كنت مورّدًا أو عميلًا',
      },
    }),
    [],
  )

  const contentForLanguage = content?.[language]
  const text = contentForLanguage
    ? { title: contentForLanguage.title, subtitle: contentForLanguage.subtitle }
    : copy[language as keyof typeof copy]

  const logos: ClientLogo[] = contentForLanguage?.logos?.length
    ? contentForLanguage.logos.map((logo) => ({ src: logo.src, alt: { en: logo.alt, ar: logo.alt } }))
    : []

  if (!contentForLanguage) return null
  if (!logos.length) return null

  return (
    <section className={styles.section} aria-label={text.title}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{text.title}</h2>
          <p className={styles.subtitle}>{text.subtitle}</p>
        </div>

        <div className={styles.sliderShell} aria-label={language === 'ar' ? 'شريط شعارات العملاء' : 'Client logo slider'}>
          <div className={styles.sliderFadeLeft} aria-hidden="true" />
          <div className={styles.sliderFadeRight} aria-hidden="true" />

          <div className={styles.sliderViewport}>
            <div className={styles.track} role="list">
              {logos.concat(logos).map((logo, index) => {
                const alt = language === 'ar' ? logo.alt.ar : logo.alt.en
                return (
                  <div key={`${logo.src}-${index}`} className={styles.card} role="listitem" aria-label={alt}>
                    <div className={styles.cardInner}>
                      <Image
                        src={logo.src}
                        alt={alt}
                        width={220}
                        height={90}
                        sizes="220px"
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
