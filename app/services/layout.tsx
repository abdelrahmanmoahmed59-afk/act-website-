import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Construction and contracting services delivered by ACT.',
}

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return children
}

