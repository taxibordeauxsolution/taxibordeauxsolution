import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Reservation } from '@/app/lib/mongodb'
import { verifyAdmin, parisMidnight } from '@/app/lib/auth'

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()

    const now = new Date()
    // Composantes Paris (pour jour de semaine et mois courant)
    const parisLocal = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
    const parisDoW = parisLocal.getDay() // 0=Dim..6=Sam
    const parisY = parisLocal.getFullYear()
    const parisM = parisLocal.getMonth()

    const todayStart = parisMidnight(now)

    // Lundi de cette semaine
    const dowFromMon = parisDoW === 0 ? 6 : parisDoW - 1
    const weekStart = parisMidnight(new Date(now.getTime() - dowFromMon * 86400000))
    const prevWeekStart = parisMidnight(new Date(weekStart.getTime() - 7 * 86400000))

    // 1er du mois courant et du mois précédent en heure Paris
    const monthStart = parisMidnight(new Date(Date.UTC(parisY, parisM, 1)))
    const prevMonthStart = parisMidnight(new Date(Date.UTC(parisY, parisM - 1, 1)))

    const [result] = await Reservation.aggregate([
      { $match: { status: 'terminee', pickupDate: { $gte: prevMonthStart } } },
      {
        $facet: {
          aujourdhui:       [{ $match: { pickupDate: { $gte: todayStart } } },                         { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }],
          semaine:          [{ $match: { pickupDate: { $gte: weekStart } } },                           { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }],
          mois:             [{ $match: { pickupDate: { $gte: monthStart } } },                          { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }],
          semainePrecedente:[{ $match: { pickupDate: { $gte: prevWeekStart, $lt: weekStart } } },       { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }],
          moisPrecedent:    [{ $match: { pickupDate: { $gte: prevMonthStart, $lt: monthStart } } },     { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }],
        },
      },
    ])

    const extract = (arr: Array<{ total: number }>) => arr?.[0]?.total || 0

    return NextResponse.json({
      success: true,
      data: {
        aujourdhui:        extract(result.aujourdhui),
        semaine:           extract(result.semaine),
        mois:              extract(result.mois),
        semainePrecedente: extract(result.semainePrecedente),
        moisPrecedent:     extract(result.moisPrecedent),
      },
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
