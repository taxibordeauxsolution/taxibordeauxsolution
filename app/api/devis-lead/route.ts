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
    const dateSouhaiteeObj = dateSouhaitee ? new Date(dateSouhaitee) : null
    const dateSouhaiteeAffiche = dateSouhaiteeObj
      ? dateSouhaiteeObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
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
.trajet{background:#f8fafc;border-radius:8px;padding:20px;margin:16px 0}
.trajet-point{display:flex;align-items:flex-start;gap:10px;padding:8px 0}
.trajet-dot{width:12px;height:12px;border-radius:50%;margin-top:4px;flex-shrink:0}
.trajet-dot-from{background:#16a34a}
.trajet-dot-to{background:#dc2626}
.trajet-line{width:2px;height:20px;background:#cbd5e1;margin:0 5px}
.trajet-addr{font-size:15px;color:#1e293b}
.details{display:flex;flex-wrap:wrap;gap:0;margin:16px 0}
.detail-item{flex:1;min-width:45%;padding:12px 0;border-bottom:1px solid #f1f5f9}
.detail-label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px}
.detail-value{font-size:15px;color:#1e293b;font-weight:500}
.price-box{background:#f0fdf4;border:2px solid #16a34a;border-radius:8px;padding:24px;text-align:center;margin:24px 0}
.price-box .amount{font-size:2em;font-weight:bold;color:#16a34a}
.price-box .note{font-size:12px;color:#64748b;margin-top:8px}
.btn-main{display:block;padding:16px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:16px;text-align:center;margin:8px 0;color:#fff;background:#1e40af}
.btn-row{display:flex;gap:8px;margin:8px 0}
.btn-row a{flex:1;display:block;padding:12px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;text-align:center;color:#fff}
.btn-tel{background:#334155}
.btn-wa{background:#25D366}
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

  <div class="trajet">
    <div class="trajet-point">
      <div class="trajet-dot trajet-dot-from"></div>
      <div class="trajet-addr">${safeFrom}</div>
    </div>
    <div style="padding-left:5px"><div class="trajet-line"></div></div>
    <div class="trajet-point">
      <div class="trajet-dot trajet-dot-to"></div>
      <div class="trajet-addr">${safeTo}</div>
    </div>
  </div>

  <div class="details">
    ${dateSouhaiteeAffiche ? `<div class="detail-item" style="min-width:100%"><div class="detail-label">Date et heure</div><div class="detail-value">${dateSouhaiteeAffiche}</div></div>` : ''}
    <div class="detail-item"><div class="detail-label">Distance</div><div class="detail-value">${distanceAffiche} km</div></div>
    <div class="detail-item"><div class="detail-label">Durée estimée</div><div class="detail-value">${dureeAffiche} min</div></div>
    <div class="detail-item"><div class="detail-label">Passagers</div><div class="detail-value">${nbPassagers}</div></div>
    <div class="detail-item"><div class="detail-label">Tarif</div><div class="detail-value">${tarif}${forfait ? ' · Forfait' : ''}</div></div>
  </div>

  <div class="price-box">
    <div class="amount">${prixAffiche}€</div>
    <div class="note">Paiement CB accepté à bord</div>
  </div>

  <a href="https://www.taxibordeauxsolution.fr/#reservation" class="btn-main">Réserver en ligne</a>
  <div class="btn-row">
    <a href="tel:+33667237822" class="btn-tel">Appeler</a>
    <a href="https://wa.me/33667237822?text=${whatsappMsg}" class="btn-wa">WhatsApp</a>
  </div>
</div>
<div class="footer">
  Vos données sont utilisées uniquement pour traiter votre demande de transport.<br>
  Conservation 3 ans · <a href="mailto:contact@taxibordeauxsolution.fr" style="color:#94a3b8">contact@taxibordeauxsolution.fr</a>
</div>
</div></body></html>`

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
