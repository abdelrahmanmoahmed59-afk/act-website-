import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Overview',
  description: 'Contracting capabilities and delivery approach across Kuwait.',
}

export default function OverviewLayout({ children }: { children: ReactNode }) {
  return children
}

