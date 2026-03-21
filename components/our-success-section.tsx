'use client'

import React, { useEffect, useState } from "react"
import { useLanguage } from '@/providers/language-provider'
import styles from './our-success-section.module.css'

function OurSuccessContent() {
  const { language } = useLanguage()

  const content = {
    en: {
      title: "Our Success",
      subtitle: "Achievements & Recognition",
      achievements: [
        { icon: "🏆", title: "Industry Awards", description: "Multiple awards for excellence in construction and innovation" },
        { icon: "⭐", title: "Quality Standards", description: "Delivering work that meets professional construction standards" },
        { icon: "📈", title: "Growth", description: "Consistent year-over-year growth and market expansion" },
        { icon: "🤝", title: "Partnerships", description: "Strategic partnerships with global industry leaders" },
        { icon: "🌍", title: "Reach", description: "Successfully completed projects across Kuwait" },
        { icon: "💡", title: "Innovation", description: "Pioneering new technologies in construction management" }
      ]
    },
    ar: {
      title: "نجاحاتنا",
      subtitle: "الإنجازات والتكريمات",
      achievements: [
        { icon: "🏆", title: "جوائز الصناعة", description: "جوائز متعددة للتميز والابتكار في البناء" },
        { icon: "⭐", title: "معايير الجودة", description: "تقديم أعمال تلبي معايير البناء المهنية" },
        { icon: "📈", title: "النمو", description: "نمو ثابت سنة بعد سنة وتوسع السوق" },
        { icon: "🤝", title: "الشراكات", description: "شراكات استراتيجية مع قادة الصناعة العالميين" },
        { icon: "🌍", title: "الوصول العالمي", description: "اكتمال المشاريع بنجاح في عدة الكويت" },
        { icon: "💡", title: "الابتكار", description: "ريادة التقنيات الجديدة في إدارة البناء" }
      ]
    }
  }

  const t = content[language as keyof typeof content]

  return (
    <section className={styles.ourSuccess}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        <div className={styles.achievementsGrid}>
          {t.achievements.map((achievement, index) => (
            <div key={index} className={styles.achievementCard}>
              <div className={styles.icon}>{achievement.icon}</div>
              <h3 className={styles.cardTitle}>{achievement.title}</h3>
              <p className={styles.cardDescription}>{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bgDecoration} />
    </section>
  )
}

export default function OurSuccess() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <section className={styles.ourSuccess} />
  }

  return <OurSuccessContent />
}
