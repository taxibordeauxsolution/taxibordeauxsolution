import { NextResponse } from 'next/server'
import { connectDB, Forfait } from '@/app/lib/mongodb'

export async function GET() {
  await connectDB()
  const forfaits = await Forfait.find({ actif: true }).select('-__v')
  return NextResponse.json({ success: true, data: forfaits })
}
