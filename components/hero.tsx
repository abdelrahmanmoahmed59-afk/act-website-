'use client'

import React, { useEffect, useRef, useState } from "react"

import { useLanguage } from '@/providers/language-provider'
import Link from 'next/link'
import styles from './hero.module.css'

function HeroContent() {
  const { t } = useLanguage()
  const heroRef = useRef<HTMLElement | null>(null)

  const handleScrollDown = () => {
    const current = heroRef.current
    if (!current) return

    const nextSection = current.nextElementSibling as HTMLElement | null
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    window.scrollTo({
      top: current.offsetTop + current.offsetHeight,
      behavior: 'smooth',
    })
  }

  return (
    <section id="main-content" tabIndex={-1} ref={heroRef} className={styles.hero}>
      <div className={styles.heroBackground}>
        {/* Animated grid background */}
        <svg className={styles.gridSvg} viewBox="0 0 1200 600">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="1200" height="600" fill="url(#grid)" />
        </svg>

        {/* Animated construction elements */}
        <div className={styles.animatedElements}>
          <div className={styles.element} style={{ '--delay': '0s' } as React.CSSProperties} />
          <div className={styles.element} style={{ '--delay': '1s' } as React.CSSProperties} />
          <div className={styles.element} style={{ '--delay': '2s' } as React.CSSProperties} />
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Main Title */}
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>{t('hero.title')}</h1>
            <div className={styles.titleAccent} />
          </div>

          {/* Subtitle */}
          <p className={styles.subtitle}>{t('hero.subtitle')}</p>

          {/* Description */}
          <p className={styles.description}>{t('hero.description')}</p>

          {/* CTA Buttons */}
          <div className={styles.ctaButtons}>
            <Link href="/projects" className={styles.primaryButton}>
              {t('hero.cta')}
              <span className={styles.buttonArrow} />
            </Link>
            <Link href="/contact" className={styles.secondaryButton}>
              {t('contact.title')}
            </Link>
          </div>
        </div>

        {/* Right side - Visual element */}
        <div className={styles.visual}>
          <div className={styles.visualContent}>
            {/* Animated construction crane SVG */}
            <svg
              viewBox="0 0 300 300"
              className={styles.constructionSvg}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Base */}
              <rect x="125" y="200" width="50" height="80" fill="currentColor" />

              {/* Arm */}
              <g className={styles.craneArm}>
                <rect x="150" y="80" width="120" height="12" fill="currentColor" />
                <circle cx="270" cy="86" r="8" fill="currentColor" />
              </g>

              {/* Cable and hook */}
              <g className={styles.craneHook}>
                <line x1="270" y1="94" x2="270" y2="160" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M 265 160 L 270 175 L 275 160"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                />
              </g>

              {/* Building blocks - animated */}
              <g className={styles.buildingBlocks}>
                {[...Array(3)].map((_, i) => (
                  <rect
                    key={i}
                    x={230 + i * 35}
                    y={200 - i * 40}
                    width="30"
                    height="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ '--block-index': i } as React.CSSProperties}
                  />
                ))}
              </g>

              {/* Blueprint grid */}
              <g opacity="0.1" className={styles.blueprint}>
                <line x1="50" y1="50" x2="250" y2="50" stroke="currentColor" strokeWidth="1" />
                <line x1="50" y1="100" x2="250" y2="100" stroke="currentColor" strokeWidth="1" />
                <line x1="50" y1="150" x2="250" y2="150" stroke="currentColor" strokeWidth="1" />
                <line x1="50" y1="50" x2="50" y2="150" stroke="currentColor" strokeWidth="1" />
                <line x1="100" y1="50" x2="100" y2="150" stroke="currentColor" strokeWidth="1" />
                <line x1="150" y1="50" x2="150" y2="150" stroke="currentColor" strokeWidth="1" />
                <line x1="200" y1="50" x2="200" y2="150" stroke="currentColor" strokeWidth="1" />
                <line x1="250" y1="50" x2="250" y2="150" stroke="currentColor" strokeWidth="1" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        className={styles.scrollIndicator}
        onClick={handleScrollDown}
        aria-label="Scroll to next section"
      >
        <div className={styles.scrollDot} />
        <span className={styles.scrollText} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            role="presentation"
            focusable="false"
            className={styles.scrollIcon}
          >
            <path
              d="M12 5v14m0 0l-6-6m6 6l6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </section>
  )
}

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <section className={styles.hero} />
  }

  return <HeroContent />
}
