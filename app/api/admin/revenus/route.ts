import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB, Reservation } from '@/app/lib/mongodb'

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

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    const prevWeekStart = new Date(weekStart)
    prevWeekStart.setDate(prevWeekStart.getDate() - 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // 1 seule query : $facet avec 5 buckets de date
    const [result] = await Reservation.aggregate([
      { $match: { status: 'terminee', pickupDate: { $gte: prevMonthStart } } },
      {
        $facet: {
          aujourdhui: [
            { $match: { pickupDate: { $gte: todayStart } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
          ],
          semaine: [
            { $match: { pickupDate: { $gte: weekStart } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
          ],
          mois: [
            { $match: { pickupDate: { $gte: monthStart } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
          ],
          semainePrecedente: [
            { $match: { pickupDate: { $gte: prevWeekStart, $lt: weekStart } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
          ],
          moisPrecedent: [
            { $match: { pickupDate: { $gte: prevMonthStart, $lt: monthStart } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
          ],
        },
      },
    ])

    const extract = (arr: Array<{ total: number }>) => (arr?.[0]?.total || 0)

    return NextResponse.json({
      success: true,
      data: {
        aujourdhui: extract(result.aujourdhui),
        semaine: extract(result.semaine),
        mois: extract(result.mois),
        semainePrecedente: extract(result.semainePrecedente),
        moisPrecedent: extract(result.moisPrecedent),
      },
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
