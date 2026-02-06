'use client'

import React, { useEffect, useState } from "react"

import { useLanguage } from '@/providers/language-provider'
import styles from './services-section.module.css'

const servicesData = {
  en: [
    {
      id: 1,
      title: 'Commercial Construction',
      description: 'Large-scale commercial buildings with modern design and sustainable practices',
      icon: '🏢',
    },
    {
      id: 2,
      title: 'Residential Development',
      description: 'Quality residential complexes built with precision and attention to detail',
      icon: '🏠',
    },
    {
      id: 3,
      title: 'Infrastructure Projects',
      description: 'Government and infrastructure contracts for essential public services',
      icon: '🛣️',
    },
    {
      id: 4,
      title: 'Renovation Services',
      description: 'Complete restoration and modernization of existing structures',
      icon: '🔨',
    },
    {
      id: 5,
      title: 'Project Management',
      description: 'Expert oversight and coordination from concept to completion',
      icon: '📋',
    },
    {
      id: 6,
      title: 'Consulting Services',
      description: 'Professional guidance for construction and development projects',
      icon: '💼',
    },
  ],
  ar: [
    {
      id: 1,
      title: 'البناء التجاري',
      description: 'مباني تجارية كبيرة الحجم بتصميم حديث وممارسات مستدامة',
      icon: '🏢',
    },
    {
      id: 2,
      title: 'التطوير السكني',
      description: 'مجمعات سكنية عالية الجودة مع الدقة والاهتمام بالتفاصيل',
      icon: '🏠',
    },
    {
      id: 3,
      title: 'المشاريع الهندسية',
      description: 'العقود الحكومية والمشاريع الهندسية للخدمات العامة الأساسية',
      icon: '🛣️',
    },
    {
      id: 4,
      title: 'خدمات التجديد',
      description: 'الترميم الكامل والتحديث الحديث للهياكل الموجودة',
      icon: '🔨',
    },
    {
      id: 5,
      title: 'إدارة المشاريع',
      description: 'الإشراف والتنسيق الخبير من المفهوم إلى الإنجاز',
      icon: '📋',
    },
    {
      id: 6,
      title: 'خدمات الاستشارة',
      description: 'التوجيه المهني للمشاريع الإنشائية والتطويرية',
      icon: '💼',
    },
  ],
}

function ServicesContent() {
  const { language } = useLanguage()
  const services = servicesData[language as keyof typeof servicesData]

  return (
    <section className={styles.services}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Our Services</h2>
          <p className={styles.subtitle}>
            Comprehensive construction and contracting solutions
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((service, index) => (
            <div
              key={service.id}
              className={styles.card}
              style={{ '--card-index': index } as React.CSSProperties}
            >
              <div className={styles.cardContent}>
                <div className={styles.icon}>{service.icon}</div>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDescription}>{service.description}</p>
              </div>
              <div className={styles.cardBorder} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Services() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <section className={styles.services} />
  }

  return <ServicesContent />
}
