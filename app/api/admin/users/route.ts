import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { connectDB, AdminUser } from '@/app/lib/mongodb'

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
    const users = await AdminUser.find({}, { passwordHash: 0 }).sort({ createdAt: 1 }).lean()
    return NextResponse.json({ success: true, data: users })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, message: 'Email, nom et mot de passe requis' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    const existing = await AdminUser.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await AdminUser.create({ email: email.toLowerCase().trim(), passwordHash: hash, name: name.trim() })

    return NextResponse.json({ success: true, data: { _id: user._id, email: user.email, name: user.name } }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const { id } = await req.json()
    if (!id) return NextResponse.json({ success: false, message: 'ID requis' }, { status: 400 })

    const count = await AdminUser.countDocuments()
    if (count <= 1) {
      return NextResponse.json({ success: false, message: 'Impossible de supprimer le dernier admin' }, { status: 400 })
    }

    await AdminUser.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
