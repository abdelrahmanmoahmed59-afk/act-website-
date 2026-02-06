'use client'

import { useEffect, useState } from 'react'
import styles from './loading-screen.module.css'

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        {/* Construction crane animation */}
        <div className={styles.craneContainer}>
          <svg
            viewBox="0 0 200 200"
            className={styles.crane}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Crane base */}
            <rect x="85" y="160" width="30" height="35" fill="currentColor" />

            {/* Crane arm */}
            <rect x="100" y="80" width="80" height="8" fill="currentColor" />

            {/* Crane hook */}
            <circle cx="175" cy="100" r="6" fill="currentColor" />
            <line x1="175" y1="106" x2="175" y2="130" stroke="currentColor" strokeWidth="2" />

            {/* Animated load */}
            <g className={styles.loadAnimation}>
              <rect x="165" y="125" width="20" height="15" fill="currentColor" opacity="0.7" />
            </g>

            {/* Grid pattern background */}
            <g opacity="0.15" className={styles.gridPattern}>
              <line x1="20" y1="20" x2="80" y2="20" stroke="currentColor" strokeWidth="1" />
              <line x1="20" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="1" />
              <line x1="20" y1="60" x2="80" y2="60" stroke="currentColor" strokeWidth="1" />
              <line x1="20" y1="20" x2="20" y2="60" stroke="currentColor" strokeWidth="1" />
              <line x1="40" y1="20" x2="40" y2="60" stroke="currentColor" strokeWidth="1" />
              <line x1="60" y1="20" x2="60" y2="60" stroke="currentColor" strokeWidth="1" />
            </g>
          </svg>
        </div>

        {/* Loading text */}
        <div className={styles.textContainer}>
          <h1 className={styles.title}>ACT</h1>
          <p className={styles.subtitle}>Advanced Combined Group</p>
          <div className={styles.progressBar}>
            <div className={styles.progress} />
          </div>
        </div>

        {/* Construction blocks falling animation */}
        <div className={styles.blocks}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={styles.block}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
