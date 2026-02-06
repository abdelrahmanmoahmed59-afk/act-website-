'use client'

import React, { useEffect, useState } from "react"

import { useLanguage } from '@/providers/language-provider'
import Link from 'next/link'
import styles from './portfolio-section.module.css'

type PortfolioProject = {
  id: number
  title: string
  category: string
  description: string
  year: string
  cta?: 'viewMore'
}

const portfolioData: Record<'en' | 'ar', PortfolioProject[]> = {
  en: [
    {
      id: 1,
      title: 'Al-Hamra Tower',
      category: 'Commercial',
      description: 'Modern commercial skyscraper in central Kuwait',
      year: '2023',
    },
    {
      id: 2,
      title: 'Marina Heights Residential',
      category: 'Residential',
      description: 'Luxury residential complex with waterfront views',
      year: '2022',
      cta: 'viewMore',
    },
    {
      id: 3,
      title: 'Kuwait National Museum',
      category: 'Government',
      description: 'State-of-the-art cultural facility',
      year: '2023',
    },
    {
      id: 4,
      title: 'Gateway Business Park',
      category: 'Commercial',
      description: 'Large-scale office and retail complex',
      year: '2021',
    },
    {
      id: 5,
      title: 'East Ring Road Extension',
      category: 'Infrastructure',
      description: 'Multi-lane highway infrastructure project',
      year: '2022',
      cta: 'viewMore',
    },
    {
      id: 6,
      title: 'Renewable Energy Park',
      category: 'Infrastructure',
      description: 'Sustainable energy production facility',
      year: '2024',
      cta: 'viewMore',
    },
  ],
  ar: [
    {
      id: 1,
      title: 'برج الحمراء',
      category: 'تجاري',
      description: 'ناطحة سحاب تجارية حديثة في وسط الكويت',
      year: '2023',
    },
    {
      id: 2,
      title: 'مارينا هايتس السكنية',
      category: 'سكني',
      description: 'مجمع سكني فاخر مع إطلالات على الواجهة البحرية',
      year: '2022',
    },
    {
      id: 3,
      title: 'متحف الكويت الوطني',
      category: 'حكومي',
      description: 'منشأة ثقافية حديثة',
      year: '2023',
    },
    {
      id: 4,
      title: 'بارك البوابة للأعمال',
      category: 'تجاري',
      description: 'مجمع مكاتب وتجزئة كبير الحجم',
      year: '2021',
    },
    {
      id: 5,
      title: 'امتداد الطريق الدائري الشرقي',
      category: 'هندسة',
      description: 'مشروع البنية التحتية للطريق السريع',
      year: '2022',
    },
    {
      id: 6,
      title: 'حديقة الطاقة المتجددة',
      category: 'هندسة',
      description: 'منشأة إنتاج طاقة مستدامة',
      year: '2024',
    },
  ],
}

function PortfolioContent() {
  const { language } = useLanguage()
  const projects = portfolioData[language as keyof typeof portfolioData]
  const labels = {
    learnMore: language === 'ar' ? 'تعرف أكثر' : 'Learn More →',
    viewMore: language === 'ar' ? 'عرض المزيد من المشاريع' : 'View More Projects',
  }

  return (
    <section className={styles.portfolio}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {language === 'ar' ? 'مشاريعنا' : 'Our Projects'}
          </h2>
          <p className={styles.subtitle}>
            {language === 'ar'
              ? 'عرض المشاريع المنجزة والإنجازات'
              : 'Showcase of completed projects and achievements'}
          </p>
        </div>

        <div className={styles.grid}>
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={styles.projectCard}
              style={{ '--project-index': index } as React.CSSProperties}
            >
              <div className={styles.projectHeader}>
                <span className={styles.category}>{project.category}</span>
                <span className={styles.year}>{project.year}</span>
              </div>

              <h3 className={styles.projectTitle}>{project.title}</h3>
              <p className={styles.projectDescription}>{project.description}</p>

              <div className={styles.projectFooter}>
                {project.cta === 'viewMore' ? (
                  <Link href="/projects" className={styles.learnMore}>
                    {labels.viewMore}
                  </Link>
                ) : (
                  <button className={styles.learnMore} type="button">
                    {labels.learnMore}
                  </button>
                )}
              </div>

              <div className={styles.projectBg} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Portfolio() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <section className={styles.portfolio} />
  }

  return <PortfolioContent />
}

