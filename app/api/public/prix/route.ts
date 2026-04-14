import { NextResponse } from 'next/server'
import { connectDB, ConfigPrix } from '@/app/lib/mongodb'

export async function GET() {
  await connectDB()
  let config = await ConfigPrix.findOne()
  if (!config) config = await ConfigPrix.create({})
  return NextResponse.json({ success: true, data: config })
}
