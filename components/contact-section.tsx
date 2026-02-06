'use client'

import React, { useEffect, useId, useMemo, useState } from 'react'
import { useLanguage } from '@/providers/language-provider'
import styles from '@/app/contact/page.module.css'

type LocalizedText = { en: string; ar: string }

type ContactSettings = {
  title: LocalizedText
  intro: LocalizedText
  emailText: string
  phoneNum: string
  address: LocalizedText
  mapSrc: string
}

type ContactSectionProps = {
  includeHero?: boolean
  includeMainContentId?: boolean
  titleAs?: 'h1' | 'h2'
}

function ContactSectionContent({
  includeHero,
  includeMainContentId,
  titleAs: TitleTag,
}: Required<ContactSectionProps>) {
  const { language } = useLanguage()
  const detailsInputId = useId()

  const [formData, setFormData] = useState({ name: '', email: '', details: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successKey, setSuccessKey] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [settings, setSettings] = useState<ContactSettings | null>(null)

  const content = {
    en: {
      title: 'Get In Touch',
      intro: 'Have a project in mind? Contact us today and our team will reach out.',
      contactTitle: 'Contact Details',
      mapTitle: 'Location Map',
      mapDesc: 'Find us and visit our office during business hours.',
      form: {
        title: 'Register your details',
        subtitle: "Share your information and we'll contact you as soon as possible.",
        name: 'Full Name',
        email: 'Email Address',
        details: 'Customer Details',
        submit: 'Submit',
        submitting: 'Submitting...',
        successTitle: 'Registration successful',
        successDesc: 'Thanks for registering. We will contact you as soon as possible.',
        again: 'Submit another',
      },
      contact: { email: 'Email', phone: 'Phone', address: 'Address' },
      info: {
        emailText: 'info@actgroup.com.kw',
        phoneNum: '+965 2246 8899',
        addressText: 'Shuwaikh, Kuwait',
      },
      helpText: 'Add a short summary of your request, scope, and timeline.',
    },
    ar: {
      title: 'اتصل بنا',
      intro: 'هل لديك مشروع؟ تواصل معنا اليوم وسنقوم بالرد عليك في أقرب وقت.',
      contactTitle: 'بيانات التواصل',
      mapTitle: 'خريطة الموقع',
      mapDesc: 'اعثر علينا وقم بزيارة مقر الشركة خلال ساعات العمل.',
      form: {
        title: 'سجّل بياناتك',
        subtitle: 'شارك معلوماتك وسنتواصل معك في أقرب وقت ممكن.',
        name: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        details: 'تفاصيل العميل',
        submit: 'إرسال',
        submitting: 'جارٍ الإرسال...',
        successTitle: 'تم التسجيل بنجاح',
        successDesc: 'شكرًا لتسجيلك. سنتواصل معك في أقرب وقت ممكن.',
        again: 'إرسال مرة أخرى',
      },
      contact: {
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        address: 'العنوان',
      },
      info: {
        emailText: 'info@actgroup.com.kw',
        phoneNum: '+965 2246 8899',
        addressText: 'الشويخ، الكويت',
      },
      helpText: 'اكتب ملخصًا عن طلبك، نطاق العمل، والجدول الزمني.',
    },
  }

  const data = content[language as keyof typeof content]

  const mapSrc = useMemo(() => {
    return 'https://www.google.com/maps?q=Shuwaikh%2C%20Kuwait&output=embed'
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/contact/settings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return
        const s = (json as any)?.settings
        if (s && typeof s === 'object') setSettings(s as ContactSettings)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const title = settings?.title?.[language as 'en' | 'ar'] || data.title
  const intro = settings?.intro?.[language as 'en' | 'ar'] || data.intro
  const emailText = settings?.emailText || data.info.emailText
  const phoneNum = settings?.phoneNum || data.info.phoneNum
  const addressText = settings?.address?.[language as 'en' | 'ar'] || data.info.addressText
  const resolvedMapSrc = settings?.mapSrc || mapSrc

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitError(null)

    setSubmitting(true)
    setSubmitted(false)

    try {
      const res = await fetch('/api/contact/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: formData.name, email: formData.email, details: formData.details }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setSubmitError((json as any)?.error ?? 'Failed to submit.')
        setSubmitting(false)
        return
      }
      setSubmitting(false)
      setSubmitted(true)
      setSuccessKey((prev) => prev + 1)
      setFormData({ name: '', email: '', details: '' })
    } catch {
      setSubmitError('Failed to submit.')
      setSubmitting(false)
    }
  }

  return (
    <>
      {includeHero ? (
        <section
          id={includeMainContentId ? 'main-content' : undefined}
          tabIndex={includeMainContentId ? -1 : undefined}
          className={styles.contactHero}
        >
          <div className={styles.container}>
            <TitleTag className={styles.title}>{title}</TitleTag>
            <p className={styles.intro}>{intro}</p>
          </div>
        </section>
      ) : null}

      <section className={styles.contactContent}>
        <div className={styles.container}>
          <div className={styles.layout}>
            <aside className={styles.sidebar} aria-label={data.contactTitle}>
              <div className={styles.detailsCard}>
                <div className={styles.detailsHeader}>
                  <h2 className={styles.sectionTitle}>{data.contactTitle}</h2>
                </div>
                <ul className={styles.detailList}>
                  <li className={styles.detailRow}>
                    <span className={styles.detailIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                        <path
                          d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm3 1h10l-5 4-5-4zm0 3.2V18h10v-7.8l-5 4-5-4z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    <div className={styles.detailBody}>
                      <div className={styles.detailLabel}>{data.contact.email}</div>
                      <a className={styles.detailValueLink} href={`mailto:${data.info.emailText}`}>
                        {emailText}
                      </a>
                    </div>
                  </li>

                  <li className={styles.detailRow}>
                    <span className={styles.detailIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                        <path
                          d="M6.6 10.8c1.4 2.7 3.9 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.7 3.8.7.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.5 21 3 13.5 3 4c0-.6.4-1 1-1h3.1c.6 0 1 .4 1 1 0 1.3.2 2.6.7 3.8.1.4 0 .8-.3 1.1l-2.2 2.9z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    <div className={styles.detailBody}>
                      <div className={styles.detailLabel}>{data.contact.phone}</div>
                      <a
                        className={styles.detailValueLink}
                        href={`tel:${phoneNum.replace(/\s+/g, '')}`}
                      >
                        {phoneNum}
                      </a>
                    </div>
                  </li>

                  <li className={styles.detailRow}>
                    <span className={styles.detailIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                        <path
                          d="M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7zm0 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    <div className={styles.detailBody}>
                      <div className={styles.detailLabel}>{data.contact.address}</div>
                      <div className={styles.detailValueText}>{addressText}</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className={styles.mapCard}>
                <div className={styles.mapHeader}>
                  <h2 className={styles.sectionTitle}>{data.mapTitle}</h2>
                  <p className={styles.sectionText}>{data.mapDesc}</p>
                </div>
                <div className={styles.mapFrameWrap}>
                  <iframe
                    className={styles.mapFrame}
                    title={data.mapTitle}
                    src={resolvedMapSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>
            </aside>

            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2 className={styles.sectionTitle}>{data.form.title}</h2>
                <p className={styles.sectionText}>{data.form.subtitle}</p>
              </div>

              {submitError && (
                <p className={styles.sectionText} style={{ color: 'rgba(248,113,113,0.95)' }}>
                  {submitError}
                </p>
              )}

              {submitted ? (
                <div key={successKey} className={styles.successCard} role="status" aria-live="polite">
                  <div className={styles.successIcon} aria-hidden="true">
                    <svg viewBox="0 0 64 64" role="presentation" focusable="false">
                      <circle className={styles.successCircle} cx="32" cy="32" r="26" />
                      <path className={styles.successCheck} d="M20 33.5l7.5 7.5L44 24.5" />
                    </svg>
                  </div>
                  <h3 className={styles.successTitle}>{data.form.successTitle}</h3>
                  <p className={styles.successText}>{data.form.successDesc}</p>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={() => setSubmitted(false)}
                  >
                    {data.form.again}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>
                      {data.form.name}
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder={data.form.name}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={styles.input}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                      {data.form.email}
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder={data.form.email}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={styles.input}
                      required
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor={detailsInputId} className={styles.label}>
                      {data.form.details}
                    </label>
                    <textarea
                      id={detailsInputId}
                      placeholder={data.form.details}
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      className={styles.textarea}
                      rows={6}
                      required
                    />
                    <p className={styles.helpText}>{data.helpText}</p>
                  </div>

                  <button
                    type="submit"
                    className={`${styles.submitBtn} ${submitting ? styles.submitBtnBusy : ''}`}
                    disabled={submitting}
                  >
                    <span className={styles.submitBtnText}>
                      {submitting ? data.form.submitting : data.form.submit}
                    </span>
                    <span className={styles.submitSpinner} aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default function ContactSection(props: ContactSectionProps) {
  const includeHero = props.includeHero ?? true
  const includeMainContentId = props.includeMainContentId ?? false
  const titleAs = props.titleAs ?? 'h2'

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return includeHero ? (
      <section className={styles.contactHero} />
    ) : (
      <section className={styles.contactContent} />
    )
  }

  return (
    <ContactSectionContent
      includeHero={includeHero}
      includeMainContentId={includeMainContentId}
      titleAs={titleAs}
    />
  )
}
