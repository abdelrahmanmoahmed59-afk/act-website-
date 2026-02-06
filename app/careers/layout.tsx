import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join ACT teams and build the future of Kuwait.',
}

export default function CareersLayout({ children }: { children: ReactNode }) {
  return children
}

