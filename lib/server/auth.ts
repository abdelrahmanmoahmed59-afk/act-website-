import 'server-only'

import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

import { getAdminUserById } from '@/lib/server/admin-users'

export type AdminSession = {
  userId: number
  email: string
  role: 'admin'
}

const SESSION_COOKIE = 'act_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

function getJwtIssuer() {
  return process.env.JWT_ISSUER || 'act-admin'
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

export async function signAdminSession(session: AdminSession) {
  const jwtSecret = getJwtSecret()
  const token = await new SignJWT({ role: session.role, email: session.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(getJwtIssuer())
    .setSubject(String(session.userId))
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS)
    .sign(jwtSecret)
  return token
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const jwtSecret = getJwtSecret()
    const { payload } = await jwtVerify(token, jwtSecret, { issuer: getJwtIssuer() })
    const userId = Number(payload.sub)
    if (!userId || Number.isNaN(userId)) return null
    const role = payload.role
    const email = payload.email
    if (role !== 'admin') return null
    if (typeof email !== 'string' || !email) return null
    return { userId, role: 'admin', email }
  } catch {
    return null
  }
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await verifyAdminSession(token)
  if (!session) return null

  const user = await getAdminUserById(session.userId)
  if (!user) return null
  if (user.role !== 'admin') return null
  if (user.email !== session.email) return null

  return session
}

export async function requireAdmin(): Promise<AdminSession | null> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'admin') return null
  return admin
}

export function getSessionCookieName() {
  return SESSION_COOKIE
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  }
}
