import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB, Forfait } from '@/app/lib/mongodb'

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
  if (!verifyAdmin(req)) return NextResponse.json({ success: false }, { status: 401 })
  await connectDB()
  const forfaits = await Forfait.find().sort({ createdAt: -1 })
  return NextResponse.json({ success: true, data: forfaits })
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ success: false }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const forfait = await Forfait.create(body)
  return NextResponse.json({ success: true, data: forfait }, { status: 201 })
}
