import type { ProjectInput } from '@/lib/validation/projects'
import { projects as staticProjects } from '@/lib/projects'

export const projectsTemplateInputs: ProjectInput[] = staticProjects.map((p, index) => ({
  slug: p.slug,
  sortOrder: index,
  published: true,
  showInMenu: true,
  title: p.title,
  sector: p.sector,
  projectType: p.projectType,
  year: p.year,
  status: p.status,
  client: p.client,
  location: p.location,
  cost: p.cost,
  summary: p.summary,
  details: p.details,
  methodology: p.methodology,
  galleryUploadIds: [],
}))

