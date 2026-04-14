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
  if (!verifyAdmin(req)) return NextResponse.json({ success: false }, { status: 401 })
  await connectDB()
  const config = await getConfig()
  return NextResponse.json({ success: true, data: config })
}

export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ success: false }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const config = await getConfig()
  Object.assign(config, body)
  await config.save()
  return NextResponse.json({ success: true, data: config })
}
