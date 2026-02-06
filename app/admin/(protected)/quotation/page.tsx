'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'

type Submission = {
  id: number
  fullName: string
  company: string
  email: string
  phone: string
  location: string
  scope: string
  sector: string
  areaSqm: string
  complexity: string
  timeline: string
  details: string
  contactMethod: string
  consent: boolean
  createdAt: string
}

export default function AdminQuotationPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/quotation/submissions?limit=200', { cache: 'no-store' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const json = await res.json().catch(() => null)
      setSubmissions(Array.isArray((json as any)?.submissions) ? ((json as any).submissions as Submission[]) : [])
    } catch {
      setError('Failed to load.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const meta = useMemo(() => ({ count: submissions.length }), [submissions.length])

  return (
    <div>
      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Get Quotation</h2>
            <p className={ui.sectionHint}>Review quote requests submitted from the public form.</p>
          </div>
          <div className={ui.toolbar}>
            <button type="button" className={ui.button} onClick={loadAll} aria-disabled={loading ? 'true' : 'false'}>
              Refresh
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

        <div className={ui.items}>
          {submissions.length === 0 && <div className={ui.card}>No submissions yet.</div>}
          {submissions.map((s) => (
            <div key={s.id} className={ui.card}>
              <p className={ui.itemTitle} style={{ margin: 0 }}>
                {s.fullName} {s.company ? `· ${s.company}` : ''} · {s.email}
              </p>
              <p className={ui.itemMeta} style={{ marginTop: 6 }}>
                #{s.id} · {new Date(s.createdAt).toLocaleString()} · Consent: {s.consent ? 'Yes' : 'No'}
              </p>
              <div className={ui.gridTwoWide} style={{ marginTop: 12 }}>
                <div>
                  <p className={ui.sectionHint} style={{ margin: 0 }}>
                    Phone: {s.phone || '—'}
                  </p>
                  <p className={ui.sectionHint} style={{ margin: 0 }}>
                    Location: {s.location}
                  </p>
                  <p className={ui.sectionHint} style={{ margin: 0 }}>
                    Contact method: {s.contactMethod}
                  </p>
                </div>
                <div>
                  <p className={ui.sectionHint} style={{ margin: 0 }}>
                    Scope: {s.scope}
                  </p>
                  <p className={ui.sectionHint} style={{ margin: 0 }}>
                    Sector: {s.sector}
                  </p>
                  <p className={ui.sectionHint} style={{ margin: 0 }}>
                    Area: {s.areaSqm} · Complexity: {s.complexity || '—'} · Timeline: {s.timeline || '—'}
                  </p>
                </div>
              </div>

              {s.details && (
                <p className={ui.sectionHint} style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
                  {s.details}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className={ui.hint} style={{ marginTop: 12 }}>
          Showing latest {meta.count} submissions.
        </p>
      </section>
    </div>
  )
}

