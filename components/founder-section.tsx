'use client'

import React, { useEffect, useState } from "react"
import { useLanguage } from '@/providers/language-provider'
import styles from './founder-section.module.css'

function FounderContent() {
  const { language } = useLanguage()

  const content = {
    en: {
      title: "Meet Our Founder",
      name: "Engineer Ahmed Al-Rashid",
      position: "Founder & Chairman",
      bio: "Engineer Ahmed Al-Rashid is a visionary leader with over 30 years of experience in the construction and contracting industry. With a degree in Civil Engineering from Kuwait University and numerous certifications in project management, he founded ACT with the mission to elevate construction standards in Kuwait and the region.",
      achievements: [
        "30+ Years Industry Experience",
        "Civil Engineering Degree - Kuwait University",
        "ISO 9001 Project Management Certification",
        "Board Member of Construction Association",
        "Recipient of Multiple Industry Awards"
      ]
    },
    ar: {
      title: "قابل مؤسسنا",
      name: "المهندس أحمد الرشيد",
      position: "المؤسس والرئيس",
      bio: "المهندس أحمد الرشيد هو قائد رؤيوي يتمتع بأكثر من 30 سنة من الخبرة في صناعة البناء والمقاولات. مع درجة في الهندسة المدنية من جامعة الكويت وعدد من الشهادات في إدارة المشاريع، أسس ACT برسالة رفع معايير البناء في الكويت والمنطقة.",
      achievements: [
        "30+ سنة من خبرة الصناعة",
        "درجة الهندسة المدنية - جامعة الكويت",
        "شهادة ISO 9001 في إدارة المشاريع",
        "عضو مجلس إدارة جمعية البناء",
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
            <svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.05"/>
                </linearGradient>
              </defs>
              <rect width="300" height="400" fill="url(#grad1)"/>
              <circle cx="150" cy="100" r="50" fill="currentColor" opacity="0.15"/>
              <path d="M 100 150 Q 150 120 200 150" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15"/>
              <rect x="80" y="200" width="140" height="150" fill="currentColor" opacity="0.08" rx="10"/>
              <text x="150" y="350" textAnchor="middle" fill="currentColor" opacity="0.4" fontSize="14">
                Founder Photo
              </text>
            </svg>
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
