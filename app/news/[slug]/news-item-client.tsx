'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { useLanguage } from '@/providers/language-provider'
import type { Language } from '@/lib/i18n/base-translations'
import styles from '../page.module.css'

type LocalizedString = Record<Language, string>

export type NewsItemPageContent = {
  slug: string
  title: LocalizedString
  dateLabel: LocalizedString
  category: LocalizedString
  excerpt: LocalizedString
  imageUrl: string
}

export default function NewsItemClient({ item }: { item: NewsItemPageContent }) {
  const { language } = useLanguage()

  const title = item.title[language]
  const dateLabel = item.dateLabel[language]
  const category = item.category[language]
  const excerpt = item.excerpt[language]
  const isRtl = language === 'ar'

  return (
    <>
      <section id="main-content" tabIndex={-1} className={styles.hero}>
        <div className={styles.container}>
          <p style={{ margin: 0, opacity: 0.92 }}>
            <Link href="/news" className={styles.readMore}>
              ← News
            </Link>
          </p>
          <h1 className={styles.title} style={{ textTransform: 'none' }}>
            {title}
          </h1>
          <p className={styles.subtitle}>
            {category} · {dateLabel}
          </p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.background} aria-hidden="true" data-reveal-skip>
          <div className={styles.backgroundGrid} />
          <div className={styles.backgroundOrb} data-variant="one" />
          <div className={styles.backgroundOrb} data-variant="two" />
          <div className={styles.backgroundOrb} data-variant="three" />
        </div>

        <div className={styles.container}>
          <article dir={isRtl ? 'rtl' : 'ltr'} className={styles.featuredCard} style={{ maxWidth: 980, margin: '0 auto' }}>
            <div className={styles.featuredMedia} style={{ minHeight: 360 }}>
              <Image
                src={item.imageUrl || '/placeholder.jpg'}
                alt={title}
                fill
                priority
                sizes="(max-width: 980px) 100vw, 980px"
                className={styles.featuredImage}
              />
            </div>
            <div className={styles.featuredBody}>
              <div className={styles.metaRow}>
                <span className={styles.categoryPill}>{category}</span>
                <span className={styles.dateText}>{dateLabel}</span>
              </div>
              <h2 className={styles.featuredTitle} style={{ marginTop: 10 }}>
                {title}
              </h2>
              <p className={styles.featuredExcerpt} style={{ whiteSpace: 'pre-wrap' }}>
                {excerpt}
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}

