import { NextRequest, NextResponse } from 'next/server'
import { connectDB, ConfigPrix } from '@/app/lib/mongodb'
import { verifyAdmin } from '@/app/lib/auth'

const getConfig = async () => {
  let config = await ConfigPrix.findOne()
  if (!config) config = await ConfigPrix.create({})
  return config
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })
  try {
    await connectDB()
    const config = await getConfig()
    return NextResponse.json({ success: true, data: config })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })
  try {
    await connectDB()
    const body = await req.json()

    // Validation des champs numériques (min 0, max raisonnable)
    const numFields = ['priseEnCharge', 'tarifKmJour', 'tarifKmNuit', 'fraisApproche', 'courseMini', 'courseMiniDe',
      'remiseSeuilKm', 'remisePourcentage', 'suppApprocheSeuilKm',
      'tarifNuitDegressifSeuilKm', 'tarifNuitDegressifPrixKm',
      'tarifJourDegressifSeuilKm', 'tarifJourDegressifPrixKm',
      'tarifNuitMajoreSeuilKm', 'tarifNuitMajorePrixKm',
      'tarifJourMajoreSeuilKm', 'tarifJourMajorePrixKm', 'seuilKmCaptureLead']
    for (const f of numFields) {
      if (body[f] !== undefined && body[f] !== '') {
        const v = Number(body[f])
        if (isNaN(v) || v < 0 || v > 9999) {
          return NextResponse.json({ success: false, message: `Valeur invalide pour ${f} (0–9999)` }, { status: 400 })
        }
      }
    }
    if (body.remisePourcentage !== undefined && (body.remisePourcentage < 0 || body.remisePourcentage > 50)) {
      return NextResponse.json({ success: false, message: 'Remise doit être entre 0 et 50%' }, { status: 400 })
    }

    const fields = ['priseEnCharge', 'tarifKmJour', 'tarifKmNuit', 'fraisApproche', 'courseMini', 'courseMiniDe',
      'heureDebutNuit', 'heureFinNuit', 'remiseActive', 'remiseSeuilKm', 'remisePourcentage',
      'suppApprocheActive', 'suppApprocheSeuilKm', 'itineraireJour', 'itineraireNuit',
      'tarifNuitDegressifActive', 'tarifNuitDegressifSeuilKm', 'tarifNuitDegressifPrixKm', 'tarifNuitDegressifMode',
      'tarifJourDegressifActive', 'tarifJourDegressifSeuilKm', 'tarifJourDegressifPrixKm', 'tarifJourDegressifMode',
      'tarifNuitMajoreActive', 'tarifNuitMajoreSeuilKm', 'tarifNuitMajorePrixKm',
      'tarifJourMajoreActive', 'tarifJourMajoreSeuilKm', 'tarifJourMajorePrixKm',
      'seuilKmCaptureLead', 'captureLeadActive', 'affichagePrixUnique']
    const update: Record<string, any> = {}
    for (const f of fields) {
      if (body[f] !== undefined && body[f] !== '') update[f] = body[f]
    }
    if (Array.isArray(body.joursOff)) update.joursOff = body.joursOff

    const config = await ConfigPrix.findOneAndUpdate({}, { $set: update }, { upsert: true, new: true })
    return NextResponse.json({ success: true, data: config })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
