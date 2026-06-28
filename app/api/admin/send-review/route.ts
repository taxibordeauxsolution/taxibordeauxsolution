import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { verifyAdmin } from '@/app/lib/auth'

const resend = new Resend(process.env.RESEND_API_KEY)
const REVIEW_URL = 'https://g.page/r/CSgLIx6QFNEvEBM/review'

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    const { email, customerName } = await req.json()
    if (!email)
      return NextResponse.json({ success: false, message: 'Email manquant' }, { status: 400 })

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@taxibordeauxsolution.fr'
    const firstName = customerName?.split(' ')[0] || customerName || 'cher client'

    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      replyTo: 'contact@taxibordeauxsolution.fr',
      subject: 'Votre avis compte pour nous — Taxi Bordeaux Solution',
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:24px;background:#f4f4f5;color:#1e293b">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
  <tr><td style="background:#1e3a5f;padding:20px 32px;text-align:center">
    <h1 style="margin:0;font-size:18px;color:#fff;font-weight:600">Taxi Bordeaux Solution</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <h2 style="margin:0 0 16px;font-size:18px;color:#1e293b">Bonjour ${firstName},</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#64748b">
      Merci d'avoir choisi Taxi Bordeaux Solution. Votre confiance nous tient à cœur.
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b">
      Si vous êtes satisfait(e) de votre course, un avis Google nous aiderait énormément à nous faire connaître. Cela ne prend que 30 secondes !
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="${REVIEW_URL}"
        style="display:inline-block;padding:14px 32px;background:#f59e0b;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px">
        ⭐ Laisser un avis Google
      </a>
    </td></tr></table>
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;text-align:center">
      Merci et à bientôt !<br>
      <a href="tel:+33554543466" style="color:#1e293b">+33 5 54 54 34 66</a> ·
      <a href="mailto:contact@taxibordeauxsolution.fr" style="color:#1e293b">contact@taxibordeauxsolution.fr</a>
    </p>
  </td></tr>
  <tr><td style="padding:12px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:11px;color:#94a3b8">
    Taxi Bordeaux Solution · Sainte-Eulalie, 33560
  </td></tr>
</table>
</body></html>`,
    })

    if ((result as any).error)
      return NextResponse.json({ success: false, message: (result as any).error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
