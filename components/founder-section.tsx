'use client'

import React, { useEffect, useState } from "react"
import Image from 'next/image'
import { useLanguage } from '@/providers/language-provider'
import styles from './founder-section.module.css'

function FounderContent() {
  const { language } = useLanguage()

  const content = {
    en: {
      title: "Our Founder",
      name: "Engineer Wessam Ibrahim",
      position: "Founder & Chairman",
      bio: "Engineer Wessam Ibrahim is a visionary leader with over 30 years of experience in the construction and contracting industry. With a degree in Civil Engineering from Alexandria University and numerous certifications in project management, he founded ACT with the mission to elevate construction standards in Kuwait and the region.",
      achievements: [
        "30+ Years Industry Experience",
        "Civil Engineering Degree - Alexandria University",
        "Recipient of Multiple Industry Awards"
      ]
    },
    ar: {
      title: "مؤسسنا",
      name: "المهندس وسام إبراهيم",
      position: "المؤسس والرئيس",
      bio: "المهندس وسام إبراهيم هو قائد رؤيوي يتمتع بأكثر من 30 سنة من الخبرة في صناعة البناء والمقاولات. مع درجة في الهندسة المدنية من جامعة الإسكندرية وعدد من الشهادات في إدارة المشاريع، أسس ACT برسالة رفع معايير البناء في الكويت والمنطقة.",
      achievements: [
        "30+ سنة من خبرة الصناعة",
        "درجة الهندسة المدنية - جامعة الإسكندرية",
        "حائز على العديد من جوائز الصناعة"
      ]
    }
  }

  const t = content[language as keyof typeof content]

  return (
    <section className={styles.founder}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.founderImage}>
            <Image
              src="/WhatsApp Image 2026-03-20 at 2.19.42 AM.jpeg"
              alt={language === 'en' ? 'Founder portrait' : 'صورة المؤسس'}
              width={736}
              height={1308}
              className={styles.founderPortrait}
              sizes="(max-width: 768px) 300px, 400px"
              priority
            />
          </div>

          <div className={styles.founderInfo}>
            <h2 className={styles.title}>{t.title}</h2>
            <h3 className={styles.name}>{t.name}</h3>
            <p className={styles.position}>{t.position}</p>
            <p className={styles.bio}>{t.bio}</p>

            <div className={styles.achievements}>
              <h4 className={styles.achievementsTitle}>
                {language === 'en' ? 'Key Achievements' : 'الإنجازات الرئيسية'}
              </h4>
              <ul className={styles.achievementsList}>
                {t.achievements.map((achievement, index) => (
                  <li key={index} className={styles.achievementItem}>
                    <span className={styles.checkmark}>✓</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bgPattern} />
    </section>
  )
}

export default function Founder() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <section className={styles.founder} />
  }

  return <FounderContent />
}
