import { NextRequest, NextResponse } from 'next/server'
import { connectDB, AdminUser } from '@/app/lib/mongodb'
import { verifyAdmin, getAdminEmail } from '@/app/lib/auth'

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ success: false }, { status: 401 })
  try {
    await connectDB()
    const email = getAdminEmail(req)
    const user = await AdminUser.findOne({ email }, { passwordHash: 0 }).lean() as any
    if (!user) return NextResponse.json({ success: false }, { status: 404 })
    return NextResponse.json({ success: true, data: user })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ success: false }, { status: 401 })
  try {
    await connectDB()
    const email = getAdminEmail(req)
    const body = await req.json()
    const fields = ['nomEntreprise','adresse','telephone','emailFacturation','siret','numeroTva','formeJuridique','capitalSocial','iban','conditionsPaiement']
    const update: any = {}
    for (const f of fields) {
      if (typeof body[f] !== 'undefined') update[f] = body[f].trim()
    }

    const user = await AdminUser.findOneAndUpdate({ email }, { $set: update }, { new: true, projection: { passwordHash: 0 } })
    if (!user) return NextResponse.json({ success: false }, { status: 404 })
    return NextResponse.json({ success: true, data: user })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
