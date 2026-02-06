'use client'

import React, { useEffect, useMemo, useState } from "react"
import Link from 'next/link'
import { Calendar, FileText, Search, SlidersHorizontal, X } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import styles from './page.module.css'

type BlogItem = {
  kind: 'featured' | 'post'
  title: string
  date: string
  category: string
  readTime: string
  summary: string
  highlightsText?: string
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

function BlogContent() {
  const { language } = useLanguage()
  const [query, setQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<'all' | 'featured' | 'latest'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [remoteSettings, setRemoteSettings] = useState<any | null>(null)
  const [remoteFeatured, setRemoteFeatured] = useState<any | null>(null)
  const [remotePosts, setRemotePosts] = useState<any[] | null>(null)

  const content = {
    en: {
      eyebrow: 'ACT Blog',
      title: 'Blog',
      subtitle: 'Insights from ACT project teams across Kuwait.',
      intro:
        'Practical notes on delivery strategy, safety, and procurement for complex construction programs.',
      topicsTitle: 'Topics',
      topics: [
        'Project Delivery',
        'Safety & Quality',
        'Infrastructure',
        'Design-Build',
        'People & Culture',
        'Sustainability',
      ],
      featuredLabel: 'Featured Insight',
      featured: {
        title: 'Design-Build in Kuwait: speed without surprises',
        date: 'Jan 2026',
        category: 'Design-Build',
        readTime: '6 min read',
        summary:
          'How integrated teams reduce change orders, align procurement earlier, and improve commissioning outcomes.',
        highlights: [
          'Single point of accountability',
          'Earlier procurement alignment',
          'Commissioning-ready handover',
        ],
      },
      postsTitle: 'Latest Posts',
      posts: [
        {
          title: 'Managing traffic diversions on live corridors',
          date: 'Dec 2025',
          category: 'Infrastructure',
          readTime: '4 min read',
          summary:
            'Phased diversion plans that protect workers while keeping city traffic moving.',
        },
        {
          title: 'Quality control across multi-site programs',
          date: 'Nov 2025',
          category: 'Safety & Quality',
          readTime: '5 min read',
          summary:
            'Standardized inspection gates and daily reporting that keep standards aligned.',
        },
        {
          title: 'Civil packages for large residential districts',
          date: 'Oct 2025',
          category: 'Project Delivery',
          readTime: '4 min read',
          summary:
            'Sequencing earthworks and utilities to hand over neighborhoods on schedule.',
        },
        {
          title: 'MEP coordination in fit-out phases',
          date: 'Sep 2025',
          category: 'Project Delivery',
          readTime: '3 min read',
          summary:
            'Reducing clashes and accelerating close-out with coordinated shop drawings.',
        },
        {
          title: 'Field leadership routines that improve productivity',
          date: 'Aug 2025',
          category: 'People & Culture',
          readTime: '5 min read',
          summary:
            'Short daily rituals that strengthen safety, accountability, and output.',
        },
        {
          title: 'Sustainability wins on infrastructure projects',
          date: 'Jul 2025',
          category: 'Sustainability',
          readTime: '4 min read',
          summary:
            'Reducing waste and optimizing resources across large-scale civil works.',
        },
      ],
      ctaTitle: 'Stay close to the work',
      ctaDesc:
        'Get project intelligence, safety updates, and hiring news directly from ACT teams.',
      ctaButton: 'View News',
      filtersTitle: 'Search & filters',
      searchPlaceholder: 'Search articles, categories, tags...',
      clearSearch: 'Clear search',
      filtersButton: 'Filters',
      categoryLabel: 'Category',
      allCategories: 'All Categories',
      typeLabel: 'Type',
      typeAll: 'All Posts',
      typeFeatured: 'Featured',
      typeLatest: 'Latest',
      dateRangeLabel: 'Date Range',
      dateFromLabel: 'From date',
      dateToLabel: 'To date',
      clearFilters: 'Clear',
      resultsLabel: 'articles found',
      resultsTitle: 'Results',
      featuredTag: 'Featured',
      noResultsTitle: 'No articles found',
      noResultsText: 'Try a different search or clear some filters.',
    },
    ar: {
      eyebrow: 'مدونة ACT',
      title: 'المدونة',
      subtitle: 'رؤى من فرق ACT حول تنفيذ المشاريع في الكويت.',
      intro:
        'ملاحظات عملية حول استراتيجيات التنفيذ والسلامة والمشتريات للبرامج الإنشائية المعقدة.',
      topicsTitle: 'الموضوعات',
      topics: [
        'تنفيذ المشاريع',
        'السلامة والجودة',
        'البنية التحتية',
        'التصميم والتنفيذ',
        'الثقافة والكوادر',
        'الاستدامة',
      ],
      featuredLabel: 'مقال مميز',
      featured: {
        title: 'التصميم والتنفيذ في الكويت: سرعة بلا مفاجآت',
        date: 'يناير 2026',
        category: 'التصميم والتنفيذ',
        readTime: '6 دقائق قراءة',
        summary:
          'كيف يقلل العمل المتكامل من أوامر التغيير ويوائم المشتريات مبكرًا ويحسن نتائج التشغيل.',
        highlights: [
          'مسؤولية واحدة واضحة',
          'مواءمة مبكرة للمشتريات',
          'تسليم جاهز للتشغيل',
        ],
      },
      postsTitle: 'أحدث المقالات',
      posts: [
        {
          title: 'إدارة التحويلات المرورية في الممرات النشطة',
          date: 'ديسمبر 2025',
          category: 'البنية التحتية',
          readTime: '4 دقائق قراءة',
          summary:
            'خطط تحويل مرحلية تحمي العمال وتحافظ على حركة المدينة.',
        },
        {
          title: 'ضبط الجودة عبر مواقع متعددة',
          date: 'نوفمبر 2025',
          category: 'السلامة والجودة',
          readTime: '5 دقائق قراءة',
          summary:
            'نقاط تفتيش موحدة وتقارير يومية تحافظ على التزام المعايير.',
        },
        {
          title: 'حزم الأعمال المدنية للمجمعات السكنية الكبرى',
          date: 'أكتوبر 2025',
          category: 'تنفيذ المشاريع',
          readTime: '4 دقائق قراءة',
          summary:
            'تسلسل الأعمال الترابية والخدمات لتسليم الأحياء في الوقت المحدد.',
        },
        {
          title: 'تنسيق أعمال MEP في مراحل التشطيب',
          date: 'سبتمبر 2025',
          category: 'تنفيذ المشاريع',
          readTime: '3 دقائق قراءة',
          summary:
            'تقليل التعارضات وتسريع الإغلاق عبر مخططات تنفيذ منسقة.',
        },
        {
          title: 'روتينات القيادة الميدانية التي ترفع الإنتاجية',
          date: 'أغسطس 2025',
          category: 'الثقافة والكوادر',
          readTime: '5 دقائق قراءة',
          summary:
            'طقوس يومية قصيرة تعزز السلامة والمساءلة والمخرجات.',
        },
        {
          title: 'مكاسب الاستدامة في مشاريع البنية التحتية',
          date: 'يوليو 2025',
          category: 'الاستدامة',
          readTime: '4 دقائق قراءة',
          summary:
            'خفض الهدر وتحسين إدارة الموارد في الأعمال المدنية واسعة النطاق.',
        },
      ],
      ctaTitle: 'ابق قريبًا من الأعمال',
      ctaDesc:
        'احصل على تحديثات المشاريع والسلامة وأخبار التوظيف مباشرة من فرق ACT.',
      ctaButton: 'عرض الأخبار',
      filtersTitle: 'البحث والتصفية',
      searchPlaceholder: 'ابحث في المقالات والتصنيفات والوسوم...',
      clearSearch: 'مسح البحث',
      filtersButton: 'عوامل التصفية',
      categoryLabel: 'التصنيف',
      allCategories: 'كل التصنيفات',
      typeLabel: 'النوع',
      typeAll: 'كل المقالات',
      typeFeatured: 'مميز',
      typeLatest: 'الأحدث',
      dateRangeLabel: 'النطاق الزمني',
      dateFromLabel: 'من تاريخ',
      dateToLabel: 'إلى تاريخ',
      clearFilters: 'مسح',
      resultsLabel: 'نتائج',
      resultsTitle: 'النتائج',
      featuredTag: 'مميز',
      noResultsTitle: 'لا توجد نتائج',
      noResultsText: 'جرّب بحثًا آخر أو قم بمسح بعض عوامل التصفية.',
    },
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`/api/blog?lang=${language}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('blog')
        const json = await res.json()
        if (!alive) return
        setRemoteSettings(json?.settings ?? null)
        setRemoteFeatured(json?.featured ?? null)
        setRemotePosts(Array.isArray(json?.posts) ? json.posts : null)
      } catch {
        if (!alive) return
        setRemoteSettings(null)
        setRemoteFeatured(null)
        setRemotePosts(null)
      }
    })()
    return () => {
      alive = false
    }
  }, [language])

  const base = content[language as keyof typeof content]
  const data = {
    ...base,
    eyebrow: remoteSettings?.eyebrow || base.eyebrow,
    title: remoteSettings?.title || base.title,
    subtitle: remoteSettings?.subtitle || base.subtitle,
    intro: remoteSettings?.intro || base.intro,
  }

  const featured = remoteFeatured
    ? {
        title: String(remoteFeatured.title ?? ''),
        date: String(remoteFeatured.dateLabel ?? ''),
        category: String(remoteFeatured.category ?? ''),
        readTime: String(remoteFeatured.readTime ?? ''),
        summary: String(remoteFeatured.summary ?? ''),
        highlights: Array.isArray(remoteFeatured.highlights) ? remoteFeatured.highlights.map((x: any) => String(x)) : [],
      }
    : null

  const posts = remotePosts
    ? remotePosts.map((p) => ({
        title: String(p.title ?? ''),
        date: String(p.dateLabel ?? ''),
        category: String(p.category ?? ''),
        readTime: String(p.readTime ?? ''),
        summary: String(p.summary ?? ''),
      }))
    : []

  const topics = useMemo(() => {
    const categories = [
      ...(featured?.category ? [featured.category] : []),
      ...posts.map((p) => p.category).filter(Boolean),
    ]
    return Array.from(new Set(categories)).filter(Boolean)
  }, [featured?.category, posts])

  useEffect(() => {
    setQuery('')
    setFiltersOpen(false)
    setSelectedTopics([])
    setSelectedType('all')
    setFromDate('')
    setToDate('')
  }, [language])

  const hasActiveFilters =
    query.trim().length > 0 ||
    selectedTopics.length > 0 ||
    selectedType !== 'all' ||
    fromDate.length > 0 ||
    toDate.length > 0

  const categoryValue = selectedTopics.length === 1 ? selectedTopics[0] : 'all'

  const tonePalette = useMemo(
    () => ['var(--chart-5)', 'var(--chart-4)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-1)'],
    [],
  )

  const topicToneMap = useMemo(() => {
    return new Map(topics.map((topic, index) => [topic, tonePalette[index % tonePalette.length]]))
  }, [tonePalette, topics])

  const allItems: BlogItem[] = useMemo(() => {
    const postItems: BlogItem[] = posts.map((post) => ({
      kind: 'post',
      title: post.title,
      date: post.date,
      category: post.category,
      readTime: post.readTime,
      summary: post.summary,
    }))

    if (!featured) return postItems

    const featuredItem: BlogItem = {
      kind: 'featured',
      title: featured.title,
      date: featured.date,
      category: featured.category,
      readTime: featured.readTime,
      summary: featured.summary,
      highlightsText: featured.highlights.join(' '),
    }

    return [featuredItem, ...postItems]
  }, [featured, posts])

  const filteredItems = useMemo(() => {
    const selectedSet = new Set(selectedTopics)
    const search = query.trim().toLowerCase()

    let rangeStart = dateInputToKey(fromDate)
    let rangeEnd = dateInputToKey(toDate)
    if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
      ;[rangeStart, rangeEnd] = [rangeEnd, rangeStart]
    }

    const matchesSearch = (item: BlogItem) => {
      if (!search) return true
      const combined = [
        item.title,
        item.summary,
        item.category,
        item.date,
        item.readTime,
        item.highlightsText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return combined.includes(search)
    }

    const matchesType = (item: BlogItem) => {
      if (selectedType === 'all') return true
      if (selectedType === 'featured') return item.kind === 'featured'
      return item.kind === 'post'
    }

    const matchesCategory = (item: BlogItem) => {
      if (selectedSet.size === 0) return true
      return selectedSet.has(item.category)
    }

    const matchesDate = (item: BlogItem) => {
      if (!rangeStart && !rangeEnd) return true
      const key = parseMonthYear(item.date)
      if (!key) return false
      if (rangeStart && key < rangeStart) return false
      if (rangeEnd && key > rangeEnd) return false
      return true
    }

    const sorted = allItems
      .filter((item) => matchesType(item) && matchesCategory(item) && matchesDate(item) && matchesSearch(item))
      .sort((a, b) => (parseMonthYear(b.date) ?? 0) - (parseMonthYear(a.date) ?? 0))

    return sorted
  }, [allItems, fromDate, query, selectedTopics, selectedType, toDate])

  const resultsCount = filteredItems.length

  return (
    <main className={styles.page}>
      <Header />
      <section id="main-content" tabIndex={-1} className={styles.hero}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>{data.eyebrow}</span>
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.subtitle}>{data.subtitle}</p>
          <p className={styles.intro}>{data.intro}</p>
        </div>
      </section>

      <section className={styles.topics}>
        <div className={styles.container}>
          <div className={styles.filtersHeader}>
            <h2 className={styles.sectionTitle}>{data.filtersTitle}</h2>
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
              aria-controls="blog-filters-panel"
            >
              <SlidersHorizontal aria-hidden="true" />
              {data.filtersButton}
            </button>
          </div>

          <div
            id="blog-filters-panel"
            className={`${styles.filterPanel} ${filtersOpen ? styles.filterPanelOpen : ''}`}
            aria-hidden={!filtersOpen}
          >
            <div className={styles.filterPanelInner}>
              <div className={styles.panelGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{data.categoryLabel}</span>
                  <select
                    className={styles.select}
                    value={categoryValue}
                    onChange={(event) => {
                      const value = event.target.value
                      setSelectedTopics(value === 'all' ? [] : [value])
                    }}
                  >
                    <option value="all">{data.allCategories}</option>
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{data.typeLabel}</span>
                  <select
                    className={styles.select}
                    value={selectedType}
                    onChange={(event) =>
                      setSelectedType(event.target.value as typeof selectedType)
                    }
                  >
                    <option value="all">{data.typeAll}</option>
                    <option value="featured">{data.typeFeatured}</option>
                    <option value="latest">{data.typeLatest}</option>
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
                    setSelectedTopics([])
                    setSelectedType('all')
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
            <h3 className={styles.tagsTitle}>{data.topicsTitle}</h3>
            <div className={styles.topicList}>
              {topics.map((topic, index) => {
                const active = selectedTopics.includes(topic)
                return (
                  <button
                    key={topic}
                    type="button"
                    className={`${styles.topicPill} ${active ? styles.topicPillActive : ''}`}
                    style={{ '--chip-index': index } as React.CSSProperties}
                    onClick={() =>
                      setSelectedTopics((prev) =>
                        prev.includes(topic)
                          ? prev.filter((value) => value !== topic)
                          : [...prev, topic],
                      )
                    }
                    aria-pressed={active}
                  >
                    {topic}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.posts}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{hasActiveFilters ? data.resultsTitle : data.postsTitle}</h2>

          {filteredItems.length > 0 ? (
            <div className={styles.postGrid}>
              {filteredItems.map((item, index) => (
                <article
                  key={`${item.kind}-${item.title}`}
                  className={styles.postCard}
                  data-kind={item.kind}
                  style={
                    {
                      '--card-index': index,
                      '--tone': topicToneMap.get(item.category) ?? 'var(--chart-1)',
                    } as React.CSSProperties
                  }
                >
                  <div className={styles.postMedia} aria-hidden="true">
                    <span className={styles.postIcon}>
                      <FileText aria-hidden="true" focusable="false" />
                    </span>
                  </div>
                  <div className={styles.postBody}>
                    <div className={styles.postMeta}>
                      <div className={styles.postMetaLeft}>
                        {item.kind === 'featured' && (
                          <span className={styles.featuredBadge}>{data.featuredTag}</span>
                        )}
                        <span className={styles.postCategory}>{item.category}</span>
                      </div>
                      <div className={styles.postMetaRight}>
                        <span className={styles.postDate}>{item.date}</span>
                        <span className={styles.postRead}>{item.readTime}</span>
                      </div>
                    </div>
                    <h3 className={styles.postTitle}>{item.title}</h3>
                    <p className={styles.postSummary}>{item.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState} role="status" aria-live="polite">
              <h3 className={styles.emptyTitle}>{data.noResultsTitle}</h3>
              <p className={styles.emptyText}>{data.noResultsText}</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <div>
              <h2 className={styles.ctaTitle}>{data.ctaTitle}</h2>
              <p className={styles.ctaText}>{data.ctaDesc}</p>
            </div>
            <Link href="/news" className={styles.ctaButton}>
              {data.ctaButton}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function Blog() {
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

  return <BlogContent />
}
