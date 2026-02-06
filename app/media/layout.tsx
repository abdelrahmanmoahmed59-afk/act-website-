import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Media',
  description: 'Press highlights and project visuals from ACT.',
}

export default function MediaLayout({ children }: { children: ReactNode }) {
  return children
}

