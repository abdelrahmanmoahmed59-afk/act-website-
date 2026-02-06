'use client'

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'
import type { ManagedPageKey } from '@/lib/content/pages/templates'
import { pagesTemplates } from '@/lib/content/pages/templates'

type LocalizedText = { en: string; ar: string }

type PageContent = {
  en: Record<string, any>
  ar: Record<string, any>
}

const MANAGED_KEYS: ManagedPageKey[] = ['overview', 'about', 'services']

function toLocalized(content: PageContent, key: string): LocalizedText {
  return { en: String(content.en?.[key] ?? ''), ar: String(content.ar?.[key] ?? '') }
}

function setLocalized(content: PageContent, key: string, value: LocalizedText): PageContent {
  return {
    en: { ...(content.en ?? {}), [key]: value.en },
    ar: { ...(content.ar ?? {}), [key]: value.ar },
  }
}

export default function AdminPages() {
  const router = useRouter()
  const selectId = useId().replace(/:/g, '')

  const [pageKey, setPageKey] = useState<ManagedPageKey>('overview')
  const [content, setContent] = useState<PageContent>(pagesTemplates.overview)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingGroup, setSavingGroup] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const load = useCallback(
    async (key: ManagedPageKey) => {
      setLoading(true)
      setError(null)
      setSuccess(null)
      setFieldErrors({})
      try {
        const res = await fetch(`/api/admin/pages/${key}`, { cache: 'no-store' })
        if (res.status === 401) {
          router.replace('/admin/login')
          return
        }
        const json = await res.json().catch(() => null)
        const next = ((json as any)?.content ?? (pagesTemplates as any)[key] ?? { en: {}, ar: {} }) as PageContent
        setContent(next)
      } catch {
        setError('Failed to load.')
        setContent((pagesTemplates as any)[key] ?? { en: {}, ar: {} })
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  useEffect(() => {
    load(pageKey)
  }, [load, pageKey])

  const seed = async () => {
    setError(null)
    setSuccess(null)
    try {
      const template = (pagesTemplates as any)[pageKey] ?? { en: {}, ar: {} }
      const res = await fetch(`/api/admin/pages/${pageKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError((json as any)?.error ?? 'Failed to seed.')
        return
      }
      setSuccess('Seeded from template.')
      await load(pageKey)
    } catch {
      setError('Failed to seed.')
    }
  }

  const validateRequired = (pairs: ReadonlyArray<readonly [string, LocalizedText]>) => {
    const next: Record<string, string> = {}
    for (const [key, value] of pairs) {
      if (!value.en.trim()) next[`${key}.en`] = 'Required'
      if (!value.ar.trim()) next[`${key}.ar`] = 'Required'
    }
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const saveAll = async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    setFieldErrors({})
    try {
      const res = await fetch(`/api/admin/pages/${pageKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError((json as any)?.error ?? 'Failed to save.')
        return
      }
      setSuccess('Saved.')
      await load(pageKey)
    } catch {
      setError('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const saveGroup = async (groupId: string, keys: string[]) => {
    if (savingGroup) return
    setSavingGroup(groupId)
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    const requiredPairs = keys.map((k) => [k, toLocalized(content, k)] as const)
    if (!validateRequired(requiredPairs)) {
      setError('Please fix the highlighted fields.')
      setSavingGroup(null)
      return
    }

    const patch: PageContent = { en: {}, ar: {} }
    for (const key of keys) {
      patch.en[key] = String(content.en?.[key] ?? '')
      patch.ar[key] = String(content.ar?.[key] ?? '')
    }

    try {
      const res = await fetch(`/api/admin/pages/${pageKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError((json as any)?.error ?? 'Failed to save.')
        return
      }
      setSuccess('Saved.')
      await load(pageKey)
    } catch {
      setError('Failed to save.')
    } finally {
      setSavingGroup(null)
    }
  }

  const heroFields = useMemo(() => {
    if (pageKey === 'services') return ['title', 'intro']
    return ['title', 'subtitle', 'intro']
  }, [pageKey])

  const secondaryFields = useMemo(() => {
    if (pageKey === 'overview') return ['ctaTitle', 'ctaDesc', 'ctaButton']
    if (pageKey === 'services') return ['readyTitle', 'readyDesc', 'readyButton']
    return ['mission', 'missionDesc', 'vision', 'visionDesc']
  }, [pageKey])

  const secondaryLabel = useMemo(() => {
    if (pageKey === 'overview') return 'CTA'
    if (pageKey === 'services') return 'Ready section'
    return 'Mission & Vision'
  }, [pageKey])

  const field = (key: string) => toLocalized(content, key)
  const updateField = (key: string, value: LocalizedText) => setContent((p) => setLocalized(p, key, value))

  const TextField = ({ keyName, textarea }: { keyName: string; textarea?: boolean }) => {
    const value = field(keyName)
    const baseId = useId().replace(/:/g, '')
    const Input = textarea ? 'textarea' : 'input'
    const errEn = fieldErrors[`${keyName}.en`]
    const errAr = fieldErrors[`${keyName}.ar`]
    const errorStyle = (message?: string) => (message ? ({ borderColor: 'rgba(248,113,113,0.9)' } as const) : undefined)
    return (
      <div className={ui.field}>
        <p className={ui.label}>{keyName}</p>
        <div className={ui.gridTwo}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor={`${baseId}-en`}>
              English
            </label>
            <Input
              id={`${baseId}-en`}
              className={textarea ? ui.textarea : ui.input}
              value={value.en}
              onChange={(e) => updateField(keyName, { ...value, en: e.target.value })}
              aria-invalid={errEn ? 'true' : undefined}
              style={errorStyle(errEn)}
            />
            {errEn && (
              <p className={ui.hint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                {errEn}
              </p>
            )}
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor={`${baseId}-ar`}>
              العربية
            </label>
            <Input
              id={`${baseId}-ar`}
              dir="rtl"
              className={textarea ? ui.textarea : ui.input}
              value={value.ar}
              onChange={(e) => updateField(keyName, { ...value, ar: e.target.value })}
              aria-invalid={errAr ? 'true' : undefined}
              style={errorStyle(errAr)}
            />
            {errAr && (
              <p className={ui.hint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                {errAr}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Pages</h2>
            <p className={ui.sectionHint}>Edit static pages stored as JSON (EN/AR). Each section has its own Save button.</p>
          </div>
          <div className={ui.toolbar}>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={saveAll} aria-disabled={saving ? 'true' : 'false'}>
              {saving ? 'Saving...' : 'Save all'}
            </button>
            <button type="button" className={ui.button} onClick={seed}>
              Seed from Template
            </button>
          </div>
        </div>

        {error && (
          <div className={ui.card} style={{ borderColor: 'rgba(248,113,113,0.35)' }}>
            <p className={ui.sectionHint} style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'rgba(248,113,113,0.95)' }}>
              {error}
            </p>
          </div>
        )}
        {success && (
          <div className={ui.card} style={{ borderColor: 'rgba(34,197,94,0.35)' }}>
            <p className={ui.sectionHint} style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'rgba(34,197,94,0.95)' }}>
              {success}
            </p>
          </div>
        )}

        <div className={ui.card}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor={selectId}>
              Page
            </label>
            <select
              id={selectId}
              className={ui.input}
              value={pageKey}
              onChange={(e) => setPageKey(e.target.value as ManagedPageKey)}
              aria-disabled={loading ? 'true' : 'false'}
            >
              {MANAGED_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Hero</h2>
            <p className={ui.sectionHint}>Top-of-page copy.</p>
          </div>
          <div className={ui.toolbar}>
            <button
              type="button"
              className={`${ui.button} ${ui.buttonPrimary}`}
              onClick={() => saveGroup('hero', heroFields)}
              aria-disabled={savingGroup === 'hero' ? 'true' : 'false'}
            >
              {savingGroup === 'hero' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className={ui.card}>
          {heroFields.map((k) => (
            <TextField key={k} keyName={k} textarea={k.toLowerCase().includes('intro')} />
          ))}
        </div>
      </section>

      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>{secondaryLabel}</h2>
            <p className={ui.sectionHint}>Secondary copy group for this page.</p>
          </div>
          <div className={ui.toolbar}>
            <button
              type="button"
              className={`${ui.button} ${ui.buttonPrimary}`}
              onClick={() => saveGroup('secondary', secondaryFields)}
              aria-disabled={savingGroup === 'secondary' ? 'true' : 'false'}
            >
              {savingGroup === 'secondary' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className={ui.card}>
          {secondaryFields.map((k) => (
            <TextField key={k} keyName={k} textarea={k.toLowerCase().includes('desc')} />
          ))}
        </div>
      </section>
    </div>
  )
}
