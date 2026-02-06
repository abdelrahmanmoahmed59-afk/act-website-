import 'server-only'

export function slugify(input: string) {
  const normalized = input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')

  const slug = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')

  return slug
}

export function withSlugSuffix(base: string, suffix: number, maxLen: number) {
  const cleanBase = base.slice(0, maxLen).replace(/-+$/g, '').replace(/^-+/g, '')
  if (suffix <= 0) return cleanBase
  const tail = `-${suffix}`
  const trimmed = cleanBase.slice(0, Math.max(1, maxLen - tail.length)).replace(/-+$/g, '')
  return `${trimmed}${tail}`
}

