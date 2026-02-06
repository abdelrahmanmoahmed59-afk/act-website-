import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'News',
  description: 'Updates and project milestones from ACT.',
}

export default function NewsLayout({ children }: { children: ReactNode }) {
  return children
}

