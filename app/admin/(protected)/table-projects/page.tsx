'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'

type LocalizedText = { en: string; ar: string }

type TableProjectRow = {
  id?: number
  delete?: boolean
  slug?: string
  sortOrder?: number
  published?: boolean
  showInMenu?: boolean
  year?: string
  title: LocalizedText
  client: LocalizedText
  location: LocalizedText
  projectType: LocalizedText
  cost: LocalizedText
  status: LocalizedText
}

function formatIssues(issues: unknown) {
  if (!Array.isArray(issues)) return null
  const lines = issues
    .map((issue) => {
      if (!issue || typeof issue !== 'object') return null
      const path = Array.isArray((issue as any).path) ? (issue as any).path.join('.') : ''
      const message = typeof (issue as any).message === 'string' ? (issue as any).message : 'Invalid value'
      return path ? `${path}: ${message}` : message
    })
    .filter(Boolean)
  return lines.length ? lines.join('\n') : null
}

function safeJsonParse(value: string) {
  try {
    return { ok: true as const, value: JSON.parse(value) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON'
    return { ok: false as const, error: message }
  }
}

export default function AdminTableProjects() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rawJson, setRawJson] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/table-projects', { cache: 'no-store' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const json = await res.json().catch(() => null)
      const rows = Array.isArray((json as any)?.rows) ? ((json as any).rows as TableProjectRow[]) : []
      setRawJson(JSON.stringify(rows, null, 2))
    } catch {
      setError('Failed to load table projects.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  const parsedRows = useMemo(() => {
    const parsed = safeJsonParse(rawJson)
    if (!parsed.ok) return { ok: false as const, count: 0, deletes: 0 }
    if (!Array.isArray(parsed.value)) return { ok: false as const, count: 0, deletes: 0 }
    const deletes = parsed.value.filter((row) => row && typeof row === 'object' && (row as any).delete === true).length
    return { ok: true as const, count: parsed.value.length, deletes }
  }, [rawJson])

  const formatJson = () => {
    setError(null)
    setSuccess(null)
    const parsed = safeJsonParse(rawJson)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }
    setRawJson(JSON.stringify(parsed.value, null, 2))
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    const parsed = safeJsonParse(rawJson)
    if (!parsed.ok) {
      setError(parsed.error)
      setSaving(false)
      return
    }

    if (!Array.isArray(parsed.value)) {
      setError('JSON must be an array of rows.')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/admin/table-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsed.value }),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const formatted = formatIssues((json as any)?.issues)
        setError(formatted ? `${(json as any)?.error ?? 'Invalid payload'}\n${formatted}` : (json as any)?.error ?? 'Failed to save.')
        return
      }

      const created = Number((json as any)?.created ?? 0)
      const updated = Number((json as any)?.updated ?? 0)
      const deleted = Number((json as any)?.deleted ?? 0)
      const skipped = Number((json as any)?.skipped ?? 0)
      const errors = Array.isArray((json as any)?.errors) ? ((json as any).errors as string[]) : []

      const parts = [`Saved.`]
      parts.push(`Created: ${created}. Updated: ${updated}. Deleted: ${deleted}.`)
      if (skipped) parts.push(`Skipped: ${skipped}.`)
      if (errors.length) parts.push(`Errors:\n${errors.join('\n')}`)
      setSuccess(parts.join(' '))
      await load()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className={ui.section} aria-label="Table Projects">
      <div className={ui.sectionTitleRow}>
        <div>
          <h2 className={ui.sectionTitle}>Table Projects</h2>
          <p className={ui.sectionHint}>
            This JSON powers the projects table on the public Projects page. Edit the rows, then Save. To delete a row, set
            <code style={{ marginInline: 6 }}>`delete: true`</code>
            and keep its <code style={{ marginInline: 6 }}>`id`</code>.
          </p>
        </div>
        <div className={ui.toolbar}>
          <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={load} disabled={loading || saving}>
            Reload
          </button>
          <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={formatJson} disabled={loading || saving}>
            Format
          </button>
          <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={save} disabled={loading || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && <div className={ui.alert}>{error}</div>}
      {success && <div className={ui.success}>{success}</div>}

      <div className={ui.card}>
        <p className={ui.sectionHint} style={{ marginTop: 0 }}>
          {loading ? 'Loading…' : parsedRows.ok ? `Rows: ${parsedRows.count}${parsedRows.deletes ? ` (deletes: ${parsedRows.deletes})` : ''}` : 'Invalid JSON'}
        </p>
        <textarea
          className={ui.textarea}
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          spellCheck={false}
          style={{ minHeight: 520, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}
          aria-label="Table projects JSON"
        />
      </div>
    </section>
  )
}

