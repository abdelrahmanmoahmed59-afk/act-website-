'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'

type AdminUser = {
  id: number
  email: string
  role: 'admin'
  createdAt: string
  updatedAt: string
}

function normalizeError(json: any) {
  const message = typeof json?.error === 'string' ? json.error : null
  if (message) return message
  return 'Request failed.'
}

export default function AdminAdminsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<AdminUser[]>([])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length >= 8 && confirmPassword.length >= 8
  }, [confirmPassword.length, email, password.length])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/admin/admin-users', { cache: 'no-store' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(normalizeError(json))
        setUsers([])
        return
      }
      setUsers(Array.isArray(json?.users) ? (json.users as AdminUser[]) : [])
    } catch {
      setError('Failed to load admin users.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  const onCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return

    setError(null)
    setSuccess(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(normalizeError(json))
        return
      }
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setSuccess('Admin user created.')
      await load()
    } catch {
      setError('Failed to create admin user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <h2 className={ui.sectionTitle}>Admin users</h2>
          <p className={ui.sectionHint}>Create additional accounts that can sign in to the dashboard.</p>
        </div>

        {error && <div className={ui.alert}>{error}</div>}
        {success && <div className={ui.success}>{success}</div>}

        <div className={ui.card}>
          <form className={ui.field} onSubmit={onCreate}>
            <div className={ui.gridTwo}>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="admin-create-email">
                  Email
                </label>
                <input
                  id="admin-create-email"
                  className={ui.input}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={ui.field}>
                <label className={ui.label} htmlFor="admin-create-password">
                  Password (min 8 chars)
                </label>
                <input
                  id="admin-create-password"
                  className={ui.input}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={ui.field}>
              <label className={ui.label} htmlFor="admin-create-confirm">
                Confirm password
              </label>
              <input
                id="admin-create-confirm"
                className={ui.input}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className={ui.toolbar}>
              <button
                type="submit"
                className={`${ui.button} ${ui.buttonPrimary}`}
                aria-disabled={submitting || !canSubmit ? 'true' : 'false'}
              >
                {submitting ? 'Creating…' : 'Create admin'}
              </button>
            </div>
          </form>
        </div>

        <div className={ui.card}>
          <div className={ui.sectionTitleRow} style={{ marginBottom: 12 }}>
            <p className={ui.sectionTitle} style={{ fontSize: '1.1rem' }}>
              Existing admins
            </p>
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              {loading ? 'Loading…' : `${users.length} user${users.length === 1 ? '' : 's'}`}
            </p>
          </div>

          {!loading && users.length === 0 && (
            <p style={{ margin: 0, color: 'rgba(226,232,240,0.75)' }}>
              No admin users found. Use the form above to create one.
            </p>
          )}

          {!loading && users.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {users.map((user) => (
                <li key={user.id} className={ui.sectionHint} style={{ margin: '8px 0', color: 'rgba(226,232,240,0.85)' }}>
                  <strong style={{ color: 'rgba(248,250,252,0.95)' }}>{user.email}</strong> <span style={{ opacity: 0.8 }}>· #{user.id}</span>{' '}
                  <span style={{ opacity: 0.75 }}>· {new Date(user.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

