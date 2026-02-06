import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected projects delivered across commercial, residential, and infrastructure sectors.',
}

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return children
}

