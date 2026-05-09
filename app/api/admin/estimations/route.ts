import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB, Estimation } from '@/app/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'taxi_bordeaux_jwt_secret_2025_very_secure_key_minimum_64_chars_long'

function verifyAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return false
  try {
    const p = jwt.verify(token, JWT_SECRET) as any
    return p.role === 'admin'
  } catch { return false }
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = Math.min(parseInt(searchParams.get('limit') || '500'), 2000)

    const filter: any = {}
    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z')
    }

    const [estimations, total] = await Promise.all([
      Estimation.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Estimation.countDocuments(filter),
    ])

    const stats = {
      total,
      avgPrice: 0,
      topRoutes: [] as { route: string; count: number }[],
      forfaitCount: 0,
    }

    if (estimations.length > 0) {
      stats.avgPrice = Math.round(
        (estimations.reduce((s: number, e: any) => s + e.price, 0) / estimations.length) * 100
      ) / 100

      stats.forfaitCount = estimations.filter((e: any) => e.isForfait).length

      const routeMap = new Map<string, number>()
      for (const e of estimations as any[]) {
        const fromShort = e.from?.split(',')[0] || e.from
        const toShort = e.to?.split(',')[0] || e.to
        const key = `${fromShort} → ${toShort}`
        routeMap.set(key, (routeMap.get(key) || 0) + 1)
      }
      stats.topRoutes = [...routeMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([route, count]) => ({ route, count }))
    }

    return NextResponse.json({ success: true, data: estimations, stats })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
