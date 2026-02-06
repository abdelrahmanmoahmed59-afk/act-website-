'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import styles from './page.module.css'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HardHat,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'

type Role = {
  id?: number
  title: string
  location: string
  type: string
  summary: string
}

function CareersContent() {
  const { language } = useLanguage()

  const benefitIcons = useMemo(() => [ShieldCheck, GraduationCap, Sparkles, ClipboardCheck] as const, [])
  const roleIcons = useMemo(() => [HardHat, Briefcase, ShieldCheck] as const, [])
  const processIcons = useMemo(() => [FileText, User, ClipboardCheck, BadgeCheck] as const, [])

  const localContent = {
    en: {
      title: 'Careers',
      intro: 'Build Kuwait with ACT. Join teams that deliver complex projects safely and on schedule.',
      benefitsTitle: 'Why Work With ACT',
      benefits: [
        'Stable pipeline of public and private projects',
        'Safety-first culture with continuous training',
        'Clear growth paths for engineers and trade specialists',
        'Modern tools for planning, reporting, and quality control',
      ],
      rolesTitle: 'Open Roles',
      roles: [
        {
          title: 'Project Manager',
          location: 'Kuwait City',
          type: 'Full-time',
          summary: 'Lead multi-discipline teams, manage schedules, and coordinate stakeholders.',
        },
        {
          title: 'Site Engineer',
          location: 'Al Ahmadi',
          type: 'Full-time',
          summary: 'Oversee site execution, QA/QC checks, and daily reporting.',
        },
        {
          title: 'HSE Officer',
          location: 'Various Sites',
          type: 'Full-time',
          summary: 'Drive safety compliance, audits, and incident prevention programs.',
        },
      ],
      processTitle: 'Hiring Process',
      process: [
        'Submit your resume and project experience.',
        'Initial screening and technical interview.',
        'Final interview with the project leadership team.',
        'Offer and onboarding.',
      ],
      applyAria: 'Apply for',
      dialogTitle: 'Application form',
      dialogIntro: 'Complete your details and we will contact you.',
      formName: 'Full name',
      formEmail: 'Email',
      formPhone: 'Phone',
      formRole: 'Position',
      formSubmit: 'Confirm submission',
      formSubmitting: 'Submitting...',
      formClose: 'Close',
      successTitle: 'Application submitted',
      successText: 'Thanks! Our recruitment team will contact you soon.',
      successClose: 'Done',
      ctaTitle: 'Ready to build with us?',
      ctaDesc: 'Send your resume and certifications to our recruitment team.',
      ctaButton: 'Apply Now',
      email: 'careers@actgroup.com',
    },
    ar: {
      title: 'الوظائف',
      intro: 'ابنِ الكويت مع ACT. انضم إلى فرق تنفذ مشاريع معقدة بأمان وفي الوقت المحدد.',
      benefitsTitle: 'لماذا العمل مع ACT',
      benefits: [
        'محفظة مشاريع مستقرة في القطاعين العام والخاص',
        'ثقافة سلامة أولاً مع تدريب مستمر',
        'مسارات نمو واضحة للمهندسين والحرفيين',
        'أدوات حديثة للتخطيط والتقارير وضبط الجودة',
      ],
      rolesTitle: 'الوظائف المتاحة',
      roles: [
        {
          title: 'مدير مشروع',
          location: 'مدينة الكويت',
          type: 'دوام كامل',
          summary: 'قيادة فرق متعددة التخصصات وإدارة الجداول والتنسيق مع أصحاب المصلحة.',
        },
        {
          title: 'مهندس موقع',
          location: 'الأحمدي',
          type: 'دوام كامل',
          summary: 'الإشراف على التنفيذ وفحوصات الجودة والتقارير اليومية.',
        },
        {
          title: 'مسؤول السلامة والصحة المهنية',
          location: 'مواقع متعددة',
          type: 'دوام كامل',
          summary: 'تعزيز الالتزام بالسلامة وإجراء التدقيقات وبرامج منع الحوادث.',
        },
      ],
      processTitle: 'خطوات التوظيف',
      process: [
        'أرسل سيرتك الذاتية وخبراتك في المشاريع.',
        'فرز أولي ومقابلة تقنية.',
        'مقابلة نهائية مع فريق قيادة المشروع.',
        'عرض وظيفي وبدء إجراءات الانضمام.',
      ],
      applyAria: 'التقديم على',
      dialogTitle: 'نموذج التقديم',
      dialogIntro: 'أدخل بياناتك وسنتواصل معك.',
      formName: 'الاسم الكامل',
      formEmail: 'البريد الإلكتروني',
      formPhone: 'رقم الهاتف',
      formRole: 'الوظيفة',
      formSubmit: 'تأكيد الإرسال',
      formSubmitting: 'جارٍ الإرسال...',
      formClose: 'إغلاق',
      successTitle: 'تم استلام الطلب',
      successText: 'شكرًا لك! سيتواصل معك فريق التوظيف قريبًا.',
      successClose: 'تم',
      ctaTitle: 'جاهز للانضمام؟',
      ctaDesc: 'أرسل سيرتك الذاتية والشهادات إلى فريق التوظيف.',
      ctaButton: 'قدّم الآن',
      email: 'careers@actgroup.com',
    },

  }

  const data = localContent[language as keyof typeof localContent]
  const [apiRoles, setApiRoles] = useState<Role[] | null>(null)
  const roles = (apiRoles && apiRoles.length ? apiRoles : (data.roles as Role[]))

  const [openRole, setOpenRole] = useState<Role | null>(null)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const successCloseRef = useRef<HTMLButtonElement | null>(null)

  const closeDialog = () => {
    setOpenRole(null)
    setSubmitted(false)
    setSubmitting(false)
    setSubmitError(null)
  }

  const openDialog = (role: Role) => {
    setOpenRole(role)
    setSubmitted(false)
    setSubmitting(false)
    setSubmitError(null)
    setFormName('')
    setFormEmail('')
    setFormPhone('')
  }

  useEffect(() => {
    closeDialog()
  }, [language])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/careers/jobs?lang=${language}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return
        const jobs = Array.isArray((json as any)?.jobs) ? ((json as any).jobs as any[]) : []
        setApiRoles(
          jobs.map((j) => ({
            id: typeof j.id === 'number' ? j.id : undefined,
            title: String(j.title ?? ''),
            location: String(j.location ?? ''),
            type: String(j.type ?? ''),
            summary: String(j.summary ?? ''),
          }))
        )
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [language])

  useEffect(() => {
    if (!openRole) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDialog()

      if (event.key === 'Tab') {
        const dialog = dialogRef.current
        if (!dialog) return

        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        )

        if (focusables.length === 0) return

        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement as HTMLElement | null

        if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        } else if (event.shiftKey && active === first) {
          event.preventDefault()
          last.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.setTimeout(() => {
      if (submitted) {
        successCloseRef.current?.focus()
        return
      }

      if (nameRef.current) {
        nameRef.current.focus()
        return
      }

      closeRef.current?.focus()
    }, 0)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [openRole, submitted])

  return (
    <main className={styles.page}>
      <Header />

      <section id="main-content" tabIndex={-1} className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroBadge}>
            <Sparkles aria-hidden="true" />
            <span>{data.rolesTitle}</span>
          </div>
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.intro}>{data.intro}</p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.background} aria-hidden="true" data-reveal-skip>
          <div className={styles.backgroundGrid} />
          <div className={styles.backgroundOrb} data-variant="one" />
          <div className={styles.backgroundOrb} data-variant="two" />
          <div className={styles.backgroundOrb} data-variant="three" />
        </div>

        <div className={styles.container}>
          <section className={styles.section} aria-labelledby="careers-benefits">
            <div className={styles.sectionHeader}>
              <h2 id="careers-benefits" className={styles.sectionTitle}>
                {data.benefitsTitle}
              </h2>
            </div>

            <div className={styles.benefitsGrid}>
              {data.benefits.map((benefit, index) => {
                const Icon = benefitIcons[index % benefitIcons.length]

                return (
                  <div key={benefit} className={styles.benefitCard}>
                    <div className={styles.cardIcon} aria-hidden="true">
                      <Icon />
                    </div>
                    <p className={styles.benefitText}>{benefit}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="careers-roles">
            <div className={styles.sectionHeader}>
              <h2 id="careers-roles" className={styles.sectionTitle}>
                {data.rolesTitle}
              </h2>
              <p className={styles.sectionIntro}>{data.ctaDesc}</p>
            </div>

            <div className={styles.rolesGrid}>
              {roles.map((role, index) => {
                const Icon = roleIcons[index % roleIcons.length]
                const applyLabel = `${data.applyAria} ${role.title}`

                return (
                  <article key={role.title} className={styles.roleCard}>
                    <div className={styles.roleHead}>
                      <div className={styles.roleIcon} aria-hidden="true">
                        <Icon />
                      </div>
                      <div className={styles.roleHeaderText}>
                        <h3 className={styles.roleTitle}>{role.title}</h3>
                        <p className={styles.roleSummary}>{role.summary}</p>
                      </div>
                    </div>

                    <div className={styles.roleFooter}>
                      <div className={styles.roleMeta}>
                        <span className={styles.metaItem}>
                          <MapPin aria-hidden="true" />
                          <span>{role.location}</span>
                        </span>
                        <span className={styles.metaPill}>
                          <Briefcase aria-hidden="true" />
                          <span>{role.type}</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        className={styles.applyTrigger}
                        aria-label={applyLabel}
                        onClick={() => openDialog(role)}
                      >
                        <span className={styles.srOnly}>{applyLabel}</span>
                        <ArrowRight aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="careers-process">
            <div className={styles.sectionHeader}>
              <h2 id="careers-process" className={styles.sectionTitle}>
                {data.processTitle}
              </h2>
            </div>

            <ol className={styles.processList}>
              {data.process.map((step, index) => {
                const Icon = processIcons[index % processIcons.length]
                const number = String(index + 1).padStart(2, '0')

                return (
                  <li key={step} className={styles.processItem}>
                    <span className={styles.processIndex} aria-hidden="true">
                      {number}
                    </span>
                    <span className={styles.processIcon} aria-hidden="true">
                      <Icon />
                    </span>
                    <span className={styles.processText}>{step}</span>
                  </li>
                )
              })}
            </ol>
          </section>

          <section className={styles.cta} aria-labelledby="careers-cta">
            <div className={styles.ctaCard}>
              <div>
                <h2 id="careers-cta" className={styles.ctaTitle}>
                  {data.ctaTitle}
                </h2>
                <p className={styles.ctaText}>{data.ctaDesc}</p>
              </div>
              <a className={styles.ctaButton} href={`mailto:${data.email}`}>
                <span>{data.ctaButton}</span>
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </section>
        </div>
      </section>

      {openRole && (
        <div
          className={styles.dialogOverlay}
          role="presentation"
          onClick={closeDialog}
          data-reveal-skip
        >
          <div
            className={styles.dialog}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="careers-dialog-title"
            aria-describedby="careers-dialog-text"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.dialogClose}
              ref={closeRef}
              onClick={closeDialog}
              aria-label={data.formClose}
            >
              ×
            </button>

            {!submitted ? (
              <>
                <div className={styles.dialogHeader}>
                  <div className={styles.dialogHeading}>
                    <h2 id="careers-dialog-title" className={styles.dialogTitle}>
                      {data.dialogTitle}
                    </h2>
                    <p id="careers-dialog-text" className={styles.dialogIntro}>
                      {data.dialogIntro}
                    </p>
                  </div>
                  <div className={styles.dialogRole}>
                    <span className={styles.dialogRolePill}>{openRole.title}</span>
                  </div>
                </div>

                <form
                  className={styles.form}
                  onSubmit={async (event) => {
                    event.preventDefault()
                    if (submitting) return

                    setSubmitting(true)
                    setSubmitError(null)

                    try {
                      const res = await fetch('/api/careers/applications', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          jobId: openRole?.id ?? null,
                          jobTitle: openRole?.title ?? '',
                          fullName: formName,
                          email: formEmail,
                          phone: formPhone,
                        }),
                      })
                      if (!res.ok) {
                        const json = await res.json().catch(() => null)
                        setSubmitError((json as any)?.error ?? 'Failed to submit.')
                        setSubmitting(false)
                        return
                      }
                      setSubmitting(false)
                      setSubmitted(true)
                    } catch {
                      setSubmitError('Failed to submit.')
                      setSubmitting(false)
                    }
                  }}
                >
                  {submitError && (
                    <p className={styles.dialogIntro} style={{ color: 'rgba(248,113,113,0.95)' }}>
                      {submitError}
                    </p>
                  )}
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>
                      <User aria-hidden="true" />
                      {data.formName}
                    </span>
                    <input
                      ref={nameRef}
                      className={styles.input}
                      value={formName}
                      onChange={(event) => setFormName(event.target.value)}
                      required
                      autoComplete="name"
                    />
                  </label>

                  <div className={styles.fieldsRow}>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>
                        <Mail aria-hidden="true" />
                        {data.formEmail}
                      </span>
                      <input
                        className={styles.input}
                        type="email"
                        inputMode="email"
                        value={formEmail}
                        onChange={(event) => setFormEmail(event.target.value)}
                        required
                        autoComplete="email"
                      />
                    </label>

                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>
                        <Phone aria-hidden="true" />
                        {data.formPhone}
                      </span>
                      <input
                        className={styles.input}
                        type="tel"
                        inputMode="tel"
                        value={formPhone}
                        onChange={(event) => setFormPhone(event.target.value)}
                        required
                        autoComplete="tel"
                      />
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>
                      <HardHat aria-hidden="true" />
                      {data.formRole}
                    </span>
                    <input className={styles.input} readOnly value={openRole.title} />
                  </label>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitting}
                  >
                    {submitting ? data.formSubmitting : data.formSubmit}
                    <span className={styles.submitIcon} aria-hidden="true">
                      <ArrowRight />
                    </span>
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.success}>
                <div className={styles.successIcon} aria-hidden="true">
                  <CheckCircle2 />
                </div>
                <h2 id="careers-dialog-title" className={styles.successTitle}>
                  {data.successTitle}
                </h2>
                <p id="careers-dialog-text" className={styles.successText}>
                  {data.successText}
                </p>
                <button
                  type="button"
                  className={styles.successButton}
                  onClick={closeDialog}
                  ref={successCloseRef}
                >
                  {data.successClose}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}

export default function Careers() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className={styles.page}>
        <Header />
      </main>
    )
  }

  return <CareersContent />
}
