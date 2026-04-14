import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const ADMIN_PIN  = process.env.ADMIN_PIN  || '3327'
const JWT_SECRET = process.env.JWT_SECRET || 'taxi_bordeaux_jwt_secret_2025_very_secure_key_minimum_64_chars_long'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  if (!pin || String(pin) !== String(ADMIN_PIN)) {
    return NextResponse.json({ success: false, message: 'PIN incorrect' }, { status: 401 })
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' })
  return NextResponse.json({ success: true, token })
}
