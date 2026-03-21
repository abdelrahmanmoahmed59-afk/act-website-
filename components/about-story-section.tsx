'use client'

import React, { useEffect, useState } from "react"
import Image from 'next/image'
import { useLanguage } from '@/providers/language-provider'
import styles from './about-story-section.module.css'

function AboutStoryContent({ isPageTop }: { isPageTop?: boolean }) {
  const { language } = useLanguage()

  const content = {
    en: {
      title: "Our Story",
      subtitle: "Founded in Kuwait in Jan. 2017",
      description: "Founded in Kuwait in Jan. 2017, today is the regional in design, build and construction of industrial, Residential and commercial buildings in Kuwait. Structured in a decentralized manner, the company has built its reputation on the ability to provide design solutions for extremely fast track projects and enable to participate in various governmental tenders & projects in Kuwait State.",
      highlights: [
        { label: "Years of Experience", value: "10+" },
        { label: "Projects Completed", value: "20+" },
        { label: "Team Members", value: "50+" },
        { label: "Client Satisfaction", value: "100%" }
      ]
    },
    ar: {
      title: "عن قصتنا",
      subtitle: "تأسست في الكويت في يناير 2017",
      description: "تأسست في الكويت في يناير 2017، واليوم تُعد من الشركات الإقليمية الرائدة في تصميم وبناء وتشييد المباني الصناعية والسكنية والتجارية في الكويت. وتعتمد الشركة هيكلاً لامركزياً، وقد بنت سمعتها على قدرتها على تقديم حلول تصميمية للمشاريع ذات الجداول الزمنية السريعة للغاية، وتمكينها من المشاركة في مختلف المناقصات والمشاريع الحكومية في دولة الكويت.",
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
            <Image
              src="/actProfile.png"
              alt="ACT Advanced Combined Group profile"
              fill
              className={styles.storyImage}
              sizes="(max-width: 768px) 100vw, 40vw"
              priority={isPageTop}
            />
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
