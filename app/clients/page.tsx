import React from 'react'
import type { Metadata } from 'next'

import Header from '@/components/header'
import Footer from '@/components/footer'
import ClientsClient from './clients-client'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Clients',
  description: 'Clients and success stories managed from the admin dashboard.',
}

export default function ClientsPage() {
  return (
    <main className={styles.page}>
      <Header />
      <ClientsClient />
      <Footer />
    </main>
  )
}

