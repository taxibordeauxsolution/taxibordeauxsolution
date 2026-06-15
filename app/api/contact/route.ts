import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName = '', lastName = '', phone = '', email = '', message = '' } = body;

    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !message.trim()) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Configuration email manquante' }, { status: 500 });
    }

    // Email pour le propriétaire
    const ownerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background: #f8f9fa; }
          .container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 24px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; }
          .content { padding: 24px 20px; }
          .field { margin-bottom: 12px; padding: 12px 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #2563eb; }
          .label { font-weight: 600; color: #2563eb; display: block; font-size: 12px; text-transform: uppercase; margin-bottom: 2px; }
          .footer { background: #f8f9fa; padding: 16px; text-align: center; color: #6c757d; font-size: 13px; border-top: 1px solid #e9ecef; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Nouveau message de contact</h1></div>
          <div class="content">
            <div class="field"><span class="label">Nom complet</span><span>${firstName} ${lastName}</span></div>
            <div class="field"><span class="label">Téléphone</span><span><a href="tel:${phone}" style="color:#2563eb">${phone}</a></span></div>
            ${email ? `<div class="field"><span class="label">Email</span><span><a href="mailto:${email}" style="color:#2563eb">${email}</a></span></div>` : ''}
            <div class="field"><span class="label">Message</span><span>${message}</span></div>
          </div>
          <div class="footer">Taxi Bordeaux Solution — taxibordeauxsolution.fr</div>
        </div>
      </body>
      </html>
    `;

    // Email de confirmation pour le client
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background: #f8f9fa; }
          .container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 32px 20px; text-align: center; }
          .header h1 { margin: 0 0 6px 0; font-size: 22px; }
          .header p { margin: 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 32px 24px; }
          .message-box { background: #f0f7ff; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px; margin: 20px 0; color: #555; font-style: italic; }
          .info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info p { margin: 6px 0; }
          .cta { text-align: center; margin: 28px 0 8px; }
          .cta a { background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
          .footer { background: #f8f9fa; padding: 16px; text-align: center; color: #6c757d; font-size: 13px; border-top: 1px solid #e9ecef; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Merci ${firstName} !</h1>
            <p>Votre message a bien été reçu</p>
          </div>
          <div class="content">
            <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
            <p>Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.</p>

            <div class="message-box">
              "${message}"
            </div>

            <div class="info">
              <p><strong>Besoin urgent ?</strong></p>
              <p>📞 <a href="tel:+33554543466" style="color:#2563eb">+33 5 54 54 34 66</a> — Disponible 24h/24</p>
              <p>💬 <a href="https://wa.me/33667237822" style="color:#25D366">WhatsApp</a></p>
            </div>

            <div class="cta">
              <a href="https://www.taxibordeauxsolution.fr">Visiter notre site</a>
            </div>
          </div>
          <div class="footer">
            Taxi Bordeaux Solution — taxibordeauxsolution.fr<br>
            Sainte-Eulalie, 33560
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoi email propriétaire
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.RESEND_TO_EMAIL!,
      subject: `Message de ${firstName} ${lastName}`,
      html: ownerEmailHtml,
      text: `Nouveau message\n\nNom: ${firstName} ${lastName}\nTél: ${phone}\n${email ? `Email: ${email}\n` : ''}Message: ${message}`
    });

    if (error) {
      return NextResponse.json({ error: `Erreur email: ${error.message}` }, { status: 400 });
    }

    // Notification Telegram instantanée
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (telegramToken && telegramChatId) {
      const telegramText = `📩 Nouveau message de contact\n\n👤 ${firstName} ${lastName}\n📞 ${phone}${email ? `\n📧 ${email}` : ''}\n\n💬 ${message}`;
      fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId, text: telegramText })
      }).catch(() => {});
    }

    // Envoi confirmation client (seulement si email fourni)
    if (email.trim()) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: email,
        subject: `Confirmation — Taxi Bordeaux Solution`,
        html: clientEmailHtml,
        text: `Bonjour ${firstName},\n\nNous avons bien reçu votre message et vous répondrons dans les plus brefs délais.\n\nBesoin urgent ? Appelez-nous au +33 5 54 54 34 66.\n\nTaxi Bordeaux Solution`
      });
    }

    return NextResponse.json({ success: true, emailId: data?.id });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur interne', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
