'use client'

import React, { useEffect, useState } from "react"
import { useLanguage } from '@/providers/language-provider'
import styles from './about-story-section.module.css'

function AboutStoryContent({ isPageTop }: { isPageTop?: boolean }) {
  const { language } = useLanguage()

  const content = {
    en: {
      title: "About Our Story",
      subtitle: "Building Excellence Since 2010",
      description: "Advanced Combined Group (ACT) was founded with a vision to transform the construction and contracting industry in Kuwait. With over a decade of expertise, we have established ourselves as a trusted partner for major infrastructure and commercial projects.",
      highlights: [
        { label: "Years of Experience", value: "15+" },
        { label: "Projects Completed", value: "200+" },
        { label: "Team Members", value: "500+" },
        { label: "Client Satisfaction", value: "98%" }
      ]
    },
    ar: {
      title: "عن قصتنا",
      subtitle: "بناء التميز منذ 2010",
      description: "تأسست مجموعة ACT المتقدمة برؤية تحويل صناعة البناء والمقاولات في الكويت. مع أكثر من عقد من الخبرة، أثبتنا أنفسنا كشريك موثوق للمشاريع البنية التحتية والتجارية الكبرى.",
      highlights: [
        { label: "سنوات الخبرة", value: "15+" },
        { label: "المشاريع المكتملة", value: "200+" },
        { label: "أعضاء الفريق", value: "500+" },
        { label: "رضا العملاء", value: "98%" }
      ]
    }
  }

  const t = content[language as keyof typeof content]

  return (
    <section
      className={`${styles.aboutStory} ${isPageTop ? styles.aboutStoryTop : ''}`}
    >
      <div className={styles.container}>
        <div className={styles.storyCopy}>
          <span className={styles.kicker}>{t.subtitle}</span>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.description}>{t.description}</p>
        </div>
        <div className={styles.storyPanel}>
          <div className={styles.imageFrame}>
            <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="300" fill="currentColor" opacity="0.1"/>
              <rect x="40" y="60" width="320" height="180" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
              <rect x="70" y="100" width="120" height="90" fill="currentColor" opacity="0.08"/>
              <rect x="210" y="90" width="120" height="110" fill="currentColor" opacity="0.12"/>
            </svg>
          </div>
          <div className={styles.highlights}>
            {t.highlights.map((highlight, index) => (
              <div
                key={index}
                className={styles.highlightCard}
                style={{ '--highlight-index': index } as React.CSSProperties}
              >
                <div className={styles.value}>{highlight.value}</div>
                <div className={styles.label}>{highlight.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AboutStory({ isPageTop }: { isPageTop?: boolean }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <section className={styles.aboutStory} />
  }

  return <AboutStoryContent isPageTop={isPageTop} />
}
