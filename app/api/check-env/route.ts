import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALENDAR_REFRESH_TOKEN: !!process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
    CRON_SECRET: !!process.env.CRON_SECRET,
  })
}
