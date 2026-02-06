'use client'

import React, { useEffect, useState } from "react"
import Link from 'next/link'
import { useLanguage } from '@/providers/language-provider'
import type { LocalizedProject } from '@/lib/projects'
import styles from './projects-section.module.css'

const MAX_FEATURED_PROJECTS = 6

function ProjectsContent() {
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const [projects, setProjects] = useState<LocalizedProject[]>([])
  const [labels, setLabels] = useState<{
    title: string
    subtitle: string
    showAllLabel: string
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
        const res = await fetch(`/api/projects?lang=${language}&limit=${MAX_FEATURED_PROJECTS + 1}`, { cache: 'no-store' })
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
                readMoreLabel: String(s.homeReadMoreLabel ?? ''),
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

  const featuredProjects = projects.slice(0, MAX_FEATURED_PROJECTS)
  const hasMoreProjects = projects.length > MAX_FEATURED_PROJECTS

  return (
    <section className={styles.projects}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        <div className={styles.projectsGrid}>
          {featuredProjects.map((project, index) => (
            <article key={project.slug} className={styles.projectCard}>
              <div className={styles.projectImage}>
                <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="400" height="300" fill="currentColor" opacity="0.1"/>
                  <rect x="50" y="80" width="300" height="200" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                  <text x="200" y="180" textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="16">
                    Project Image
                  </text>
                </svg>
              </div>
              <div className={styles.projectOverlay}>
                <span className={styles.category}>{project.sector}</span>
              </div>
              <div className={styles.projectContent}>
                <h3 className={styles.projectName}>{project.title}</h3>
                <p className={styles.projectLocation}>{project.location}</p>
                <div className={styles.projectMeta}>
                  <p className={styles.projectYear}>{project.year}</p>
                  <Link
                    href={`/projects/${project.slug}`}
                    className={styles.readMoreButton}
                    aria-label={`${t.readMoreLabel}: ${project.title}`}
                  >
                    {t.readMoreLabel}
                    <span className={styles.readMoreArrow} aria-hidden="true">
                      {isArabic ? '←' : '→'}
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {loaded && hasMoreProjects && (
          <div className={styles.actions}>
            <Link href="/projects" className={styles.showAllButton}>
              {t.showAllLabel}
              <span className={styles.showAllArrow} aria-hidden="true">
                {isArabic ? '←' : '→'}
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
