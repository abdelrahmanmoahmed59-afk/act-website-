import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { requireAdmin } from '@/lib/server/auth'
import { ensureJsonFiles } from '@/lib/server/ensure-json-files'
import AdminShell from './admin-shell'

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) redirect('/admin/login')

  // Ensure all JSON stores exist on disk (so the dashboard can edit every page/section).
  await ensureJsonFiles()

  const navItems = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/pages', label: 'Pages' },
    { href: '/admin/clients', label: 'Clients' },
    { href: '/admin/projects', label: 'Projects' },
    { href: '/admin/table-projects', label: 'Table Projects' },
    { href: '/admin/careers', label: 'Careers' },
    { href: '/admin/contact', label: 'Contact' },
    { href: '/admin/quotation', label: 'Quotation' },
    { href: '/admin/admins', label: 'Admins' },
  ]

  return (
    <AdminShell admin={admin} navItems={navItems}>
      {children}
    </AdminShell>
  )
}
