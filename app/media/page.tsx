'use client'

import React, { useEffect, useMemo, useState } from "react"
import Link from 'next/link'
import { Calendar, Search, SlidersHorizontal, X } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import styles from './page.module.css'

type MediaItem = {
  type: 'video' | 'photo' | 'press'
  title: string
  date: string
  description: string
}

const monthTokenToIndex: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
  يناير: 1,
  فبراير: 2,
  مارس: 3,
  أبريل: 4,
  ابريل: 4,
  مايو: 5,
  يونيو: 6,
  يوليو: 7,
  أغسطس: 8,
  اغسطس: 8,
  سبتمبر: 9,
  أكتوبر: 10,
  اكتوبر: 10,
  نوفمبر: 11,
  ديسمبر: 12,
}

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^\p{L}]/gu, '')
}

function parseMonthYear(value: string): number | null {
  const tokens = value
    .trim()
    .replace(/[،]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  const yearToken = tokens.find((token) => /\d{4}/.test(token))
  const yearMatch = yearToken?.match(/\d{4}/)
  const year = yearMatch ? Number(yearMatch[0]) : NaN
  if (!year || Number.isNaN(year)) return null

  const monthToken = tokens
    .map((token) => normalizeToken(token))
    .find((token) => monthTokenToIndex[token] !== undefined)

  const month = monthToken ? monthTokenToIndex[monthToken] : undefined
  if (!month) return null

  return year * 100 + month
}

function dateInputToKey(value: string): number | null {
  if (!value) return null
  const [yearToken, monthToken] = value.split('-')
  const year = Number(yearToken)
  const month = Number(monthToken)
  if (!year || !month) return null
  return year * 100 + month
}

function MediaContent() {
  const { language } = useLanguage()
  const [query, setQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<Array<MediaItem['type']>>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [remoteSettings, setRemoteSettings] = useState<any | null>(null)
  const [remoteItems, setRemoteItems] = useState<any[] | null>(null)

  const localContent = {
    en: {
      title: 'Media',
      subtitle: 'Project visuals, milestones, and press highlights from ACT.',
      intro:
        'Browse recent footage, photo stories, and media releases that capture ACT delivery across Kuwait.',
      mediaTitle: 'Featured Media',
      mediaItems: [
        {
          type: 'video',
          title: 'Shuwaikh Logistics Hub flythrough',
          date: 'Mar 2026',
          description: 'Aerial walkthrough of Phase 1 progress and commissioning milestones.',
        },
        {
          type: 'photo',
          title: 'Marina Heights residential handover',
          date: 'Feb 2026',
          description: 'Photo story from final inspections and client walkthroughs.',
        },
        {
          type: 'press',
          title: 'Kuwait South Road upgrades awarded',
          date: 'Jan 2026',
          description: 'Press release covering scope, schedule, and safety commitments.',
        },
        {
          type: 'video',
          title: 'Energy Park commissioning recap',
          date: 'Dec 2025',
          description: 'Systems testing and operator training highlights.',
        },
        {
          type: 'photo',
          title: 'Museum expansion interior reveal',
          date: 'Nov 2025',
          description: 'Interior fit-out progress for public opening.',
        },
        {
          type: 'press',
          title: 'ACT safety week coverage',
          date: 'Oct 2025',
          description: 'Site-wide safety initiatives and workforce recognition.',
        },
      ],
      ctaTitle: 'See the full project portfolio',
      ctaDesc: 'Visit our projects page for completed work, sector highlights, and delivery updates.',
      ctaButton: 'View Projects',
      filtersTitle: 'Search & filters',
      searchPlaceholder: 'Search media titles, types, tags...',
      clearSearch: 'Clear search',
      filtersButton: 'Filters',
      typeLabel: 'Type',
      allTypes: 'All Types',
      dateRangeLabel: 'Date Range',
      dateFromLabel: 'From date',
      dateToLabel: 'To date',
      clearFilters: 'Clear',
      resultsLabel: 'items found',
      noResultsTitle: 'No items found',
      noResultsText: 'Try a different search or clear some filters.',
      tagsTitle: 'Tags',
    },
    ar: {
      title: 'الميديا',
      subtitle: 'مرئيات المشاريع والإنجازات وأبرز التغطيات الإعلامية لـ ACT.',
      intro:
        'تعرّف على أحدث الفيديوهات والصور والبيانات الإعلامية التي توثق أعمال ACT في الكويت.',
      mediaTitle: 'أبرز المواد',
      mediaItems: [
        {
          type: 'video',
          title: 'جولة جوية لمركز الشويخ اللوجستي',
          date: 'مارس 2026',
          description: 'عرض جوي لمرحلة التنفيذ والتشغيل التجريبي.',
        },
        {
          type: 'photo',
          title: 'تسليم مارينا هايتس السكني',
          date: 'فبراير 2026',
          description: 'قصة مصورة من الفحوصات النهائية وجولات العميل.',
        },
        {
          type: 'press',
          title: 'ترسية تطوير طريق الكويت الجنوبي',
          date: 'يناير 2026',
          description: 'بيان إعلامي عن نطاق العمل والجدول الزمني والسلامة.',
        },
        {
          type: 'video',
          title: 'ملخص تشغيل حديقة الطاقة',
          date: 'ديسمبر 2025',
          description: 'اختبارات الأنظمة وتدريب المشغلين.',
        },
        {
          type: 'photo',
          title: 'كشف داخلي لتوسعة المتحف',
          date: 'نوفمبر 2025',
          description: 'تقدم أعمال التشطيب قبل الافتتاح.',
        },
        {
          type: 'press',
          title: 'تغطية أسبوع السلامة لدى ACT',
          date: 'أكتوبر 2025',
          description: 'مبادرات السلامة وتكريم فرق المواقع.',
        },
      ],
      ctaTitle: 'اطّلع على كامل المشاريع',
      ctaDesc: 'انتقل إلى صفحة المشاريع للاطلاع على الأعمال المنجزة وأبرز القطاعات.',
      ctaButton: 'عرض المشاريع',
      filtersTitle: 'البحث والتصفية',
      searchPlaceholder: 'ابحث في العناوين والأنواع والوسوم...',
      clearSearch: 'مسح البحث',
      filtersButton: 'عوامل التصفية',
      typeLabel: 'النوع',
      allTypes: 'كل الأنواع',
      dateRangeLabel: 'النطاق الزمني',
      dateFromLabel: 'من تاريخ',
      dateToLabel: 'إلى تاريخ',
      clearFilters: 'مسح',
      resultsLabel: 'نتائج',
      noResultsTitle: 'لا توجد نتائج',
      noResultsText: 'جرّب بحثًا آخر أو قم بمسح بعض عوامل التصفية.',
      tagsTitle: 'الوسوم',
    },
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`/api/media?lang=${language}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('media')
        const json = await res.json()
        if (!alive) return
        setRemoteSettings(json?.settings ?? null)
        setRemoteItems(Array.isArray(json?.items) ? json.items : null)
      } catch {
        if (!alive) return
        setRemoteSettings(null)
        setRemoteItems(null)
      }
    })()
    return () => {
      alive = false
    }
  }, [language])

  const base = localContent[language as keyof typeof localContent]
  const data = {
    ...base,
    title: remoteSettings?.title || base.title,
    subtitle: remoteSettings?.subtitle || base.subtitle,
    intro: remoteSettings?.intro || base.intro,
    mediaTitle: base.mediaTitle,
    mediaItems: base.mediaItems,
  }

  const mediaItems = remoteItems
    ? remoteItems.map((item) => ({
        type: item.type,
        title: String(item.title ?? ''),
        date: String(item.dateLabel ?? ''),
        description: String(item.description ?? ''),
      }))
    : []

  const typeLabels = useMemo(() => (
    language === 'ar'
      ? { video: 'فيديو', photo: 'صور', press: 'بيان' }
      : { video: 'Video', photo: 'Photo', press: 'Press' }
  ), [language])

  useEffect(() => {
    setQuery('')
    setFiltersOpen(false)
    setSelectedTypes([])
    setFromDate('')
    setToDate('')
  }, [language])

  const hasActiveFilters =
    query.trim().length > 0 ||
    selectedTypes.length > 0 ||
    fromDate.length > 0 ||
    toDate.length > 0

  const typeValue = selectedTypes.length === 1 ? selectedTypes[0] : 'all'

  const filteredItems = useMemo(() => {
    const selectedSet = new Set(selectedTypes)
    const search = query.trim().toLowerCase()

    let rangeStart = dateInputToKey(fromDate)
    let rangeEnd = dateInputToKey(toDate)
    if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
      ;[rangeStart, rangeEnd] = [rangeEnd, rangeStart]
    }

    const matchesType = (item: MediaItem) => {
      if (selectedSet.size === 0) return true
      return selectedSet.has(item.type)
    }

    const matchesDate = (item: MediaItem) => {
      if (!rangeStart && !rangeEnd) return true
      const key = parseMonthYear(item.date)
      if (!key) return false
      if (rangeStart && key < rangeStart) return false
      if (rangeEnd && key > rangeEnd) return false
      return true
    }

    const matchesSearch = (item: MediaItem) => {
      if (!search) return true
      const combined = [
        item.title,
        item.description,
        item.date,
        typeLabels[item.type],
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return combined.includes(search)
    }

    return mediaItems
      .filter((item) => matchesType(item) && matchesDate(item) && matchesSearch(item))
      .sort((a, b) => (parseMonthYear(b.date) ?? 0) - (parseMonthYear(a.date) ?? 0))
  }, [fromDate, mediaItems, query, selectedTypes, toDate, typeLabels])

  const resultsCount = filteredItems.length

  return (
    <main className={styles.page}>
      <Header />
      <section id="main-content" tabIndex={-1} className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.subtitle}>{data.subtitle}</p>
          <p className={styles.intro}>{data.intro}</p>
        </div>
      </section>

      <section className={styles.media}>
        <div className={styles.container}>
          <div className={styles.mediaHeader}>
            <h2 className={styles.sectionTitle}>{data.mediaTitle}</h2>
            <p className={styles.resultsCount} role="status" aria-live="polite">
              {resultsCount} {data.resultsLabel}
            </p>
          </div>

          <div className={styles.filterBar}>
            <div className={styles.searchField}>
              <Search className={styles.searchIcon} aria-hidden="true" />
              <input
                type="search"
                className={styles.searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={data.searchPlaceholder}
                aria-label={data.searchPlaceholder}
                autoComplete="off"
              />
              {query.trim().length > 0 && (
                <button
                  type="button"
                  className={styles.clearSearch}
                  onClick={() => setQuery('')}
                  aria-label={data.clearSearch}
                >
                  <X aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              className={`${styles.filterToggle} ${filtersOpen ? styles.filterToggleActive : ''}`}
              onClick={() => setFiltersOpen((prev) => !prev)}
              aria-expanded={filtersOpen}
              aria-controls="media-filters-panel"
            >
              <SlidersHorizontal aria-hidden="true" />
              {data.filtersButton}
            </button>
          </div>

          <div
            id="media-filters-panel"
            className={`${styles.filterPanel} ${filtersOpen ? styles.filterPanelOpen : ''}`}
            aria-hidden={!filtersOpen}
          >
            <div className={styles.filterPanelInner}>
              <div className={styles.panelGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{data.typeLabel}</span>
                  <select
                    className={styles.select}
                    value={typeValue}
                    onChange={(event) => {
                      const value = event.target.value as MediaItem['type'] | 'all'
                      setSelectedTypes(value === 'all' ? [] : [value])
                    }}
                  >
                    <option value="all">{data.allTypes}</option>
                    {Object.keys(typeLabels).map((key) => (
                      <option key={key} value={key}>
                        {typeLabels[key as keyof typeof typeLabels]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={styles.field}>
                  <span className={styles.fieldLabel}>{data.dateRangeLabel}</span>
                  <div className={styles.dateRow}>
                    <label className={styles.dateField}>
                      <Calendar className={styles.dateIcon} aria-hidden="true" />
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={fromDate}
                        onChange={(event) => setFromDate(event.target.value)}
                        aria-label={data.dateFromLabel}
                      />
                    </label>
                    <label className={styles.dateField}>
                      <Calendar className={styles.dateIcon} aria-hidden="true" />
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={toDate}
                        onChange={(event) => setToDate(event.target.value)}
                        aria-label={data.dateToLabel}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.panelFooter}>
                <button
                  type="button"
                  className={styles.clearFilters}
                  onClick={() => {
                    setQuery('')
                    setSelectedTypes([])
                    setFromDate('')
                    setToDate('')
                  }}
                  disabled={!hasActiveFilters}
                >
                  {data.clearFilters}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.tags}>
            <h3 className={styles.tagsTitle}>{data.tagsTitle}</h3>
            <div className={styles.tagList}>
              {Object.keys(typeLabels).map((key, index) => {
                const typeKey = key as MediaItem['type']
                const active = selectedTypes.includes(typeKey)
                return (
                  <button
                    key={typeKey}
                    type="button"
                    className={`${styles.tagPill} ${active ? styles.tagPillActive : ''}`}
                    style={{ '--chip-index': index } as React.CSSProperties}
                    onClick={() =>
                      setSelectedTypes((prev) =>
                        prev.includes(typeKey)
                          ? prev.filter((value) => value !== typeKey)
                          : [...prev, typeKey],
                      )
                    }
                    aria-pressed={active}
                  >
                    {typeLabels[typeKey]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.mediaGrid}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <article
                  key={`${item.title}-${index}`}
                  className={styles.mediaCard}
                  data-type={item.type}
                  style={{ '--card-index': index } as React.CSSProperties}
                >
                  <div className={styles.mediaThumb}>
                    <span className={styles.mediaIcon} aria-hidden="true">
                      {item.type === 'video' && (
                        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                          <path d="M9 7l8 5-8 5V7z" fill="currentColor" />
                        </svg>
                      )}
                      {item.type === 'photo' && (
                        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                          <path
                            d="M4 7h4l2-2h4l2 2h4v12H4V7zm4 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                      {item.type === 'press' && (
                        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                          <path
                            d="M6 4h9l3 3v13H6V4zm9 1.5V8h2.5L15 5.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2zm0-8h5v2H8V8z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className={styles.mediaBody}>
                    <div className={styles.mediaMeta}>
                      <span className={styles.mediaType}>
                        {typeLabels[item.type as keyof typeof typeLabels]}
                      </span>
                      <span className={styles.mediaDate}>{item.date}</span>
                    </div>
                    <h3 className={styles.mediaTitle}>{item.title}</h3>
                    <p className={styles.mediaText}>{item.description}</p>
                  </div>
                </article>
              ))
            ) : (
              <article
                className={styles.emptyState}
                role="status"
                aria-live="polite"
              >
                <h3 className={styles.emptyTitle}>{data.noResultsTitle}</h3>
                <p className={styles.emptyText}>{data.noResultsText}</p>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <div>
              <h2 className={styles.ctaTitle}>{data.ctaTitle}</h2>
              <p className={styles.ctaText}>{data.ctaDesc}</p>
            </div>
            <Link href="/projects" className={styles.ctaButton}>
              {data.ctaButton}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function Media() {
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

  return <MediaContent />
}
