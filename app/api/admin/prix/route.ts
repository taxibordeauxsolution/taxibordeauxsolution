import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB, ConfigPrix } from '@/app/lib/mongodb'

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
    const fields = ['priseEnCharge', 'tarifKmJour', 'tarifKmNuit', 'fraisApproche', 'courseMini', 'courseMiniDe', 'heureDebutNuit', 'heureFinNuit', 'remiseActive', 'remiseSeuilKm', 'remisePourcentage', 'suppApprocheActive', 'suppApprocheSeuilKm', 'itineraireCourt', 'tarifNuitDegressifActive', 'tarifNuitDegressifSeuilKm', 'tarifNuitDegressifPrixKm', 'tarifNuitDegressifMode', 'tarifJourDegressifActive', 'tarifJourDegressifSeuilKm', 'tarifJourDegressifPrixKm', 'tarifJourDegressifMode', 'seuilKmCaptureLead', 'captureLeadActive']
    const update: Record<string, any> = {}
    for (const f of fields) {
      if (body[f] !== undefined && body[f] !== '') update[f] = body[f]
    }
    const config = await ConfigPrix.findOneAndUpdate({}, { $set: update }, { upsert: true, new: true })
    return NextResponse.json({ success: true, data: config })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
