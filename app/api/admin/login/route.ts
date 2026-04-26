import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '332700Bp!'
const JWT_SECRET = process.env.JWT_SECRET || 'taxi_bordeaux_jwt_secret_2025_very_secure_key_minimum_64_chars_long'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (!password || String(password) !== String(ADMIN_PASSWORD)) {
    return NextResponse.json({ success: false, message: 'Mot de passe incorrect' }, { status: 401 })
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' })
  return NextResponse.json({ success: true, token })
}
