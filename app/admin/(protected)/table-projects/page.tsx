'use client'

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'

type LocalizedText = { en: string; ar: string }

type TableProjectRow = {
  id?: number
  slug?: string
  sortOrder: number
  published: boolean
  showInMenu: boolean
  year?: string
  title: LocalizedText
  client: LocalizedText
  location: LocalizedText
  projectType: LocalizedText
  cost: LocalizedText
  status: LocalizedText
  _deleted?: boolean
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

function emptyLocalized(): LocalizedText {
  return { en: '', ar: '' }
}

function normalizeLocalized(value: unknown): LocalizedText {
  if (value && typeof value === 'object') {
    const v = value as any
    return { en: String(v.en ?? ''), ar: String(v.ar ?? '') }
  }
  return emptyLocalized()
}

function makeNewRow(): TableProjectRow {
  const year = String(new Date().getFullYear())
  return {
    slug: '',
    sortOrder: 0,
    published: true,
    showInMenu: true,
    year,
    title: emptyLocalized(),
    client: emptyLocalized(),
    location: emptyLocalized(),
    projectType: emptyLocalized(),
    cost: emptyLocalized(),
    status: emptyLocalized(),
  }
}

function LocalizedField({
  label,
  value,
  onChange,
  required,
  maxLength,
}: {
  label: string
  value: LocalizedText
  onChange: (next: LocalizedText) => void
  required?: boolean
  maxLength?: number
}) {
  const baseId = useId().replace(/:/g, '')
  return (
    <div className={ui.field}>
      <p className={ui.label}>{label}</p>
      <div className={ui.gridTwo}>
        <div className={ui.field}>
          <label className={ui.label} htmlFor={`${baseId}-en`}>
            English
          </label>
          <input
            id={`${baseId}-en`}
            className={ui.input}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            required={required}
            maxLength={maxLength}
          />
        </div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor={`${baseId}-ar`}>
            العربية
          </label>
          <input
            id={`${baseId}-ar`}
            dir="rtl"
            className={ui.input}
            value={value.ar}
            onChange={(e) => onChange({ ...value, ar: e.target.value })}
            required={required}
            maxLength={maxLength}
          />
        </div>
      </div>
    </div>
  )
}

export default function AdminTableProjects() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rows, setRows] = useState<TableProjectRow[]>([])
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
      const incoming = Array.isArray((json as any)?.rows) ? ((json as any).rows as any[]) : []
      const nextRows = incoming.map((row) => ({
        id: typeof row?.id === 'number' ? row.id : undefined,
        slug: String(row?.slug ?? ''),
        sortOrder: typeof row?.sortOrder === 'number' ? row.sortOrder : 0,
        published: Boolean(row?.published),
        showInMenu: Boolean(row?.showInMenu),
        year: String(row?.year ?? ''),
        title: normalizeLocalized(row?.title),
        client: normalizeLocalized(row?.client),
        location: normalizeLocalized(row?.location),
        projectType: normalizeLocalized(row?.projectType),
        cost: normalizeLocalized(row?.cost),
        status: normalizeLocalized(row?.status),
      })) as TableProjectRow[]
      setRows(nextRows)
    } catch {
      setError('Failed to load table projects.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  const meta = useMemo(() => {
    const total = rows.length
    const deleted = rows.filter((r) => r._deleted && r.id).length
    return { total, deleted }
  }, [rows])

  const addRow = () => {
    setError(null)
    setSuccess(null)
    setRows((prev) => [...prev, makeNewRow()])
  }

  const markDeleted = (index: number) => {
    setError(null)
    setSuccess(null)
    setRows((prev) => {
      const row = prev[index]
      if (!row) return prev
      if (!row.id) return prev.filter((_, i) => i !== index)
      return prev.map((r, i) => (i === index ? { ...r, _deleted: true } : r))
    })
  }

  const undoDeleted = (index: number) => {
    setError(null)
    setSuccess(null)
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, _deleted: false } : r)))
  }

  const sanitizeRow = (row: TableProjectRow) => {
    const payload: any = {
      ...(row.id ? { id: row.id } : null),
      sortOrder: Number(row.sortOrder ?? 0),
      published: Boolean(row.published),
      showInMenu: Boolean(row.showInMenu),
      title: { en: String(row.title.en ?? ''), ar: String(row.title.ar ?? '') },
      client: { en: String(row.client.en ?? ''), ar: String(row.client.ar ?? '') },
      location: { en: String(row.location.en ?? ''), ar: String(row.location.ar ?? '') },
      projectType: { en: String(row.projectType.en ?? ''), ar: String(row.projectType.ar ?? '') },
      cost: { en: String(row.cost.en ?? ''), ar: String(row.cost.ar ?? '') },
      status: { en: String(row.status.en ?? ''), ar: String(row.status.ar ?? '') },
    }

    const slug = row.slug?.trim() ?? ''
    if (slug) payload.slug = slug
    const year = row.year?.trim() ?? ''
    if (year) payload.year = year

    return payload
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const payloadRows: any[] = []
      for (const row of rows) {
        if (row._deleted && row.id) {
          payloadRows.push({ id: row.id, delete: true })
          continue
        }
        if (row._deleted) continue
        payloadRows.push(sanitizeRow(row))
      }

      const res = await fetch('/api/admin/table-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: payloadRows }),
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
            Edit the table rows using bilingual (English / Arabic) input fields. Changes update the same Projects data used by
            the cards on the public site.
          </p>
        </div>
        <div className={ui.toolbar}>
          <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={load} disabled={loading || saving}>
            Reload
          </button>
          <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={addRow} disabled={loading || saving}>
            Add row
          </button>
          <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={save} disabled={loading || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && <div className={ui.alert}>{error}</div>}
      {success && <div className={ui.success}>{success}</div>}

      {loading ? (
        <div className={ui.card}>
          <p className={ui.sectionHint} style={{ margin: 0 }}>
            Loading…
          </p>
        </div>
      ) : (
        <>
          <p className={ui.sectionHint} style={{ marginTop: 0 }}>
            Rows: {meta.total}
            {meta.deleted ? ` · Pending deletes: ${meta.deleted}` : ''}
          </p>

          <div className={ui.items}>
            {rows.length === 0 && <div className={ui.card}>No rows yet.</div>}
            {rows.map((row, index) => (
              <div
                key={row.id ? String(row.id) : `new-${index}`}
                className={ui.card}
                style={row._deleted ? ({ opacity: 0.55, borderColor: 'rgba(248,113,113,0.35)' } as const) : undefined}
              >
                <div className={ui.itemHeader}>
                  <div>
                    <h3 className={ui.itemTitle} style={{ marginBottom: 0 }}>
                      {row.title.en?.trim() ? row.title.en : row.title.ar?.trim() ? row.title.ar : 'New row'}{' '}
                      <span style={{ opacity: 0.6 }}>{row.id ? `#${row.id}` : '(new)'}</span>
                    </h3>
                    <p className={ui.itemMeta} style={{ marginTop: 6 }}>
                      Slug: <code>{row.slug?.trim() ? row.slug.trim() : 'auto'}</code> · Sort: {row.sortOrder} ·{' '}
                      {row.published ? 'Published' : 'Draft'} · {row.showInMenu ? 'In menu' : 'Not in menu'}
                    </p>
                  </div>

                  <div className={ui.itemActions}>
                    {row._deleted ? (
                      <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={() => undoDeleted(index)} disabled={saving}>
                        Undo
                      </button>
                    ) : (
                      <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => markDeleted(index)} disabled={saving}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div className={ui.gridTwoWide}>
                  <div className={ui.field}>
                    <label className={ui.label}>Slug (optional)</label>
                    <input
                      className={ui.input}
                      value={row.slug ?? ''}
                      onChange={(e) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, slug: e.target.value } : r)))}
                      placeholder="auto"
                      disabled={row._deleted}
                    />
                    <p className={ui.sectionHint} style={{ margin: 0 }}>
                      Leave empty to auto-generate from the English title (for new rows).
                    </p>
                  </div>
                  <div className={ui.field}>
                    <label className={ui.label}>Year</label>
                    <input
                      className={ui.input}
                      value={row.year ?? ''}
                      onChange={(e) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, year: e.target.value } : r)))}
                      placeholder="2026"
                      disabled={row._deleted}
                    />
                  </div>
                </div>

                <div className={ui.gridTwoWide}>
                  <div className={ui.field}>
                    <label className={ui.label}>Sort order</label>
                    <input
                      className={ui.input}
                      type="number"
                      value={row.sortOrder}
                      onChange={(e) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, sortOrder: Number(e.target.value) } : r)))}
                      disabled={row._deleted}
                    />
                  </div>
                  <div className={ui.field}>
                    <label className={ui.label}>Flags</label>
                    <div className={ui.toolbar} style={{ justifyContent: 'flex-start' }}>
                      <label className={ui.label}>
                        <input
                          type="checkbox"
                          checked={row.published}
                          onChange={(e) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, published: e.target.checked } : r)))}
                          disabled={row._deleted}
                        />{' '}
                        Published
                      </label>
                      <label className={ui.label}>
                        <input
                          type="checkbox"
                          checked={row.showInMenu}
                          onChange={(e) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, showInMenu: e.target.checked } : r)))}
                          disabled={row._deleted}
                        />{' '}
                        Show in menu
                      </label>
                    </div>
                  </div>
                </div>

                <LocalizedField
                  label="Name of project"
                  value={row.title}
                  onChange={(v) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, title: v } : r)))}
                  required
                  maxLength={200}
                />

                <div className={ui.gridTwoWide}>
                  <LocalizedField
                    label="Client"
                    value={row.client}
                    onChange={(v) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, client: v } : r)))}
                    required
                    maxLength={200}
                  />
                  <LocalizedField
                    label="Location"
                    value={row.location}
                    onChange={(v) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, location: v } : r)))}
                    required
                    maxLength={200}
                  />
                </div>

                <div className={ui.gridTwoWide}>
                  <LocalizedField
                    label="Type of work"
                    value={row.projectType}
                    onChange={(v) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, projectType: v } : r)))}
                    required
                    maxLength={200}
                  />
                  <LocalizedField
                    label="Amount (KD)"
                    value={row.cost}
                    onChange={(v) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, cost: v } : r)))}
                    required
                    maxLength={200}
                  />
                </div>

                <LocalizedField
                  label="Status"
                  value={row.status}
                  onChange={(v) => setRows((prev) => prev.map((r, i) => (i === index ? { ...r, status: v } : r)))}
                  required
                  maxLength={200}
                />
              </div>
            ))}
          </div>

          <div className={ui.toolbar} style={{ justifyContent: 'flex-end', marginTop: 14 }}>
            <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={addRow} disabled={saving}>
              Add row
            </button>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

