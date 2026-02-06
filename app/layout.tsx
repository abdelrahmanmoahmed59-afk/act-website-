import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { LanguageProvider } from '@/providers/language-provider'
import LoadingScreen from '@/components/loading-screen'
import ScrollReveal from '@/components/scroll-reveal'
import ScrollToTop from '@/components/scroll-to-top'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'ACT | Advanced Combined Group',
    template: '%s | ACT',
  },
  description: 'Leading construction and contracting services in Kuwait',
  generator: 'v0.app',
  openGraph: {
    title: 'ACT | Advanced Combined Group',
    description: 'Leading construction and contracting services in Kuwait',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACT | Advanced Combined Group',
    description: 'Leading construction and contracting services in Kuwait',
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      },
      {
        url: '/icon-light-32x32.png',
        type: 'image/png',
        sizes: '32x32',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        type: 'image/png',
        sizes: '32x32',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        type: 'image/png',
        sizes: '180x180',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('act-theme') === 'dark' ||
                  (!localStorage.getItem('act-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }

                const storedLanguage = localStorage.getItem('act-language');
                const lang = storedLanguage === 'ar' ? 'ar' : 'en';
                document.documentElement.lang = lang;
                document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>
          <LanguageProvider>
            <LoadingScreen />
            <ScrollReveal />
            <ScrollToTop />
            {children}
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
