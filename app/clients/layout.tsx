import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Clients',
  description: 'Client sectors and partnerships across Kuwait.',
}

export default function ClientsLayout({ children }: { children: ReactNode }) {
  return children
}

