'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const excludedTags = new Set([
  'script',
  'style',
  'link',
  'meta',
  'noscript',
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'g',
  'defs',
  'clippath',
  'mask',
  'lineargradient',
  'stop',
  'use',
])

export default function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.querySelector('main')
    if (!root) return

    const elements = Array.from(root.querySelectorAll<HTMLElement>('*')).filter(
      (element) => {
        if (element.dataset.revealSkip !== undefined) return false
        const tagName = element.tagName.toLowerCase()
        return !excludedTags.has(tagName)
      }
    )

    let index = 0
    elements.forEach((element) => {
      if (element.dataset.reveal === 'visible') return
      element.dataset.reveal = 'hidden'
      const delay = Math.min(index * 60, 480)
      element.style.setProperty('--reveal-delay', `${delay}ms`)
      index += 1
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            target.dataset.reveal = 'visible'
            observer.unobserve(target)
          }
        })
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px',
      }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [pathname])

  return null
}
