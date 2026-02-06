'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import styles from './page.module.css'

export default function AdminLoginPage() {
  const router = useRouter()
  const { language } = useLanguage()

  const content = {
    en: {
      title: 'Admin login',
      subtitle: 'Sign in to manage website content stored in local JSON files.',
      email: 'Email',
      password: 'Password',
      button: 'Sign in',
      error: 'Invalid email or password.',
    },
    ar: {
      title: 'تسجيل دخول المشرف',
      subtitle: 'سجّل الدخول لإدارة محتوى الموقع المخزن في ملفات JSON محلية.',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      button: 'تسجيل الدخول',
      error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    },
  }

  const t = content[language]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        setError(t.error)
        return
      }

      // Force a full navigation so server components definitely see the new cookie.
      window.location.assign('/admin/news')
    } catch {
      setError(t.error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <Header />
      <section className={styles.content} aria-label={t.title}>
        <div className={styles.background} aria-hidden="true" data-reveal-skip>
          <div className={styles.backgroundGrid} />
          <div className={styles.backgroundOrb} data-variant="one" />
          <div className={styles.backgroundOrb} data-variant="two" />
          <div className={styles.backgroundOrb} data-variant="three" />
        </div>

        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <form className={styles.form} onSubmit={onSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="admin-email">
                  {t.email}
                </label>
                <input
                  id="admin-email"
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="admin-password">
                  {t.password}
                </label>
                <input
                  id="admin-password"
                  className={styles.input}
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.button}
                  type="submit"
                  aria-disabled={submitting ? 'true' : 'false'}
                >
                  {submitting ? `${t.button}…` : t.button}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
