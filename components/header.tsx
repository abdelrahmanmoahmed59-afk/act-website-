'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/providers/theme-provider'
import { useLanguage } from '@/providers/language-provider'
import SearchDialog from './search-dialog'
import styles from './header.module.css'

function HeaderContent() {
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage, t } = useLanguage()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) {
      setOpenDropdown(null)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setOpenDropdown(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDropdownToggle = (href: string) => {
    setOpenDropdown((prev) => (prev === href ? null : href))
  }

  const handleNavItemClick = () => {
    if (mobileMenuOpen) setMobileMenuOpen(false)
  }

  interface NavSubItem {
    label: string
    href: string
  }

  interface NavItem {
    label: string
    href: string
    subItems?: NavSubItem[]
    cta?: boolean
  }

  const projectItems = [
    {
      label: language === 'ar' ? 'برج الحمراء' : 'Al-Hamra Tower',
      href: '/projects/al-hamra-tower',
    },
    {
      label: language === 'ar' ? 'مارينا هايتس' : 'Marina Heights',
      href: '/projects/marina-heights',
    },
    {
      label: language === 'ar' ? 'متحف الكويت' : 'Kuwait Museum',
      href: '/projects/kuwait-museum',
    },
    {
      label: language === 'ar' ? 'بوابة الأعمال' : 'Gateway Business',
      href: '/projects/gateway-business',
    },
    {
      label: language === 'ar' ? 'الطريق الدائري الشرقي' : 'East Ring Road',
      href: '/projects/east-ring-road',
    },
    {
      label: language === 'ar' ? 'حديقة الطاقة' : 'Energy Park',
      href: '/projects/energy-park',
    },
    {
      label: language === 'ar' ? 'مركز الشويخ اللوجستي' : 'Shuwaikh Logistics Hub',
      href: '/projects/shuwaikh-logistics-hub',
    },
    {
      label: language === 'ar' ? 'توسعة عيادة وزارة الصحة' : 'Ministry of Health Clinic Expansion',
      href: '/projects/moh-clinic-expansion',
    },
    {
      label: language === 'ar' ? 'مشروع مدينة صباح الأحمد السكني' : 'Sabah Al-Ahmad City Housing',
      href: '/projects/sabah-al-ahmad-housing',
    },
    {
      label: language === 'ar' ? 'ناشونال أوراسكوم' : 'National Orascom',
      href: '/projects/national-orascom',
    },
  ]

  const [dynamicProjectItems, setDynamicProjectItems] = useState<NavSubItem[]>([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`/api/projects/menu?lang=${language}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('menu')
        const json = await res.json()
        const items = Array.isArray(json?.items)
          ? (json.items as Array<{ slug: string; label: string }>).map((item) => ({
              label: item.label,
              href: `/projects/${item.slug}`,
            }))
          : []
        if (!alive) return
        setDynamicProjectItems(items)
      } catch {
        if (!alive) return
        setDynamicProjectItems([])
      }
    })()
    return () => {
      alive = false
    }
  }, [language])

  const navItems: NavItem[] = [
    { label: t('nav.home'), href: '/' },
    {
      label: t('nav.overview'),
      href: '/overview',
      subItems: [
        { label: t('nav.about'), href: '/about' },
        { label: t('nav.services'), href: '/services' },
        { label: t('nav.news'), href: '/news' },
        { label: t('nav.careers'), href: '/careers' },
      ],
    },
    {
      label: t('nav.portfolio'),
      href: '/projects',
      subItems: dynamicProjectItems.length ? dynamicProjectItems : undefined,
    },
    { label: t('nav.clients'), href: '/clients' },
    { label: t('nav.blog'), href: '/blog' },
    { label: t('nav.media'), href: '/media' },
    { label: t('nav.quotation'), href: '/get-quotation' },
    { label: t('nav.contact'), href: '/contact' },
  ]

  const normalizeHref = (href: string) => href.split('#')[0]

  const isHrefActive = (href: string) => {
    const normalized = normalizeHref(href)
    if (normalized === '/') return pathname === '/'
    return pathname === normalized || pathname.startsWith(`${normalized}/`)
  }

  const isNavItemActive = (item: NavItem) => {
    if (isHrefActive(item.href)) return true
    if (!item.subItems) return false
    return item.subItems.some((subItem) => isHrefActive(subItem.href))
  }

  const isNavItemCurrent = (item: NavItem) => isHrefActive(item.href)

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="ACT Home">
          <Image
            src="/PixelBin-AI-Editor-1769591398501-removebg-preview.png"
            alt="ACT logo"
            width={634}
            height={386}
            sizes="(max-width: 640px) 170px, (max-width: 768px) 190px, 220px"
            priority
            className={styles.logoImage}
          />
        </Link>

        {/* Navigation */}
        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const current = isNavItemCurrent(item)
              const active = isNavItemActive(item)

              const linkClassName = [
                styles.navLink,
                active ? styles.activeLink : '',
                item.cta ? styles.ctaLink : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
              <li
                key={item.href}
                className={`${styles.navItem} ${
                  item.subItems && openDropdown === item.href ? styles.navItemOpen : ''
                }`}
              >
                <div className={styles.navLinkRow}>
                  <Link
                    href={item.href}
                    className={linkClassName}
                    onClick={handleNavItemClick}
                    aria-current={current ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                  {item.subItems && (
                    <button
                      type="button"
                      className={styles.dropdownToggle}
                      onClick={() => handleDropdownToggle(item.href)}
                      aria-label="Toggle dropdown"
                      aria-haspopup="menu"
                      aria-expanded={openDropdown === item.href}
                    >
                      <span className={styles.dropdownIndicator} />
                    </button>
                  )}
                </div>
                {item.subItems && (
                  <div className={styles.dropdown}>
                    <ul className={styles.dropdownList}>
                      {item.subItems.map((subItem) => {
                        const subItemCurrent = !subItem.href.includes('#') && isHrefActive(subItem.href)

                        const subItemClassName = [
                          styles.dropdownLink,
                          subItemCurrent ? styles.activeDropdownLink : '',
                        ]
                          .filter(Boolean)
                          .join(' ')

                        return (
                          <li key={subItem.href} className={styles.dropdownItem}>
                            <Link
                              href={subItem.href}
                              className={subItemClassName}
                              onClick={handleNavItemClick}
                              aria-current={subItemCurrent ? 'page' : undefined}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </li>
              )
            })}
          </ul>
        </nav>

        {/* Controls */}
        <div className={styles.controls}>
          <SearchDialog />

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className={styles.controlButton}
            aria-label="Toggle language"
            title={language === 'en' ? 'العربية' : 'English'}
          >
            <span className={styles.languageToggle}>{language.toUpperCase()}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={styles.controlButton}
            aria-label="Toggle dark mode"
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={styles.mobileMenuButton}
            aria-label="Toggle mobile menu"
          >
            <span className={styles.menuIcon} />
            <span className={styles.menuIcon} />
            <span className={styles.menuIcon} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default function Header() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo} aria-label="ACT Home">
            <Image
              src="/PixelBin-AI-Editor-1769591398501-removebg-preview.png"
              alt="ACT logo"
              width={634}
              height={386}
              sizes="(max-width: 640px) 170px, (max-width: 768px) 190px, 220px"
              priority
              className={styles.logoImage}
            />
          </Link>
          <div className={styles.controls} />
        </div>
      </header>
    )
  }

  return <HeaderContent />
}
