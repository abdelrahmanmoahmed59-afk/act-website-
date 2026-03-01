'use client'

import React, { useEffect, useState } from "react"
import { useLanguage } from '@/providers/language-provider'
import styles from './contact-us-section.module.css'

function ContactUsContent() {
  const { language } = useLanguage()
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  const content = {
    en: {
      title: "Get In Touch",
      subtitle: "We'd Love to Hear From You",
      description: "Have a question or ready to start your next project? Contact our team and let's build something great together.",
      formLabels: {
        name: "Full Name",
        email: "Email Address",
        subject: "Subject",
        message: "Message",
        submit: "Send Message"
      },
      contactInfo: [
        { icon: "📍", title: "Address", value: "Shuwaikh, Kuwait" },
        { icon: "📞", title: "Phone", value: "+965 9558 8251" },
        { icon: "✉️", title: "Email", value: "info@act-kw.com" }
      ]
    },
    ar: {
      title: "تواصل معنا",
      subtitle: "نود أن نسمع منك",
      description: "لديك سؤال أو تريد البدء بمشروعك التالي؟ تواصل مع فريقنا ودعنا نبني شيئاً رائعاً معاً.",
      formLabels: {
        name: "الاسم الكامل",
        email: "عنوان البريد الإلكتروني",
        subject: "الموضوع",
        message: "الرسالة",
        submit: "إرسال الرسالة"
      },
      contactInfo: [
        { icon: "📍", title: "العنوان", value: "الشويخ، الكويت" },
        { icon: "📞", title: "الهاتف", value: "+965 9558 8251" },
        { icon: "✉️", title: "البريد الإلكتروني", value: "info@act-kw.com" }
      ]
    }
  }

  const t = content[language as keyof typeof content]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <section className={styles.contactUs}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.subtitle}>{t.subtitle}</p>
          <p className={styles.description}>{t.description}</p>
        </div>

        <div className={styles.content}>
          <div className={styles.form}>
            <form onSubmit={handleSubmit} className={styles.formElement}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>{t.formLabels.name}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder={t.formLabels.name}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>{t.formLabels.email}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder={t.formLabels.email}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject" className={styles.label}>{t.formLabels.subject}</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder={t.formLabels.subject}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>{t.formLabels.message}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder={t.formLabels.message}
                  rows={5}
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                {t.formLabels.submit}
              </button>
            </form>
          </div>

          <div className={styles.info}>
            <div className={styles.infoCards}>
              {t.contactInfo.map((info, index) => (
                <div key={index} className={styles.infoCard}>
                  <div className={styles.infoIcon}>{info.icon}</div>
                  <div className={styles.infoContent}>
                    <h4 className={styles.infoTitle}>{info.title}</h4>
                    <p className={styles.infoValue}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.mapPlaceholder}>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="currentColor" opacity="0.1"/>
                <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.3"/>
                <text x="50" y="85" textAnchor="middle" fill="currentColor" opacity="0.4" fontSize="8">
                  Map Location
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bgAccent} />
    </section>
  )
}

export default function ContactUs() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <section className={styles.contactUs} />
  }

  return <ContactUsContent />
}
