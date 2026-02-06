import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact ACT to discuss your construction needs.',
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}

