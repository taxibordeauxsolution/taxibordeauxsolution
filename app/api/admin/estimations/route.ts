import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Estimation } from '@/app/lib/mongodb'
import { verifyAdmin } from '@/app/lib/auth'

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 2000)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const skip = (page - 1) * limit

    const leadsOnly = searchParams.get('leadsOnly') === 'true'

    const filter: any = {}
    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z')
    }
    if (leadsOnly) {
      filter.email = { $ne: null, $exists: true }
    }

    const [estimations, total] = await Promise.all([
      Estimation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Estimation.countDocuments(filter),
    ])

    const leadFilter: any = { ...filter, email: { $ne: null, $exists: true } }
    const [leadCount, contacteCount, convertiCount, perduCount] = await Promise.all([
      Estimation.countDocuments(leadFilter),
      Estimation.countDocuments({ ...filter, statut: 'contacte' }),
      Estimation.countDocuments({ ...filter, statut: 'converti' }),
      Estimation.countDocuments({ ...filter, statut: 'perdu' }),
    ])

    const [statsAgg] = await Estimation.aggregate([
      { $match: filter },
      { $group: {
        _id: null,
        avgPrice: { $avg: '$price' },
        forfaitCount: { $sum: { $cond: ['$isForfait', 1, 0] } }
      }}
    ])

    const [topRoutesAgg, topSourcesAgg] = await Promise.all([
      Estimation.aggregate([
        { $match: filter },
        { $project: { route: { $concat: [{ $arrayElemAt: [{ $split: ['$from', ','] }, 0] }, ' → ', { $arrayElemAt: [{ $split: ['$to', ','] }, 0] }] } } },
        { $group: { _id: '$route', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Estimation.aggregate([
        { $match: filter },
        { $group: { _id: { $ifNull: ['$utmSource', 'direct'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ])

    const stats = {
      total,
      avgPrice: statsAgg ? Math.round(statsAgg.avgPrice * 100) / 100 : 0,
      topRoutes: topRoutesAgg.map((r: any) => ({ route: r._id, count: r.count })),
      forfaitCount: statsAgg?.forfaitCount || 0,
      leadCount,
      funnel: { estimations: total, leads: leadCount, contactes: contacteCount, convertis: convertiCount, perdus: perduCount },
      topSources: topSourcesAgg.map((r: any) => ({ source: r._id, count: r.count })),
    }

    return NextResponse.json({ success: true, data: estimations, stats, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const { ids } = await req.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'IDs manquants' }, { status: 400 })
    }

    const result = await Estimation.deleteMany({ _id: { $in: ids } })
    return NextResponse.json({ success: true, deleted: result.deletedCount })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const { id, statut, notes } = await req.json()

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID manquant' }, { status: 400 })
    }

    const update: any = {}
    if (statut !== undefined) update.statut = statut
    if (notes !== undefined) update.notes = notes

    const result = await Estimation.findByIdAndUpdate(id, update, { new: true })
    if (!result) {
      return NextResponse.json({ success: false, message: 'Estimation introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
