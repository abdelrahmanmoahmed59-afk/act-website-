import 'server-only'

import { z } from 'zod'

import type { Language } from '@/lib/i18n/base-translations'
import { blogTemplatePosts, blogTemplateSettings } from '@/lib/content/blog-template'
import { readOrInitJsonFile, withFileLock, writeJsonFile } from '@/lib/server/file-store'
import type { BlogPostInput, BlogSettingsInput } from '@/lib/validation/blog'

export type BlogSettingsI18n = BlogSettingsInput

export type BlogPostI18n = BlogPostInput & {
  id: number
  imageUrl: string
}

export type LocalizedBlogPost = {
  id: number
  slug: string
  sortOrder: number
  published: boolean
  isFeatured: boolean
  title: string
  dateLabel: string
  category: string
  readTime: string
  summary: string
  content: string
  highlights: string[]
  imageUploadId: number | null
  imageUrl: string
}

type BlogStore = {
  settings: BlogSettingsI18n
  posts: BlogPostI18n[]
  nextId: number
  updatedAt: string
}

const STORE_PATH = 'content/blog.json'
const stringList = z.array(z.string()).default([])

function initStore(): BlogStore {
  const posts: BlogPostI18n[] = blogTemplatePosts.map((seed, index) => {
    const id = index + 1
    const imageUploadId = seed.imageUploadId ?? null
    return {
      id,
      ...seed,
      highlights: {
        en: stringList.parse(seed.highlights?.en),
        ar: stringList.parse(seed.highlights?.ar),
      },
      imageUploadId,
      imageUrl: imageUploadId ? `/api/uploads/${imageUploadId}` : '/placeholder.jpg',
    }
  })

  return {
    settings: blogTemplateSettings,
    posts,
    nextId: posts.length + 1,
    updatedAt: new Date().toISOString(),
  }
}

async function readStore() {
  return readOrInitJsonFile<BlogStore>(STORE_PATH, initStore)
}

function sortPosts(posts: BlogPostI18n[]) {
  return [...posts].sort((a, b) => (a.sortOrder - b.sortOrder) || (b.id - a.id))
}

function assertUniqueSlug(posts: BlogPostI18n[], slug: string, excludeId?: number) {
  const wanted = slug.trim()
  if (!wanted) throw new Error('Slug is required')
  const duplicate = posts.find((p) => p.slug === wanted && (excludeId ? p.id !== excludeId : true))
  if (duplicate) throw new Error('Slug already exists')
}

export function localizeBlogPost(post: BlogPostI18n, lang: Language): LocalizedBlogPost {
  return {
    id: post.id,
    slug: post.slug,
    sortOrder: post.sortOrder,
    published: post.published,
    isFeatured: post.isFeatured,
    title: post.title[lang],
    dateLabel: post.dateLabel[lang],
    category: post.category[lang],
    readTime: post.readTime[lang],
    summary: post.summary[lang],
    content: post.content[lang],
    highlights: post.highlights[lang] ?? [],
    imageUploadId: post.imageUploadId ?? null,
    imageUrl: post.imageUrl,
  }
}

export function localizeBlogSettings(settings: BlogSettingsI18n, lang: Language) {
  return {
    eyebrow: settings.eyebrow[lang],
    title: settings.title[lang],
    subtitle: settings.subtitle[lang],
    intro: settings.intro[lang],
  }
}

export async function getBlogSettings(): Promise<BlogSettingsI18n | null> {
  const store = await readStore()
  return store.settings ?? null
}

export async function upsertBlogSettings(settings: BlogSettingsI18n): Promise<BlogSettingsI18n> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const next: BlogStore = { ...store, settings, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return next.settings
  })
}

export async function listBlogPosts(opts?: { publishedOnly?: boolean; limit?: number }): Promise<BlogPostI18n[]> {
  const store = await readStore()
  const publishedOnly = opts?.publishedOnly ?? true
  const limit = typeof opts?.limit === 'number' ? Math.max(1, Math.min(200, opts.limit)) : null
  const posts = sortPosts(store.posts ?? []).filter((p) => (publishedOnly ? p.published : true))
  return typeof limit === 'number' ? posts.slice(0, limit) : posts
}

export async function getBlogPostBySlug(slug: string, opts?: { publishedOnly?: boolean }): Promise<BlogPostI18n | null> {
  const store = await readStore()
  const publishedOnly = opts?.publishedOnly ?? true
  const wanted = slug.trim()
  if (!wanted) return null
  const post = store.posts.find((p) => p.slug === wanted) ?? null
  if (!post) return null
  if (publishedOnly && !post.published) return null
  return post
}

export async function getBlogPostById(id: number): Promise<BlogPostI18n | null> {
  const store = await readStore()
  return store.posts.find((p) => p.id === id) ?? null
}

export async function createBlogPost(input: BlogPostInput): Promise<BlogPostI18n> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    assertUniqueSlug(store.posts, input.slug)
    const id = Math.max(1, Math.floor(store.nextId || 1))
    const imageUploadId = input.imageUploadId ?? null
    const created: BlogPostI18n = {
      id,
      ...input,
      highlights: {
        en: stringList.parse(input.highlights?.en),
        ar: stringList.parse(input.highlights?.ar),
      },
      imageUploadId,
      imageUrl: imageUploadId ? `/api/uploads/${imageUploadId}` : '/placeholder.jpg',
    }

    const next: BlogStore = {
      ...store,
      posts: [...store.posts, created],
      nextId: id + 1,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(STORE_PATH, next)
    return created
  })
}

export async function updateBlogPost(id: number, input: BlogPostInput): Promise<BlogPostI18n | null> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const index = store.posts.findIndex((p) => p.id === id)
    if (index < 0) return null
    assertUniqueSlug(store.posts, input.slug, id)
    const imageUploadId = input.imageUploadId ?? null
    const updated: BlogPostI18n = {
      id,
      ...input,
      highlights: {
        en: stringList.parse(input.highlights?.en),
        ar: stringList.parse(input.highlights?.ar),
      },
      imageUploadId,
      imageUrl: imageUploadId ? `/api/uploads/${imageUploadId}` : '/placeholder.jpg',
    }
    const posts = [...store.posts]
    posts[index] = updated
    const next: BlogStore = { ...store, posts, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return updated
  })
}

export async function deleteBlogPost(id: number): Promise<boolean> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const before = store.posts.length
    const posts = store.posts.filter((p) => p.id !== id)
    const deleted = posts.length !== before
    const next: BlogStore = { ...store, posts, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return deleted
  })
}
