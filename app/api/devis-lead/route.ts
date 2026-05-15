import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { connectDB, Estimation } from '@/app/lib/mongodb'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_FR_RE = /^(?:\+33|0033|0)[1-9](?:[\s.\-]?\d{2}){4}$/

function sanitize(s: string) {
  return s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] || c))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, telephone, dateSouhaitee, estimationId, passengers, isForfait: isForfaitBody, rgpdConsent, honeypot } = body

    // Honeypot anti-spam
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    // Validation email
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, message: 'Email invalide' }, { status: 400 })
    }

    // Validation téléphone FR (si fourni)
    if (telephone && !PHONE_FR_RE.test(telephone.replace(/\s/g, ''))) {
      return NextResponse.json({ success: false, message: 'Format téléphone invalide' }, { status: 400 })
    }

    // RGPD obligatoire
    if (!rgpdConsent) {
      return NextResponse.json({ success: false, message: 'Consentement RGPD requis' }, { status: 400 })
    }

    if (!estimationId) {
      return NextResponse.json({ success: false, message: 'Estimation ID manquant' }, { status: 400 })
    }

    await connectDB()

    // Rate limiting : max 3 soumissions par email sur la dernière heure
    const oneHourAgo = new Date(Date.now() - 3600000)
    const recentCount = await Estimation.countDocuments({
      email,
      leadCreatedAt: { $gte: oneHourAgo },
    })
    if (recentCount >= 3) {
      return NextResponse.json(
        { success: false, message: 'Trop de demandes. Réessayez dans une heure.' },
        { status: 429 }
      )
    }

    // Enrichir l'estimation existante
    const estimation = await Estimation.findByIdAndUpdate(
      estimationId,
      {
        email,
        telephone: telephone || null,
        dateSouhaitee: dateSouhaitee || null,
        rgpdConsent: true,
        leadCreatedAt: new Date(),
        statut: 'lead',
      },
      { new: true }
    )

    if (!estimation) {
      return NextResponse.json({ success: false, message: 'Estimation introuvable' }, { status: 404 })
    }

    const safeFrom = sanitize(estimation.from)
    const safeTo = sanitize(estimation.to)
    const safeTel = telephone ? sanitize(telephone) : null
    const safeEmail = sanitize(email)
    const hasFourchette = estimation.fourchette && estimation.fourchette.de != null && estimation.fourchette.a != null
    const prixAffiche = hasFourchette
      ? `${estimation.fourchette.de.toFixed(2)}€ à ${estimation.fourchette.a.toFixed(2)}`
      : estimation.price.toFixed(2)
    const distanceAffiche = estimation.distance.toFixed(1)
    const dureeAffiche = Math.round(estimation.duration)
    const tarif = sanitize(estimation.tariffType)
    const nbPassagers = passengers || 1
    const forfait = isForfaitBody || estimation.isForfait
    let dateSouhaiteeAffiche: string | null = null
    if (dateSouhaitee) {
      const match = String(dateSouhaitee).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
      if (match) {
        const [, yyyy, mm, dd, hh, min] = match
        const moisFR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
        dateSouhaiteeAffiche = `${dd} ${moisFR[parseInt(mm, 10) - 1]} ${yyyy} à ${hh}:${min}`
      } else {
        const obj = new Date(dateSouhaitee + 'Z')
        dateSouhaiteeAffiche = obj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
          + ' à '
          + obj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
      }
    }

    const whatsappMsg = encodeURIComponent(
      `Bonjour, je souhaite réserver ce trajet :\n${estimation.from} → ${estimation.to}\nTarif estimé : ${prixAffiche}€ (${tarif})\nDate : ${dateSouhaiteeAffiche || 'à définir'}`
    )

    // ── Email client : récap devis ──
    const clientHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f4f4f5;color:#1e293b">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">

  <!-- Header -->
  <tr><td style="background:#1e293b;padding:24px 32px;text-align:center">
    <h1 style="margin:0;font-size:18px;color:#ffffff;font-weight:600">Taxi Bordeaux Solution</h1>
    <p style="margin:6px 0 0;font-size:13px;color:#94a3b8">Estimation de course</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px">

    <p style="margin:0 0 24px;font-size:14px;color:#475569">Bonjour,<br>Voici le récapitulatif de votre estimation.</p>

    <!-- Trajet -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td width="24" valign="top" style="padding-top:2px"><div style="width:10px;height:10px;border-radius:50%;background:#16a34a"></div></td>
        <td style="padding-bottom:6px;font-size:14px;color:#1e293b">${safeFrom}</td>
      </tr>
      <tr>
        <td width="24" style="padding:0 0 0 4px"><div style="width:2px;height:16px;background:#cbd5e1"></div></td>
        <td></td>
      </tr>
      <tr>
        <td width="24" valign="top" style="padding-top:2px"><div style="width:10px;height:10px;border-radius:50%;background:#dc2626"></div></td>
        <td style="font-size:14px;color:#1e293b">${safeTo}</td>
      </tr>
    </table>

    <!-- Détails -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9;margin-bottom:24px">
      ${dateSouhaiteeAffiche ? `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:40%">Date et heure</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;font-weight:500;text-align:right">${dateSouhaiteeAffiche}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">Distance</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;font-weight:500;text-align:right">${distanceAffiche} km</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">Durée estimée</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;font-weight:500;text-align:right">${dureeAffiche} min</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">Passagers</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;font-weight:500;text-align:right">${nbPassagers}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">Tarif</td>
        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;font-weight:500;text-align:right">${tarif}${forfait ? ' — Forfait' : ''}</td>
      </tr>
    </table>

    <!-- Prix -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faf9;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:24px">
      <tr><td style="padding:20px;text-align:center">
        <div style="font-size:28px;font-weight:700;color:#1e293b">${prixAffiche}€</div>
        <div style="font-size:12px;color:#64748b;margin-top:6px">Paiement CB accepté à bord</div>
      </td></tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
      <tr><td align="center">
        <a href="https://www.taxibordeauxsolution.fr/#reservation" style="display:inline-block;padding:14px 32px;background:#1e293b;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600">Réserver en ligne</a>
      </td></tr>
    </table>

    <p style="text-align:center;font-size:13px;color:#64748b;margin:0">
      <a href="tel:+33667237822" style="color:#475569;text-decoration:none">+33 6 67 23 78 22</a>
      &nbsp;&nbsp;·&nbsp;&nbsp;
      <a href="https://wa.me/33667237822?text=${whatsappMsg}" style="color:#475569;text-decoration:none">WhatsApp</a>
    </p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:11px;color:#94a3b8">
    Vos données sont utilisées uniquement pour traiter votre demande de transport.<br>
    Conservation 3 ans · <a href="mailto:contact@taxibordeauxsolution.fr" style="color:#94a3b8">contact@taxibordeauxsolution.fr</a>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`

    const clientText = `Votre estimation — Taxi Bordeaux Solution

${estimation.from} → ${estimation.to}
${dateSouhaiteeAffiche ? `Date et heure : ${dateSouhaiteeAffiche}` : ''}
Distance : ${distanceAffiche} km · Durée : ${dureeAffiche} min
Passagers : ${nbPassagers} · Tarif : ${tarif}${forfait ? ' (forfait)' : ''}

Prix estimé : ${prixAffiche}€
Paiement CB accepté à bord

Réserver en ligne : https://www.taxibordeauxsolution.fr/#reservation
Appeler : +33 6 67 23 78 22
WhatsApp : https://wa.me/33667237822`

    // ── Email alerte Yassine ──
    const adminHtml = `<h2>🚕 Nouveau lead</h2>
<p><strong>${safeFrom} → ${safeTo}</strong> — ${prixAffiche}€</p>
<ul>
  <li><strong>Email :</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></li>
  ${safeTel ? `<li><strong>Téléphone :</strong> <a href="tel:${safeTel}">${safeTel}</a></li>` : ''}
  ${dateSouhaiteeAffiche ? `<li><strong>Date souhaitée :</strong> ${dateSouhaiteeAffiche}</li>` : ''}
  <li><strong>Distance :</strong> ${distanceAffiche} km</li>
  <li><strong>Durée :</strong> ${dureeAffiche} min</li>
  <li><strong>Tarif :</strong> ${tarif}</li>
  <li><strong>Forfait :</strong> ${estimation.isForfait ? 'Oui' : 'Non'}</li>
</ul>
${safeTel ? `<p><a href="https://wa.me/${telephone!.replace(/\D/g, '').replace(/^0/, '33')}?text=${encodeURIComponent(`Bonjour, suite à votre estimation ${estimation.from} → ${estimation.to} (${prixAffiche}€), je reviens vers vous.`)}">💬 Répondre par WhatsApp</a></p>` : ''}
<p style="font-size:12px;color:#666">ID estimation : ${estimationId}</p>`

    // Envoi des 2 emails en parallèle
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@taxibordeauxsolution.fr'
    const toAdmin = process.env.RESEND_TO_EMAIL || 'contact@taxibordeauxsolution.fr'

    await Promise.all([
      resend.emails.send({
        from: fromEmail,
        to: [email],
        replyTo: 'contact@taxibordeauxsolution.fr',
        subject: 'Votre devis Taxi Bordeaux Solution',
        html: clientHtml,
        text: clientText,
      }),
      resend.emails.send({
        from: fromEmail,
        to: [toAdmin],
        subject: `🚕 Nouveau lead : ${estimation.from.split(',')[0]} → ${estimation.to.split(',')[0]} — ${prixAffiche}€`,
        html: adminHtml,
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Erreur devis-lead:', e)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
