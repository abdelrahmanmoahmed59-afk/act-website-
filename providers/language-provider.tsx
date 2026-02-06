'use client'

import React from "react"

import { createContext, useContext, useEffect, useState } from 'react'
import { baseTranslations, type Language } from '@/lib/i18n/base-translations'

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('act-language') as Language | null
      if (stored === 'en' || stored === 'ar') {
        setLanguage(stored)
      }
    } catch {}
  }, [])

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'ar' : 'en'
      return next
    })
  }

  useEffect(() => {
    try {
      localStorage.setItem('act-language', language)
      document.documentElement.lang = language
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    } catch {}
  }, [language])

  const t = (key: string) => {
    return baseTranslations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
