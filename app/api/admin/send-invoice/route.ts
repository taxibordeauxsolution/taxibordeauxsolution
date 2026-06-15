import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { verifyAdmin } from '@/app/lib/auth'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    const { email, pdfBase64, invoiceNumber, reservationId, customerName } = await req.json()

    if (!email || !pdfBase64 || !invoiceNumber)
      return NextResponse.json({ success: false, message: 'Paramètres manquants' }, { status: 400 })

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@taxibordeauxsolution.fr'

    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      replyTo: 'contact@taxibordeauxsolution.fr',
      subject: `Facture FAC-${invoiceNumber} — Taxi Bordeaux Solution`,
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:24px;background:#f4f4f5;color:#1e293b">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
  <tr><td style="background:#1e3a5f;padding:20px 32px;text-align:center">
    <h1 style="margin:0;font-size:18px;color:#fff;font-weight:600">Taxi Bordeaux Solution</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <h2 style="margin:0 0 16px;font-size:18px;color:#1e293b">Bonjour ${customerName},</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#64748b">
      Veuillez trouver ci-joint votre facture <strong>FAC-${invoiceNumber}</strong>
      ${reservationId ? ` correspondant à votre réservation <strong>${reservationId}</strong>` : ''}.
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b">
      Merci pour votre confiance et à bientôt à bord de nos taxis.
    </p>
    <p style="margin:0;font-size:13px;color:#94a3b8">
      Contact : <a href="tel:+33554543466" style="color:#1e293b">+33 5 54 54 34 66</a> ·
      <a href="mailto:contact@taxibordeauxsolution.fr" style="color:#1e293b">contact@taxibordeauxsolution.fr</a>
    </p>
  </td></tr>
  <tr><td style="padding:12px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:11px;color:#94a3b8">
    Taxi Bordeaux Solution · Sainte-Eulalie, 33560
  </td></tr>
</table>
</body></html>`,
      attachments: [
        {
          filename: `Facture-FAC-${invoiceNumber}.pdf`,
          content: pdfBase64,
        },
      ],
    })

    if ((result as any).error)
      return NextResponse.json({ success: false, message: (result as any).error.message }, { status: 400 })

    return NextResponse.json({ success: true, emailId: (result as any).data?.id })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
