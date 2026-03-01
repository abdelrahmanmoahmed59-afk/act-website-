'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, type LucideIcon } from 'lucide-react'
import { useLanguage } from '@/providers/language-provider'
import styles from './footer.module.css'

type FooterLink = { label: string; href: string }
type SocialLink = FooterLink & { icon: LucideIcon }

type LocalizedText = { en: string; ar: string }

type ContactSettings = {
  title: LocalizedText
  intro: LocalizedText
  emailText: string
  phoneNum: string
  address: LocalizedText
  mapSrc: string
}

function FooterContent() {
  const { language, t } = useLanguage()
  const isArabic = language === 'ar'
  const currentYear = new Date().getFullYear()
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null)

  const footerContent: Record<
    'en' | 'ar',
    {
      headings: { company: string; office: string; contact: string }
      brandDesc: string
      company: FooterLink[]
      contact: FooterLink[]
      office: { addressText: string; emailText: string; phoneNum: string }
      social: SocialLink[]
    }
  > = {
    en: {
      headings: {
        company: 'Company',
        office: 'Office',
        contact: 'Contact',
      },
      brandDesc: 'Advanced Combined Group - Leading construction and contracting solutions in Kuwait',
      company: [
        { label: 'Overview', href: '/overview' },
        { label: 'About Us', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Careers', href: '/careers' },
        { label: 'Projects', href: '/projects' },
        { label: 'Clients', href: '/clients' },
      ],
      office: {
        addressText: 'Shuwaikh, Kuwait',
        emailText: 'info@act-kw.com',
        phoneNum: '+965 9558 8251',
      },
      contact: [
        { label: 'Get Quotation', href: '/get-quotation' },
        { label: 'Contact Page', href: '/contact' },
        { label: 'Email Us', href: 'mailto:info@act-kw.com' },
        { label: 'Call Us', href: 'tel:+96595588251' },
      ],
      social: [
        { label: 'LinkedIn', href: '#', icon: Linkedin },
        { label: 'Twitter', href: '#', icon: Twitter },
        { label: 'Facebook', href: '#', icon: Facebook },
        { label: 'Instagram', href: '#', icon: Instagram },
      ],
    },
    ar: {
      headings: {
        company: 'الشركة',
        office: 'المكتب',
        contact: 'التواصل',
      },
      brandDesc: 'المجموعة المتقدمة المتكاملة - حلول البناء والمقاولات الرائدة في الكويت',
      company: [
        { label: 'نظرة عامة', href: '/overview' },
        { label: 'من نحن', href: '/about' },
        { label: 'الخدمات', href: '/services' },
        { label: 'الوظائف', href: '/careers' },
        { label: 'المشاريع', href: '/projects' },
        { label: 'العملاء', href: '/clients' },
      ],
      office: {
        addressText: 'الشويخ، الكويت',
        emailText: 'info@act-kw.com',
        phoneNum: '+965 9558 8251',
      },
      contact: [
        { label: 'احصل على عرض سعر', href: '/get-quotation' },
        { label: 'صفحة التواصل', href: '/contact' },
        { label: 'أرسل بريدًا', href: 'mailto:info@act-kw.com' },
        { label: 'اتصل بنا', href: 'tel:+96595588251' },
      ],
      social: [
        { label: 'LinkedIn', href: '#', icon: Linkedin },
        { label: 'Twitter', href: '#', icon: Twitter },
        { label: 'Facebook', href: '#', icon: Facebook },
        { label: 'Instagram', href: '#', icon: Instagram },
      ],
    },
  }

  const data = footerContent[language]

  useEffect(() => {
    let cancelled = false
    fetch('/api/contact/settings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return
        const settings = (json as any)?.settings
        if (settings && typeof settings === 'object') setContactSettings(settings as ContactSettings)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const addressText = contactSettings?.address?.[language] || data.office.addressText
  const emailText = contactSettings?.emailText || data.office.emailText
  const phoneNum = contactSettings?.phoneNum || data.office.phoneNum
  const mapHref = `https://www.google.com/maps?q=${encodeURIComponent(addressText)}`

  const contactLinks: FooterLink[] = data.contact.map((link) => {
    if (link.href.startsWith('mailto:')) return { ...link, href: `mailto:${emailText}` }
    if (link.href.startsWith('tel:')) return { ...link, href: `tel:${phoneNum.replace(/\s+/g, '')}` }
    return link
  })

  const officeItems = [
    {
      icon: MapPin,
      label: isArabic ? 'العنوان' : 'Address',
      value: addressText,
      href: mapHref,
      dir: isArabic ? 'rtl' : 'ltr',
    },
    {
      icon: Mail,
      label: isArabic ? 'البريد الإلكتروني' : 'Email',
      value: emailText,
      href: `mailto:${emailText}`,
      dir: 'ltr',
    },
    {
      icon: Phone,
      label: isArabic ? 'الهاتف' : 'Phone',
      value: phoneNum,
      href: `tel:${phoneNum.replace(/\s+/g, '')}`,
      dir: 'ltr',
    },
  ] as const

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.brandLogoLink} aria-label="ACT Home">
              <Image
                src="/PixelBin-AI-Editor-1769591398501-removebg-preview.png"
                alt="ACT logo"
                width={634}
                height={386}
                sizes="(max-width: 640px) 180px, (max-width: 768px) 200px, 240px"
                className={styles.brandLogo}
              />
            </Link>
            <p className={styles.brandDesc}>{data.brandDesc}</p>

            <div
              className={styles.socialRow}
              aria-label={isArabic ? 'روابط التواصل الاجتماعي' : 'Social links'}
            >
              {data.social.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    className={styles.socialLink}
                    aria-label={link.label}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                  >
                    <Icon className={styles.socialIcon} aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className={styles.linkColumn}>
            <h4 className={styles.columnTitle}>{data.headings.company}</h4>
            <ul className={styles.linkList}>
              {data.company.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linkColumn}>
            <h4 className={styles.columnTitle}>{data.headings.office}</h4>
            <ul className={styles.infoList}>
              {officeItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.label} className={styles.infoItem}>
                    <span className={styles.infoIcon} aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <div className={styles.infoBody}>
                      <span className={styles.infoLabel}>{item.label}</span>
                      <a
                        className={styles.infoLink}
                        href={item.href}
                        dir={item.dir}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                      >
                        {item.value}
                      </a>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className={styles.linkColumn}>
            <h4 className={styles.columnTitle}>{data.headings.contact}</h4>
            <ul className={styles.linkList}>
              {contactLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  {link.href.startsWith('/') ? (
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  ) : (
                    <a className={styles.link} href={link.href}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} {t('footer.company')}. {t('footer.rights')}.
          </p>
          <p className={styles.credit}>
            {language === 'en'
              ? 'Crafted with innovation and precision'
              : 'تم إنشاؤه بالابتكار والدقة'}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Footer() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <footer className={styles.footer}>
        <div className={styles.container} />
      </footer>
    )
  }

  return <FooterContent />
}
