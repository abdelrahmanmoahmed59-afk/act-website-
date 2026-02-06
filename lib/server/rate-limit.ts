import 'server-only'

type Bucket = { count: number; resetAtMs: number }

declare global {
  var __actRateLimitBuckets: Map<string, Bucket> | undefined
}

function getBuckets() {
  if (!globalThis.__actRateLimitBuckets) {
    globalThis.__actRateLimitBuckets = new Map<string, Bucket>()
  }
  return globalThis.__actRateLimitBuckets
}

export function getClientIp(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return (
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-client-ip') ||
    'unknown'
  )
}

export function rateLimit(input: {
  key: string
  limit: number
  windowMs: number
  nowMs?: number
}) {
  const now = input.nowMs ?? Date.now()
  const buckets = getBuckets()
  const bucket = buckets.get(input.key)

  if (!bucket || bucket.resetAtMs <= now) {
    const next: Bucket = { count: 1, resetAtMs: now + input.windowMs }
    buckets.set(input.key, next)
    return { ok: true as const, remaining: input.limit - 1, resetAtMs: next.resetAtMs }
  }

  if (bucket.count >= input.limit) {
    return { ok: false as const, remaining: 0, resetAtMs: bucket.resetAtMs }
  }

  bucket.count += 1
  buckets.set(input.key, bucket)
  return { ok: true as const, remaining: Math.max(0, input.limit - bucket.count), resetAtMs: bucket.resetAtMs }
}
