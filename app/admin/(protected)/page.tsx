import React from 'react'
import Link from 'next/link'

import ui from './admin-ui.module.css'

export default function AdminHomePage() {
  return (
    <div>
      <section className={ui.section}>
          <div className={ui.sectionTitleRow}>
            <h2 className={ui.sectionTitle}>Content areas</h2>
            <p className={ui.sectionHint}>Manage content stored in local JSON files.</p>
          </div>
        <div className={ui.card}>
          <div className={ui.toolbar} aria-label="Quick actions">
            <Link className={`${ui.button} ${ui.buttonPrimary}`} href="/admin/news">
              Manage News
            </Link>
            <Link className={ui.button} href="/admin/pages">
              Manage Pages
            </Link>
            <Link className={ui.button} href="/admin/clients">
              Manage Clients
            </Link>
            <Link className={ui.button} href="/admin/projects">
              Manage Projects
            </Link>
            <Link className={ui.button} href="/admin/blog">
              Manage Blog
            </Link>
            <Link className={ui.button} href="/admin/media">
              Manage Media
            </Link>
            <Link className={ui.button} href="/admin/careers">
              Manage Careers
            </Link>
            <Link className={ui.button} href="/admin/contact">
              Manage Contact
            </Link>
            <Link className={ui.button} href="/admin/quotation">
              Manage Quotation
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
