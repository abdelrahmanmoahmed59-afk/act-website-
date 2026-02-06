'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useLanguage } from '@/providers/language-provider'
import type { LocalizedProject } from '@/lib/projects'
import { getLocalizedProjects } from '@/lib/projects'
import styles from './page.module.css'

type Scope =
  | ''
  | 'general-contracting'
  | 'civil-works'
  | 'mep'
  | 'fit-out'
  | 'maintenance'

type Sector = '' | 'infrastructure' | 'industrial' | 'healthcare' | 'commercial' | 'residential'
type Complexity = '' | 'standard' | 'high' | 'urgent'
type ContactMethod = 'email' | 'phone'

type QuotationFormData = {
  fullName: string
  company: string
  email: string
  phone: string
  location: string
  scope: Scope
  sector: Sector
  areaSqm: string
  complexity: Complexity
  timeline: string
  details: string
  contactMethod: ContactMethod
  consent: boolean
}

type QuoteResult = {
  id: string
  currency: 'KWD'
  estimate: number
  low: number
  high: number
  ratePerSqm: number
  assumptions: string[]
}

const defaultFormData: QuotationFormData = {
  fullName: '',
  company: '',
  email: '',
  phone: '',
  location: '',
  scope: '',
  sector: '',
  areaSqm: '',
  complexity: 'standard',
  timeline: '',
  details: '',
  contactMethod: 'email',
  consent: false,
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function formatCurrency(amount: number, language: string) {
  const locale = language === 'ar' ? 'ar-KW' : 'en-KW'
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'KWD',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `KWD ${Math.round(amount).toLocaleString()}`
  }
}

function computeQuote(formData: QuotationFormData): QuoteResult {
  const scopeRate: Record<Exclude<Scope, ''>, number> = {
    'general-contracting': 115,
    'civil-works': 85,
    mep: 70,
    'fit-out': 95,
    maintenance: 38,
  }

  const sectorMultiplier: Record<Exclude<Sector, ''>, number> = {
    infrastructure: 1.1,
    industrial: 1.15,
    healthcare: 1.25,
    commercial: 1.0,
    residential: 0.95,
  }

  const complexityMultiplier: Record<Exclude<Complexity, ''>, number> = {
    standard: 1.0,
    high: 1.2,
    urgent: 1.1,
  }

  const fallbackScope: Exclude<Scope, ''> = 'general-contracting'
  const fallbackSector: Exclude<Sector, ''> = 'commercial'

  const scope = (formData.scope || fallbackScope) as Exclude<Scope, ''>
  const sector = (formData.sector || fallbackSector) as Exclude<Sector, ''>
  const complexity = (formData.complexity || 'standard') as Exclude<Complexity, ''>

  const area = clampNumber(Number(formData.areaSqm || 0), 0, 1_000_000)
  const ratePerSqm = scopeRate[scope] * sectorMultiplier[sector] * complexityMultiplier[complexity]

  const base = Math.max(2500, area * ratePerSqm)
  const low = Math.round(base * 0.9)
  const high = Math.round(base * 1.15)
  const estimate = Math.round(base)

  const id = `ACT-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
    .toString()
    .slice(-4)}`

  return {
    id,
    currency: 'KWD',
    estimate,
    low,
    high,
    ratePerSqm: Math.round(ratePerSqm),
    assumptions: [
      'Estimate based on provided area, scope, sector, and complexity.',
      'Excludes government fees, permits, and VAT (if applicable).',
      'Final pricing confirmed after site visit / BOQ review.',
    ],
  }
}

