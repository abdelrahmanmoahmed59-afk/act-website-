'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { useLanguage } from '@/providers/language-provider'
import styles from './page.module.css'
import type { Language } from '@/lib/i18n/base-translations'

type NewsItem = {
  id?: number
  slug?: string | null
  title: string
  date: string
  category: string
  excerpt: string
  image: string
}

type NewsPageCopy = {
  title: string
  intro: string
  filterLabel: string
  allLabel: string
  readMore: string
  close: string
  items: NewsItem[]
  contactTitle: string
  contactDesc: string
  contactEmail: string
  contactButton: string
}

export type NewsContentByLanguage = Record<Language, NewsPageCopy>

export default function NewsClient({ content }: { content?: NewsContentByLanguage }) {
  const { language } = useLanguage()

  const [remoteContent, setRemoteContent] = useState<NewsContentByLanguage | null>(() => content ?? null)
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
        const responses = await Promise.all(
          languages.map(async (lang) => {
            const res = await fetch(`/api/news?lang=${lang}`, { cache: 'no-store' })
            const json = await res.json().catch(() => null)
            if (!res.ok) throw new Error((json as any)?.details ?? (json as any)?.error ?? 'Failed to load news')
            return { lang, json }
          })
        )

        const next: Partial<NewsContentByLanguage> = {}
        for (const { lang, json } of responses) {
          if (!json?.settings) {
            if (!alive) return
            setRemoteContent(null)
            setLoading(false)
            return
          }
          const items = Array.isArray(json.items) ? json.items : []
          next[lang] = {
            title: String(json.settings.title ?? ''),
            intro: String(json.settings.intro ?? ''),
            filterLabel: String(json.settings.filterLabel ?? ''),
            allLabel: String(json.settings.allLabel ?? ''),
            readMore: String(json.settings.readMore ?? ''),
            close: String(json.settings.close ?? ''),
            items: items.map((i: any, index: number) => ({
              id: typeof i.id === 'number' ? i.id : index,
              slug: i.slug ?? null,
              title: String(i.title ?? ''),
              date: String(i.date ?? ''),
              category: String(i.category ?? ''),
              excerpt: String(i.excerpt ?? ''),
              image: String(i.image ?? '/placeholder.jpg'),
            })),
            contactTitle: String(json.settings.contactTitle ?? ''),
            contactDesc: String(json.settings.contactDesc ?? ''),
            contactEmail: String(json.settings.contactEmail ?? ''),
            contactButton: String(json.settings.contactButton ?? ''),
          }
        }

        if (!alive) return
        setRemoteContent(next as NewsContentByLanguage)
        setLoading(false)
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Failed to load news.')
        setRemoteContent(null)
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [content])

  const emptyData = useMemo<NewsPageCopy>(() => {
    const allLabel = language === 'ar' ? 'الكل' : 'All'
    return {
      title: '',
      intro: '',
      filterLabel: language === 'ar' ? 'تصفية' : 'Filter',
      allLabel,
      readMore: language === 'ar' ? 'اقرأ المزيد' : 'Read more',
      close: language === 'ar' ? 'إغلاق' : 'Close',
      items: [],
      contactTitle: '',
      contactDesc: '',
      contactEmail: '',
      contactButton: '',
    }
  }, [language])

  const hasData = Boolean(remoteContent?.[language])
  const data = remoteContent?.[language] ?? emptyData
  const items = data.items ?? []

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category))).filter(Boolean)
    return [data.allLabel, ...unique]
  }, [items, data.allLabel])

  const [activeCategory, setActiveCategory] = useState(data.allLabel)
  const [openItem, setOpenItem] = useState<NewsItem | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const dialogCloseRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setActiveCategory(data.allLabel)
    setOpenItem(null)
  }, [data.allLabel])

  useEffect(() => {
    if (!openItem) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenItem(null)

      if (event.key === 'Tab') {
        const dialog = dialogRef.current
        if (!dialog) return

        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        )

        if (focusables.length === 0) return

        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement as HTMLElement | null

        if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        } else if (event.shiftKey && active === first) {
          event.preventDefault()
          last.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => dialogCloseRef.current?.focus(), 0)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [openItem])

  const filteredItems = useMemo(() => {
    if (activeCategory === data.allLabel) return items
    return items.filter((item) => item.category === activeCategory)
  }, [activeCategory, data.allLabel, items])

  const featured = filteredItems[0]
  const gridItems = filteredItems.slice(1)

  if (loading && !hasData) {
    return (
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>{language === 'ar' ? 'جارٍ التحميل…' : 'Loading…'}</h1>
          <p className={styles.subtitle}>
            {language === 'ar' ? 'يتم تحميل الأخبار من قاعدة البيانات.' : 'Fetching news from the database.'}
          </p>
        </div>
      </section>
    )
  }

  if (!hasData) {
    return (
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>{language === 'ar' ? 'لا يوجد محتوى بعد' : 'No content yet'}</h1>
          <p className={styles.subtitle} style={{ whiteSpace: 'pre-wrap' }}>
            {error ??
              (language === 'ar'
                ? 'قم بإضافة الأخبار من لوحة التحكم ثم أعد تحميل الصفحة.'
                : 'Add news content from the admin dashboard, then refresh this page.')}
          </p>
          <div style={{ marginTop: 18 }}>
            <Link className={styles.readMore} href="/admin/news">
              {language === 'ar' ? 'فتح لوحة التحكم' : 'Open dashboard'}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section id="main-content" tabIndex={-1} className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.subtitle}>{data.intro}</p>
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
          <nav className={styles.filters} aria-label={data.filterLabel}>
            {categories.map((category) => {
              const active = category === activeCategory

              return (
                <button
                  key={category}
                  type="button"
                  className={`${styles.filterPill} ${active ? styles.filterPillActive : ''}`}
                  aria-pressed={active}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              )
            })}
          </nav>

          {featured && (
            <article className={styles.featuredCard}>
              <div className={styles.featuredMedia}>
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className={styles.featuredImage}
                />
              </div>
              <div className={styles.featuredBody}>
                <div className={styles.metaRow}>
                  <span className={styles.categoryPill}>{featured.category}</span>
                  <span className={styles.dateText}>{featured.date}</span>
                </div>
                <h2 className={styles.featuredTitle}>{featured.title}</h2>
                <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
                {featured.slug ? (
                  <Link className={styles.readMore} href={`/news/${featured.slug}`}>
                    {data.readMore} <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <button type="button" className={styles.readMore} onClick={() => setOpenItem(featured)}>
                    {data.readMore} <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
            </article>
          )}

          <div className={styles.grid}>
            {gridItems.map((item, index) => (
              <article key={item.id ?? `${item.title}-${index}`} className={styles.card}>
                <div className={styles.cardMedia}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
                    className={styles.cardImage}
                  />
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.metaRow}>
                    <span className={styles.categoryPill}>{item.category}</span>
                    <span className={styles.dateText}>{item.date}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardExcerpt}>{item.excerpt}</p>
                  <div className={styles.cardFooter}>
                    {item.slug ? (
                      <Link className={styles.readMore} href={`/news/${item.slug}`}>
                        {data.readMore}
                      </Link>
                    ) : (
                      <button type="button" className={styles.readMore} onClick={() => setOpenItem(item)}>
                        {data.readMore}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section className={styles.subscribe} aria-labelledby="media-inquiries">
            <div className={styles.subscribeCard}>
              <h2 id="media-inquiries" className={styles.subscribeTitle}>
                {data.contactTitle}
              </h2>
              <p className={styles.subscribeText}>{data.contactDesc}</p>
              <form
                className={styles.subscribeForm}
                onSubmit={(event) => {
                  event.preventDefault()
                  window.location.href = `mailto:${data.contactEmail}`
                }}
              >
                <label className={styles.srOnly} htmlFor="media-email">
                  {data.contactEmail}
                </label>
                <input
                  id="media-email"
                  className={styles.subscribeInput}
                  type="email"
                  inputMode="email"
                  readOnly
                  value={data.contactEmail}
                />
                <button type="submit" className={styles.subscribeButton}>
                  {data.contactButton}
                </button>
              </form>
            </div>
          </section>
        </div>
      </section>

      {openItem && (
        <div className={styles.dialogOverlay} role="presentation" onClick={() => setOpenItem(null)}>
          <div
            className={styles.dialog}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-dialog-title"
            aria-describedby="news-dialog-text"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.dialogClose}
              ref={dialogCloseRef}
              onClick={() => setOpenItem(null)}
              aria-label={data.close}
            >
              ×
            </button>
            <div className={styles.dialogMedia}>
              <Image
                src={openItem.image}
                alt={openItem.title}
                fill
                sizes="(max-width: 640px) 100vw, 620px"
                className={styles.dialogImage}
              />
              <div className={styles.dialogMediaOverlay} aria-hidden="true" data-reveal-skip />
            </div>
            <div className={styles.dialogMeta}>
              <span className={styles.categoryPill}>{openItem.category}</span>
              <span className={styles.dateText}>{openItem.date}</span>
            </div>
            <h2 id="news-dialog-title" className={styles.dialogTitle}>
              {openItem.title}
            </h2>
            <p id="news-dialog-text" className={styles.dialogText}>
              {openItem.excerpt}
            </p>
            <a className={styles.dialogLink} href={`mailto:${data.contactEmail}`}>
              {data.contactEmail}
            </a>
          </div>
        </div>
      )}
    </>
  )
}
