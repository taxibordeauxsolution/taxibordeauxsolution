import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { connectDB, AdminUser } from '@/app/lib/mongodb'
import { getJwtSecret } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const jwtSecret = getJwtSecret()
    const { email, password } = await req.json()
    if (!password) {
      return NextResponse.json({ success: false, message: 'Mot de passe requis' }, { status: 401 })
    }

    await connectDB()
    const adminCount = await AdminUser.countDocuments()

    if (adminCount === 0) {
      const legacyPassword = process.env.ADMIN_PASSWORD
      if (!legacyPassword) {
        return NextResponse.json({ success: false, message: 'Configuration admin manquante — définissez ADMIN_PASSWORD' }, { status: 500 })
      }
      if (String(password) !== String(legacyPassword)) {
        return NextResponse.json({ success: false, message: 'Mot de passe incorrect' }, { status: 401 })
      }
      const hash = await bcrypt.hash(legacyPassword, 10)
      await AdminUser.create({ email: 'admin@taxibordeauxsolution.fr', passwordHash: hash, name: 'Admin' })
      const token = jwt.sign({ role: 'admin', email: 'admin@taxibordeauxsolution.fr' }, jwtSecret, { expiresIn: '8h' })
      return NextResponse.json({ success: true, token, migrated: true })
    }

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email requis' }, { status: 401 })
    }

    const user = await AdminUser.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return NextResponse.json({ success: false, message: 'Identifiants incorrects' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Identifiants incorrects' }, { status: 401 })
    }

    const token = jwt.sign({ role: 'admin', email: user.email, name: user.name }, jwtSecret, { expiresIn: '8h' })
    return NextResponse.json({ success: true, token })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