function GetQuotationContent() {
  const { language } = useLanguage()

  const [formData, setFormData] = useState<QuotationFormData>(defaultFormData)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [successKey, setSuccessKey] = useState(0)
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const content = useMemo(
    () => ({
      en: {
        eyebrow: 'GET QUOTATION',
        title: 'Request Your Contracting Quote',
        intro: 'Get a fast, structured estimate for your contracting scope in minutes.',
        steps: [
          {
            title: 'Select Scope',
            desc: 'Choose contracting scope and sector.',
            icon: 'cube',
          },
          {
            title: 'Provide Details',
            desc: 'Share area, location, and requirements.',
            icon: 'chat',
          },
          {
            title: 'Technical Review',
            desc: 'We validate and align on assumptions.',
            icon: 'bolt',
          },
          {
            title: 'Receive Quote',
            desc: 'Get an estimate and next steps.',
            icon: 'check',
          },
        ],
        formTitle: 'Request Quotation',
        formNote: 'Fields marked with * are required.',
        fields: {
          fullName: 'Full Name *',
          email: 'Email *',
          phone: 'Phone',
          location: 'Project Location *',
          company: 'Company Name',
          scope: 'Contracting Scope *',
          sector: 'Sector *',
          areaSqm: 'Estimated Area (m²) *',
          complexity: 'Complexity',
          timeline: 'Target Timeline',
          details: 'Additional Notes',
          contactMethod: 'Preferred Contact Method',
          consent: 'I agree to be contacted by ACT regarding this quotation request. *',
          submit: 'Request Quotation',
          submitting: 'Submitting…',
          again: 'Request another quotation',
        },
        options: {
          scope: [
            { value: '', label: 'Select scope' },
            { value: 'general-contracting', label: 'General Contracting' },
            { value: 'civil-works', label: 'Civil Works' },
            { value: 'mep', label: 'MEP' },
            { value: 'fit-out', label: 'Fit-out' },
            { value: 'maintenance', label: 'Maintenance' },
          ],
          sector: [
            { value: '', label: 'Select sector' },
            { value: 'infrastructure', label: 'Infrastructure' },
            { value: 'industrial', label: 'Industrial' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'commercial', label: 'Commercial' },
            { value: 'residential', label: 'Residential' },
          ],
          complexity: [
            { value: 'standard', label: 'Standard' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ],
          contactMethod: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
          ],
        },
        whyTitle: 'Why Request a Quote?',
        whyItems: [
          {
            title: 'Scope-aligned estimate',
            desc: 'Structured pricing based on area, sector, and complexity.',
          },
          {
            title: 'Tender-ready breakdown',
            desc: 'Clear assumptions and next steps for your procurement team.',
          },
          {
            title: 'Engineering review',
            desc: 'Fast validation to reduce changes later.',
          },
          {
            title: 'Quick response',
            desc: 'Follow-up within 24–48 hours for confirmation.',
          },
        ],
        helpTitle: 'Need immediate assistance?',
        helpText: 'Contact our tender team directly at',
        helpEmail: 'tenders@actgroup.com.kw',
        successTitle: 'Registration successful',
        successText: 'Thanks for registering. We will contact you as soon as possible.',
        quoteTitle: 'Your Estimate',
        quoteLabel: 'Estimated Contract Value',
        quoteRange: 'Range',
        quoteRate: 'Rate',
        quoteRateUnit: 'KWD / m²',
        quoteId: 'Reference',
        assumptions: 'Assumptions',
        goContact: 'Contact',
        projectsTitle: 'Project Gallery',
        projectsIntro: 'A snapshot of recent deliveries and visual references from ACT.',
        projectsCta: 'Explore all projects',
      },
      ar: {
        eyebrow: 'طلب عرض سعر',
        title: 'اطلب عرض سعر للمقاولات',
        intro: 'احصل على تقدير مبدئي منظم لأعمال المقاولات خلال دقائق.',
        steps: [
          { title: 'تحديد النطاق', desc: 'اختر نطاق العمل والقطاع.', icon: 'cube' },
          { title: 'تزويد التفاصيل', desc: 'شارك المساحة والموقع والمتطلبات.', icon: 'chat' },
          { title: 'مراجعة فنية', desc: 'نراجع الافتراضات ونتأكد من التفاصيل.', icon: 'bolt' },
          { title: 'استلام العرض', desc: 'تحصل على التقدير والخطوات التالية.', icon: 'check' },
        ],
        formTitle: 'طلب عرض سعر',
        formNote: 'الحقول التي تحتوي على * مطلوبة.',
        fields: {
          fullName: 'الاسم الكامل *',
          email: 'البريد الإلكتروني *',
          phone: 'الهاتف',
          location: 'موقع المشروع *',
          company: 'اسم الشركة',
          scope: 'نطاق المقاولات *',
          sector: 'القطاع *',
          areaSqm: 'المساحة التقديرية (م²) *',
          complexity: 'التعقيد',
          timeline: 'الجدول الزمني',
          details: 'ملاحظات إضافية',
          contactMethod: 'وسيلة التواصل المفضلة',
          consent: 'أوافق على تواصل ACT معي بشأن طلب عرض السعر هذا. *',
          submit: 'طلب عرض سعر',
          submitting: 'جارٍ الإرسال…',
          again: 'طلب عرض سعر آخر',
        },
        options: {
          scope: [
            { value: '', label: 'اختر النطاق' },
            { value: 'general-contracting', label: 'مقاولات عامة' },
            { value: 'civil-works', label: 'أعمال مدنية' },
            { value: 'mep', label: 'أعمال MEP' },
            { value: 'fit-out', label: 'تشطيبات' },
            { value: 'maintenance', label: 'صيانة' },
          ],
          sector: [
            { value: '', label: 'اختر القطاع' },
            { value: 'infrastructure', label: 'بنية تحتية' },
            { value: 'industrial', label: 'صناعي' },
            { value: 'healthcare', label: 'رعاية صحية' },
            { value: 'commercial', label: 'تجاري' },
            { value: 'residential', label: 'سكني' },
          ],
          complexity: [
            { value: 'standard', label: 'عادي' },
            { value: 'high', label: 'مرتفع' },
            { value: 'urgent', label: 'عاجل' },
          ],
          contactMethod: [
            { value: 'email', label: 'البريد الإلكتروني' },
            { value: 'phone', label: 'الهاتف' },
          ],
        },
        whyTitle: 'لماذا تطلب عرض سعر؟',
        whyItems: [
          { title: 'تقدير حسب النطاق', desc: 'تسعير منظم بناءً على المساحة والقطاع والتعقيد.' },
          { title: 'جاهز للمناقصات', desc: 'افتراضات واضحة وخطوات تالية لفريق المشتريات.' },
          { title: 'مراجعة هندسية', desc: 'تحقق سريع لتقليل التغييرات لاحقًا.' },
          { title: 'استجابة سريعة', desc: 'متابعة خلال 24–48 ساعة للتأكيد.' },
        ],
        helpTitle: 'هل تحتاج مساعدة فورية؟',
        helpText: 'تواصل مع فريق المناقصات عبر',
        helpEmail: 'tenders@actgroup.com.kw',
        successTitle: 'تم التسجيل بنجاح',
        successText: 'شكرًا لتسجيلك. سنتواصل معك في أقرب وقت ممكن.',
        quoteTitle: 'تقديرك',
        quoteLabel: 'القيمة التقديرية للعقد',
        quoteRange: 'النطاق',
        quoteRate: 'السعر',
        quoteRateUnit: 'د.ك / م²',
        quoteId: 'المرجع',
        assumptions: 'الافتراضات',
        goContact: 'اتصل بنا',
        projectsTitle: 'معرض المشاريع',
        projectsIntro: 'نظرة سريعة على مرئيات ومراجع من مشاريعنا.',
        projectsCta: 'عرض جميع المشاريع',
      },
    }),
    []
  )

  const t = content[language as keyof typeof content]
  const [projects, setProjects] = useState<LocalizedProject[]>([])
  useEffect(() => {
    setProjects(getLocalizedProjects(language))
  }, [language])

  const featuredProjects = useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      const aHasImage = Boolean(a.images[0] && a.images[0] !== '/placeholder.jpg')
      const bHasImage = Boolean(b.images[0] && b.images[0] !== '/placeholder.jpg')
      if (aHasImage !== bHasImage) return aHasImage ? -1 : 1
      return a.id - b.id
    })
    return sorted.slice(0, 6)
  }, [projects])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return

    const result = computeQuote(formData)
    setSubmitting(true)
    setSubmitted(false)
    setSubmitError(null)

    try {
      const res = await fetch('/api/quotation/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          scope: formData.scope,
          sector: formData.sector,
          areaSqm: formData.areaSqm,
          complexity: formData.complexity,
          timeline: formData.timeline,
          details: formData.details,
          contactMethod: formData.contactMethod,
          consent: formData.consent,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setSubmitError((json as any)?.error ?? 'Failed to submit.')
      }
    } catch {
      setSubmitError('Failed to submit.')
    }

    setQuote(result)
    setSubmitting(false)
    setSubmitted(true)
    setSuccessKey((prev) => prev + 1)
  }

  const reset = () => {
    setFormData(defaultFormData)
    setQuote(null)
    setSubmitted(false)
    setSubmitting(false)
  }

  const StepIcon = ({ kind }: { kind: string }) => {
    if (kind === 'cube') {
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path
            d="M12 2l8 4.6v10.8L12 22l-8-4.6V6.6L12 2zm0 2.2L6 7l6 3.4L18 7l-6-2.8zm-6 5v6.9l5 2.9v-6.9L6 9.2zm13 0l-5 2.9v6.9l5-2.9V9.2z"
            fill="currentColor"
          />
        </svg>
      )
    }
    if (kind === 'chat') {
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path
            d="M4 4h16v11H7.2L4 18.2V4zm3 4h10v2H7V8zm0 4h7v2H7v-2z"
            fill="currentColor"
          />
        </svg>
      )
    }
    if (kind === 'bolt') {
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path
            d="M13 2L3 14h7l-1 8 12-14h-7l-1-6z"
            fill="currentColor"
          />
        </svg>
      )
    }
    return (
      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
        <path
          d="M9.5 16.2l-3.3-3.3L4.8 14.3l4.7 4.7L19.2 9.3l-1.4-1.4-8.3 8.3z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <main className={styles.page}>
      <Header />

      <section id="main-content" tabIndex={-1} className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>{t.eyebrow}</div>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.intro}</p>

          <div className={styles.steps} aria-label="Process">
            {t.steps.map((step, index) => (
              <div key={step.title} className={styles.step}>
                <div className={styles.stepIconWrap} aria-hidden="true">
                  <StepIcon kind={step.icon} />
                </div>
                <div className={styles.stepLine} aria-hidden="true" />
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <section className={styles.formCard} aria-label={t.formTitle}>
              <h2 className={styles.sectionTitle}>{t.formTitle}</h2>
              <p className={styles.sectionNote}>{t.formNote}</p>

              {submitError && (
                <p className={styles.sectionNote} style={{ color: 'rgba(248,113,113,0.95)', whiteSpace: 'pre-wrap' }}>
                  {submitError}
                </p>
              )}

              {submitted && quote ? (
                <div key={successKey} className={styles.successWrap} role="status" aria-live="polite">
                  <div className={styles.successBadge}>
                    <svg viewBox="0 0 64 64" role="presentation" focusable="false">
                      <circle className={styles.successCircle} cx="32" cy="32" r="26" />
                      <path className={styles.successCheck} d="M20 33.5l7.5 7.5L44 24.5" />
                    </svg>
                  </div>
                  <div className={styles.successTextBlock}>
                    <div className={styles.successTitle}>{t.successTitle}</div>
                    <div className={styles.successText}>{t.successText}</div>
                  </div>

                  <div className={styles.quoteCard} aria-label={t.quoteTitle}>
                    <div className={styles.quoteHeader}>
                      <div className={styles.quoteTitle}>{t.quoteTitle}</div>
                      <div className={styles.quoteId}>
                        <span className={styles.quoteIdLabel}>{t.quoteId}</span>
                        <span className={styles.quoteIdValue}>{quote.id}</span>
                      </div>
                    </div>

                    <div className={styles.quotePriceBlock}>
                      <div className={styles.quotePriceLabel}>{t.quoteLabel}</div>
                      <div className={styles.quotePrice}>
                        {formatCurrency(quote.estimate, language)}
                      </div>
                      <div className={styles.quoteMetaRow}>
                        <div className={styles.quoteMetaItem}>
                          <span className={styles.quoteMetaLabel}>{t.quoteRange}</span>
                          <span className={styles.quoteMetaValue}>
                            {formatCurrency(quote.low, language)} – {formatCurrency(quote.high, language)}
                          </span>
                        </div>
                        <div className={styles.quoteMetaItem}>
                          <span className={styles.quoteMetaLabel}>{t.quoteRate}</span>
                          <span className={styles.quoteMetaValue}>
                            {quote.ratePerSqm.toLocaleString()} {t.quoteRateUnit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.assumptions}>
                      <div className={styles.assumptionsTitle}>{t.assumptions}</div>
                      <ul className={styles.assumptionList}>
                        {quote.assumptions.map((line) => (
                          <li key={line} className={styles.assumptionItem}>
                            {language === 'ar'
                              ? line
                                  .replace('Estimate based on provided area, scope, sector, and complexity.', 'التقدير مبني على المساحة والنطاق والقطاع والتعقيد.')
                                  .replace('Excludes government fees, permits, and VAT (if applicable).', 'لا يشمل الرسوم الحكومية والتصاريح والضريبة (إن وجدت).')
                                  .replace('Final pricing confirmed after site visit / BOQ review.', 'يتم تأكيد السعر النهائي بعد زيارة الموقع/مراجعة جدول الكميات.')
                              : line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className={styles.successActions}>
                    <button type="button" className={styles.secondaryBtn} onClick={reset}>
                      {t.fields.again}
                    </button>
                    <Link href="/contact" className={styles.ghostLink}>
                      {t.goContact}
                    </Link>
                  </div>
                </div>
              ) : (
                <form className={styles.form} onSubmit={onSubmit}>
                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="fullName">
                        {t.fields.fullName}
                      </label>
                      <input
                        id="fullName"
                        className={styles.input}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="email">
                        {t.fields.email}
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={styles.input}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        autoComplete="email"
                        inputMode="email"
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="phone">
                        {t.fields.phone}
                      </label>
                      <input
                        id="phone"
                        className={styles.input}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        autoComplete="tel"
                        inputMode="tel"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="location">
                        {t.fields.location}
                      </label>
                      <input
                        id="location"
                        className={styles.input}
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        placeholder={language === 'ar' ? 'مثال: الشويخ، الكويت' : 'e.g., Shuwaikh, Kuwait'}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="company">
                      {t.fields.company}
                    </label>
                    <input
                      id="company"
                      className={styles.input}
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      autoComplete="organization"
                    />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="scope">
                        {t.fields.scope}
                      </label>
                      <select
                        id="scope"
                        className={styles.select}
                        value={formData.scope}
                        onChange={(e) => setFormData({ ...formData, scope: e.target.value as Scope })}
                        required
                      >
                        {t.options.scope.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="sector">
                        {t.fields.sector}
                      </label>
                      <select
                        id="sector"
                        className={styles.select}
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector })}
                        required
                      >
                        {t.options.sector.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="areaSqm">
                        {t.fields.areaSqm}
                      </label>
                      <input
                        id="areaSqm"
                        className={styles.input}
                        value={formData.areaSqm}
                        onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                        required
                        inputMode="numeric"
                        placeholder={language === 'ar' ? 'مثال: 1200' : 'e.g., 1200'}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="complexity">
                        {t.fields.complexity}
                      </label>
                      <select
                        id="complexity"
                        className={styles.select}
                        value={formData.complexity}
                        onChange={(e) =>
                          setFormData({ ...formData, complexity: e.target.value as Complexity })
                        }
                      >
                        {t.options.complexity.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="timeline">
                        {t.fields.timeline}
                      </label>
                      <input
                        id="timeline"
                        className={styles.input}
                        value={formData.timeline}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        placeholder={
                          language === 'ar' ? 'مثال: خلال 8 أسابيع' : 'e.g., within 8 weeks'
                        }
                      />
                    </div>
                    <fieldset className={styles.fieldset}>
                      <legend className={styles.legend}>{t.fields.contactMethod}</legend>
                      <div className={styles.radioRow}>
                        {t.options.contactMethod.map((opt) => (
                          <label key={opt.value} className={styles.radioLabel}>
                            <input
                              className={styles.radio}
                              type="radio"
                              name="contactMethod"
                              value={opt.value}
                              checked={formData.contactMethod === opt.value}
                              onChange={() =>
                                setFormData({ ...formData, contactMethod: opt.value as ContactMethod })
                              }
                            />
                            <span className={styles.radioText}>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="details">
                      {t.fields.details}
                    </label>
                    <textarea
                      id="details"
                      className={styles.textarea}
                      rows={5}
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      placeholder={
                        language === 'ar'
                          ? 'اذكر نطاق الأعمال، المتطلبات، وإي نقاط فنية.'
                          : 'Include scope notes, requirements, and any technical constraints.'
                      }
                    />
                  </div>

                  <label className={styles.consentRow}>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      required
                    />
                    <span className={styles.consentText}>{t.fields.consent}</span>
                  </label>

                  <button
                    className={`${styles.submitBtn} ${submitting ? styles.submitBtnBusy : ''}`}
                    type="submit"
                    disabled={submitting}
                  >
                    <span className={styles.submitText}>
                      {submitting ? t.fields.submitting : t.fields.submit}
                    </span>
                    <span className={styles.spinner} aria-hidden="true" />
                  </button>
                </form>
              )}
            </section>

            <aside className={styles.sideCard} aria-label={t.whyTitle}>
              <h2 className={styles.sectionTitle}>{t.whyTitle}</h2>
              <div className={styles.whyList}>
                {t.whyItems.map((item) => (
                  <div key={item.title} className={styles.whyItem}>
                    <div className={styles.whyIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                        <path
                          d="M9.5 16.2l-3.3-3.3L4.8 14.3l4.7 4.7L19.2 9.3l-1.4-1.4-8.3 8.3z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className={styles.whyTitle}>{item.title}</div>
                      <div className={styles.whyDesc}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.helpBox}>
                <div className={styles.helpTitle}>{t.helpTitle}</div>
                <div className={styles.helpText}>
                  {t.helpText}{' '}
                  <a className={styles.helpLink} href={`mailto:${t.helpEmail}`}>
                    {t.helpEmail}
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.projectsSection} aria-label={t.projectsTitle}>
        <div className={styles.container}>
          <header className={styles.projectsHeader}>
            <h2 className={styles.sectionTitleCentered}>{t.projectsTitle}</h2>
            <p className={styles.sectionNoteCentered}>{t.projectsIntro}</p>
          </header>

          <div className={styles.projectsGrid} role="list">
            {featuredProjects.map((project) => {
              const containsLogo = project.slug === 'national-orascom'
              return (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className={styles.projectCard}
                  role="listitem"
                  aria-label={project.title}
                >
                  <div className={styles.projectMedia} aria-hidden="true">
                    <Image
                      src={project.images[0]}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      className={`${styles.projectImage} ${containsLogo ? styles.projectImageContain : ''}`}
                    />
                    <div className={styles.projectMediaOverlay} aria-hidden="true" />
                    <span className={styles.projectChip}>{project.sector}</span>
                  </div>
                  <div className={styles.projectBody}>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <p className={styles.projectMeta}>
                      {project.location} • {project.year}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className={styles.projectsActions}>
            <Link href="/projects" className={styles.projectsCta}>
              {t.projectsCta}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function GetQuotation() {
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

  return <GetQuotationContent />
}
