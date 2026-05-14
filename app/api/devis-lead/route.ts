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
    const { email, telephone, dateSouhaitee, estimationId, rgpdConsent, honeypot } = body

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
    const dateSouhaiteeObj = dateSouhaitee ? new Date(dateSouhaitee) : null
    const dateSouhaiteeAffiche = dateSouhaiteeObj
      ? dateSouhaiteeObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        + ' à '
        + dateSouhaiteeObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
      : null

    const whatsappMsg = encodeURIComponent(
      `Bonjour, je souhaite réserver ce trajet :\n${estimation.from} → ${estimation.to}\nTarif estimé : ${prixAffiche}€ (${tarif})\nDate : ${dateSouhaiteeAffiche || 'à définir'}`
    )

    // ── Email client : récap devis ──
    const clientHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f8fafc}
.wrap{max-width:600px;margin:0 auto;padding:16px}
.header{background:linear-gradient(135deg,#1e40af,#059669);color:#fff;padding:28px 24px;border-radius:10px 10px 0 0;text-align:center}
.header h1{margin:0 0 4px;font-size:20px}
.header p{margin:0;opacity:.9;font-size:14px}
.body{background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none}
.row{padding:12px 0;border-bottom:1px solid #f1f5f9}
.row b{color:#334155;display:block;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}
.row span{color:#1e293b;font-size:15px}
.price-box{background:#f0fdf4;border:2px solid #16a34a;border-radius:8px;padding:24px;text-align:center;margin:24px 0}
.price-box .amount{font-size:2em;font-weight:bold;color:#16a34a}
.cta{display:inline-block;padding:14px 28px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:15px;margin:6px}
.cta-site{background:#1e40af;color:#fff}
.cta-tel{background:#334155;color:#fff}
.cta-wa{background:#25D366;color:#fff}
.footer{background:#f8fafc;padding:18px;text-align:center;color:#94a3b8;font-size:11px;border-radius:0 0 10px 10px;border:1px solid #e2e8f0;border-top:none}
</style></head><body>
<div class="wrap">
<div class="header">
  <h1>Taxi Bordeaux Solution</h1>
  <p>Votre estimation de course</p>
</div>
<div class="body">
  <p>Bonjour,</p>
  <p>Voici le récapitulatif de votre estimation :</p>

  <div class="row"><b>Départ :</b><span>${safeFrom}</span></div>
  <div class="row"><b>Destination :</b><span>${safeTo}</span></div>
  <div class="row"><b>Distance :</b><span>${distanceAffiche} km</span></div>
  <div class="row"><b>Durée estimée :</b><span>${dureeAffiche} min</span></div>
  <div class="row"><b>Tarif :</b><span>${tarif}</span></div>
  ${dateSouhaiteeAffiche ? `<div class="row"><b>Date et heure :</b><span>${dateSouhaiteeAffiche}</span></div>` : ''}

  <div class="price-box">
    <div class="amount">${prixAffiche}€</div>
  </div>

  <div style="text-align:center;margin:28px 0">
    <a href="https://www.taxibordeauxsolution.fr/#reservation" class="cta cta-site">Réserver en ligne</a><br>
    <a href="tel:+33667237822" class="cta cta-tel">Appeler le +33 6 67 23 78 22</a><br>
    <a href="https://wa.me/33667237822?text=${whatsappMsg}" class="cta cta-wa">WhatsApp</a>
  </div>
</div>
<div class="footer">
  Vos données sont utilisées uniquement pour traiter votre demande de transport.<br>
  Conservation 3 ans · <a href="mailto:contact@taxibordeauxsolution.fr" style="color:#94a3b8">contact@taxibordeauxsolution.fr</a>
</div>
</div></body></html>`

    const clientText = `Votre estimation — Taxi Bordeaux Solution

Départ : ${estimation.from}
Destination : ${estimation.to}
Distance : ${distanceAffiche} km
Durée estimée : ${dureeAffiche} min
Tarif : ${tarif}
${dateSouhaiteeAffiche ? `Date et heure : ${dateSouhaiteeAffiche}` : ''}

Prix estimé : ${prixAffiche}€

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
