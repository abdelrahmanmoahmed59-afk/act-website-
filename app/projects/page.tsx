'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import type { LocalizedProject } from '@/lib/projects'
import styles from './page.module.css'
import { Image as ImageIcon } from 'lucide-react'

function PortfolioContent() {
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const [projects, setProjects] = useState<LocalizedProject[]>([])
  const [labels, setLabels] = useState<{
    title: string
    intro: string
    gridLabel: string
    clientLabel: string
    readMoreLabel: string
  } | null>(null)
  const [loaded, setLoaded] = useState(false)

  const content = {
    en: {
      title: 'Our Projects',
      intro: 'Selected projects delivered across commercial, residential, and infrastructure sectors.',
      gridLabel: 'Project cards',
      clientLabel: 'Client',
      readMoreLabel: 'Read more',
    },
    ar: {
      title: 'مشاريعنا',
      intro: 'عرض لأهم المشاريع المنجزة عبر قطاعات متعددة.',
      gridLabel: 'بطاقات المشاريع',
      clientLabel: 'العميل',
      readMoreLabel: 'اقرأ المزيد',
    },


  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoaded(false)
      try {
        const res = await fetch(`/api/projects?lang=${language}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('projects')
        const json = await res.json()
        const nextProjects = Array.isArray(json?.projects) ? (json.projects as LocalizedProject[]) : []
        const s = json?.settings as any
        const nextLabels =
          s && typeof s === 'object'
            ? {
                title: String(s.pageTitle ?? ''),
                intro: String(s.pageIntro ?? ''),
                gridLabel: String(s.pageGridLabel ?? ''),
                clientLabel: String(s.pageClientLabel ?? ''),
                readMoreLabel: String(s.pageReadMoreLabel ?? ''),
              }
            : null
        if (!alive) return
        setProjects(nextProjects)
        setLabels(nextLabels)
        setLoaded(true)
      } catch {
        if (!alive) return
        setProjects([])
        setLabels(null)
        setLoaded(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [language])

  const data = labels ?? content[language as keyof typeof content]

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
            <h1 className={styles.title}>{data.title}</h1>
            <p className={styles.intro}>{data.intro}</p>
          </header>

          <section className={styles.grid} aria-label={data.gridLabel}>
            {projects.map((project) => (
              <article key={project.id} className={styles.card}>
                <div className={styles.cardMedia} aria-hidden="true">
                  {project.images[0] === '/placeholder.jpg' && (
                    <div className={styles.placeholderIcon} aria-hidden="true">
                      <ImageIcon />
                    </div>
                  )}
                  <Image
                    src={project.images[0]}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                    className={styles.cardImage}
                    priority={project.id === 1}
                  />
                  <span className={styles.cardChip}>{project.sector}</span>
                  <div className={styles.cardMediaOverlay} />
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{project.title}</h3>
                  <p className={styles.cardText}>{project.summary}</p>

                  <div className={styles.cardFooter}>
                    <p className={styles.cardClient}>
                      <span className={styles.clientLabel}>{data.clientLabel}:</span> {project.client}
                    </p>
                    <Link
                      href={`/projects/${project.slug}`}
                      className={styles.readMoreButton}
                      aria-label={`${data.readMoreLabel}: ${project.title}`}
                    >
                      {data.readMoreLabel}
                      <span className={styles.readMoreArrow} aria-hidden="true">
                        {isArabic ? '←' : '→'}
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
          {loaded && projects.length === 0 && (
            <p style={{ color: 'rgba(226,232,240,0.72)', marginTop: 18 }}>No projects found.</p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function Portfolio() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main>
        <Header />
      </main>
    )
  }

  return <PortfolioContent />
}
