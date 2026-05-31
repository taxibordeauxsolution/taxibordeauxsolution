import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET non configuré en variable d\'environnement')
  return secret
}

export function verifyAdmin(req: NextRequest): boolean {
  const secret = process.env.JWT_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return false
  try {
    const p = jwt.verify(token, secret) as any
    return p.role === 'admin'
  } catch { return false }
}

// Helper : minuit heure Paris → timestamp UTC correct (gère l'heure d'été/hiver)
export function parisMidnight(date: Date): Date {
  const dateStr = date.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' })
  const utcMidnight = new Date(`${dateStr}T00:00:00Z`)
  const parisTime = utcMidnight.toLocaleTimeString('fr-FR', {
    timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const [h, m] = parisTime.split(':').map(Number)
  return new Date(utcMidnight.getTime() - (h * 60 + m) * 60000)
}
