'use client'

import React, { useEffect, useState } from "react"

import { useLanguage } from '@/providers/language-provider'
import Link from 'next/link'
import styles from './cta-section.module.css'

function CTAContent() {
  const { language } = useLanguage()

  return (
    <section className={styles.cta}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            {language === 'en'
              ? 'Ready to Build Your Future?'
              : 'هل أنت مستعد لبناء مستقبلك؟'}
          </h2>
          <p className={styles.description}>
            {language === 'en'
              ? 'Get in touch with our team to discuss your construction and development needs. We offer customized solutions for projects of all scales.'
              : 'تواصل مع فريقنا لمناقشة احتياجات البناء والتطوير الخاصة بك. نقدم حلولاً مخصصة للمشاريع من جميع الأحجام.'}
          </p>

          <div className={styles.buttons}>
            <Link href="/contact" className={styles.primaryBtn}>
              {language === 'en' ? 'Get Started' : 'ابدأ الآن'}
            </Link>
            <Link href="/projects" className={styles.secondaryBtn}>
              {language === 'en' ? 'View Projects' : 'اعرض المشاريع'}
            </Link>
          </div>
        </div>

        {/* Animated background */}
        <div className={styles.bg}>
          <div className={styles.circle} style={{ '--delay': '0s' } as React.CSSProperties} />
          <div className={styles.circle} style={{ '--delay': '1s' } as React.CSSProperties} />
          <div className={styles.circle} style={{ '--delay': '2s' } as React.CSSProperties} />
        </div>
      </div>
    </section>
  )
}

export default function CTA() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <section className={styles.cta} />
  }

  return <CTAContent />
}
