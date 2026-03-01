'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import Header from '@/components/header'
import Footer from '@/components/footer'
import styles from './layout.module.css'

type NavItem = { href: string; label: string }

export default function AdminShell({
  admin,
  navItems,
  children,
}: {
  admin: { email: string; role: string }
  navItems: NavItem[]
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className={styles.page}>
        <section id="main-content" tabIndex={-1} className={styles.hero}>
          <div className={styles.container}>
            <h1 className={styles.heroTitle}>Admin Dashboard</h1>
            <p className={styles.heroSubtitle}>Loading...</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <Header />

      <section id="main-content" tabIndex={-1} className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>Admin Dashboard</h1>
          <p className={styles.heroSubtitle}>
            Manage bilingual content (English / Arabic) stored in local JSON files. Updates revalidate the public pages for
            SEO-friendly rendering.
          </p>
          <div className={styles.heroMeta} aria-label="Admin session">
            <span className={styles.chip}>Signed in: {admin.email}</span>
            <span className={styles.chip}>Role: {admin.role}</span>
          </div>
        </div>
      </section>

      <section className={styles.content} aria-label="Admin content">
        <div className={styles.background} aria-hidden="true" data-reveal-skip>
          <div className={styles.backgroundGrid} />
          <div className={styles.backgroundOrb} data-variant="one" />
          <div className={styles.backgroundOrb} data-variant="two" />
          <div className={styles.backgroundOrb} data-variant="three" />
        </div>

        <div className={styles.container}>
          <div className={styles.shell}>
            <aside className={styles.sidebar} aria-label="Admin navigation">
              <p className={styles.navTitle}>Navigation</p>
              <nav className={styles.nav}>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className={styles.navLink}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <form className={styles.logoutForm} action="/api/auth/logout" method="post">
                <button type="submit" className={styles.logoutButton}>
                  Logout
                </button>
              </form>
            </aside>
            <div className={styles.main}>{children}</div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

