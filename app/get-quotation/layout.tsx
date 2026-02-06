import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Get Quotation',
  description: 'Register your project details to receive a tailored quotation from ACT.',
}

export default function GetQuotationLayout({ children }: { children: ReactNode }) {
  return children
}

