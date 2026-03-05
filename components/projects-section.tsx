'use client'

import React, { useEffect, useState } from "react"
import Image from 'next/image'
import Link from 'next/link'
import { Image as ImageIcon } from 'lucide-react'
import { useLanguage } from '@/providers/language-provider'
import type { LocalizedProject } from '@/lib/projects'
import styles from './projects-section.module.css'
import cardStyles from '@/app/projects/page.module.css'

const MAX_FEATURED_PROJECTS = 3

function ProjectsContent() {
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const [projects, setProjects] = useState<LocalizedProject[]>([])
  const [labels, setLabels] = useState<{
    title: string
    subtitle: string
    showAllLabel: string
    clientLabel: string
    readMoreLabel: string
  } | null>(null)
  const [loaded, setLoaded] = useState(false)

  const content = {
    en: {
      title: "Featured Projects",
      subtitle: "Showcasing Our Recent Work",
      showAllLabel: "Show all projects",
      readMoreLabel: "Read more",
    },
    ar: {
      title: "المشاريع المميزة",
      subtitle: "عرض أعمالنا الأخيرة",
      showAllLabel: "عرض جميع المشاريع",
      readMoreLabel: "اقرأ المزيد",
    }
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoaded(false)
      try {
        const res = await fetch(`/api/projects?lang=${language}&limit=50`, { cache: 'no-store' })
        if (!res.ok) throw new Error('projects')
        const json = await res.json()
        const nextProjects = Array.isArray(json?.projects) ? (json.projects as LocalizedProject[]) : []
        const s = json?.settings as any
        const nextLabels =
          s && typeof s === 'object'
            ? {
                title: String(s.homeTitle ?? ''),
                subtitle: String(s.homeSubtitle ?? ''),
                showAllLabel: String(s.homeShowAllLabel ?? ''),
                clientLabel: String(s.pageClientLabel ?? ''),
                readMoreLabel: String(s.pageReadMoreLabel ?? s.homeReadMoreLabel ?? ''),
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

  const t = labels ?? content[language as keyof typeof content]
  const clientLabel = labels?.clientLabel || (isArabic ? '\u0627\u0644\u0639\u0645\u064a\u0644' : 'Client')
  const readMoreLabel = labels?.readMoreLabel || t.readMoreLabel

  const gridProjects = projects.filter((project) => project.showInGrid !== false)
  const featuredProjects = gridProjects.slice(0, MAX_FEATURED_PROJECTS)

  return (
    <section className={styles.projects}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        <section className={cardStyles.grid} aria-label={t.title}>
          {featuredProjects.map((project, index) => (
            <article key={project.id} className={cardStyles.card}>
              <div className={cardStyles.cardMedia} aria-hidden="true">
                {project.images[0] === '/placeholder.jpg' && (
                  <div className={cardStyles.placeholderIcon} aria-hidden="true">
                    <ImageIcon />
                  </div>
                )}
                <Image
                  src={project.images[0]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  className={cardStyles.cardImage}
                  priority={index === 0}
                />
                <div className={cardStyles.cardMediaOverlay} />
              </div>

              <div className={cardStyles.cardBody}>
                <h3 className={cardStyles.cardTitle}>{project.title}</h3>
                <p className={cardStyles.cardText}>{project.summary}</p>

                <div className={cardStyles.cardFooter}>
                  <p className={cardStyles.cardClient}>
                    <span className={cardStyles.clientLabel}>{clientLabel}:</span> {project.client}
                  </p>
                  <Link
                    href={`/projects/${project.slug}`}
                    className={cardStyles.readMoreButton}
                    aria-label={`${readMoreLabel}: ${project.title}`}
                  >
                    {readMoreLabel}
                    <span className={cardStyles.readMoreArrow} aria-hidden="true">
                      {isArabic ? '\u2190' : '\u2192'}
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        {loaded && featuredProjects.length > 0 && (
          <div className={styles.actions}>
            <Link href="/projects" className={styles.showAllButton}>
              {t.showAllLabel}
              <span className={styles.showAllArrow} aria-hidden="true">
                {isArabic ? '\u2190' : '\u2192'}
              </span>
            </Link>
          </div>
        )}
      </div>

      <div className={styles.bgDecoration} />
    </section>
  )
}

export default function Projects() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <section className={styles.projects} />
  }

  return <ProjectsContent />
}
