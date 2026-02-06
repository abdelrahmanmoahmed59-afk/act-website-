import React from 'react'
import type { Metadata } from 'next'

import Header from '@/components/header'
import Footer from '@/components/footer'
import NewsClient from './news-client'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'News',
  description: 'News updates managed from the admin dashboard.',
}

export default function NewsPage() {
  return (
    <main className={styles.page}>
      <Header />
      <NewsClient />
      <Footer />
    </main>
  )
}

