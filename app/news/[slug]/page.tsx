import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { getNewsItemBySlug, getNewsSettings } from '@/lib/server/news'
import { newsTemplateSettings } from '@/lib/content/news-template'
import NewsItemClient from './news-item-client'
import type { Language } from '@/lib/i18n/base-translations'
import styles from '../page.module.css'

export const runtime = 'nodejs'

type Params = { slug: string }

async function unwrapParams(params: Params | Promise<Params>) {
  return await params
}

function buildItemContent(input: {
  slug: string
  title: Record<Language, string>
  dateLabel: Record<Language, string>
  category: Record<Language, string>
  excerpt: Record<Language, string>
  imageUrl: string
}) {
  return input
}

export async function generateMetadata({ params }: { params: Params | Promise<Params> }): Promise<Metadata> {
  const { slug } = await unwrapParams(params)

  const item = await getNewsItemBySlug(slug)
  if (!item) {
    return { title: newsTemplateSettings.title.en }
  }

  const title = item.title.en || newsTemplateSettings.title.en
  const description = item.excerpt.en || newsTemplateSettings.intro.en
  const images = item.imageUrl ? [{ url: item.imageUrl }] : undefined

  return {
    title,
    description,
    openGraph: { title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
  }
}

export default async function NewsItemPage({ params }: { params: Params | Promise<Params> }) {
  const { slug } = await unwrapParams(params)

  const [item, settings] = await Promise.all([getNewsItemBySlug(slug), getNewsSettings()])
  if (!item) notFound()

  const fallbackTitle = settings?.title?.en || newsTemplateSettings.title.en

  return (
    <main className={styles.page}>
      <Header />
      <NewsItemClient
        item={buildItemContent({
          slug: item.slug ?? slug,
          title: item.title,
          dateLabel: item.dateLabel,
          category: item.category,
          excerpt: item.excerpt,
          imageUrl: item.imageUrl,
        })}
      />
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: item.title.en || fallbackTitle,
            image: item.imageUrl ? [item.imageUrl] : undefined,
            datePublished: new Date().toISOString(),
          }),
        }}
      />
    </main>
  )
}
