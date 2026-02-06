import 'server-only'

import { countAdminUsers } from '@/lib/server/admin-users'
import { listBlogPosts, getBlogSettings } from '@/lib/server/blog'
import { getClientsSettings, getSuccessClientsSettings, listSuccessClientsLogos } from '@/lib/server/clients'
import { listContactSubmissions, getContactSettings } from '@/lib/server/contact'
import { listCareerApplications, listCareerJobs } from '@/lib/server/careers'
import { listMediaItems, getMediaSettings } from '@/lib/server/media'
import { listNewsItems, getNewsSettings } from '@/lib/server/news'
import { getPageContent } from '@/lib/server/pages'
import { listProjects, getProjectsSettings } from '@/lib/server/projects'
import { listQuotationSubmissions } from '@/lib/server/quotation'
import { ensureUploadsIndex } from '@/lib/server/uploads'

declare global {
  var __actEnsureJsonFiles: Promise<void> | undefined
}

export async function ensureJsonFiles() {
  if (!globalThis.__actEnsureJsonFiles) {
    globalThis.__actEnsureJsonFiles = (async () => {
      // Private stores
      await Promise.all([
        countAdminUsers(),
        ensureUploadsIndex(),
        listContactSubmissions({ limit: 1 }),
        listCareerApplications({ limit: 1 }),
        listQuotationSubmissions({ limit: 1 }),
      ])

      // Public/content stores
      await Promise.all([
        getNewsSettings(),
        listNewsItems(),
        getMediaSettings(),
        listMediaItems({ publishedOnly: false, limit: 1 }),
        getBlogSettings(),
        listBlogPosts({ publishedOnly: false, limit: 1 }),
        getProjectsSettings(),
        listProjects({ publishedOnly: false, limit: 1 }),
        getClientsSettings(),
        getSuccessClientsSettings(),
        listSuccessClientsLogos(),
        getContactSettings(),
        listCareerJobs({ publishedOnly: false }),
      ])

      // Managed pages content (bilingual content groups in one JSON store).
      await Promise.all([
        getPageContent('overview'),
        getPageContent('about'),
        getPageContent('services'),
        getPageContent('home'),
        getPageContent('get-quotation'),
      ])
    })()
  }

  await globalThis.__actEnsureJsonFiles
}
