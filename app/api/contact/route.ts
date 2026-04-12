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

    const emailHtml = `
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
          .value { color: #333; }
          .footer { background: #f8f9fa; padding: 16px; text-align: center; color: #6c757d; font-size: 13px; border-top: 1px solid #e9ecef; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouveau message de contact</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Nom complet</span>
              <span class="value">${firstName} ${lastName}</span>
            </div>
            <div class="field">
              <span class="label">Téléphone</span>
              <span class="value"><a href="tel:${phone}" style="color:#2563eb">${phone}</a></span>
            </div>
            ${email ? `
            <div class="field">
              <span class="label">Email</span>
              <span class="value"><a href="mailto:${email}" style="color:#2563eb">${email}</a></span>
            </div>` : ''}
            <div class="field">
              <span class="label">Message</span>
              <span class="value">${message}</span>
            </div>
          </div>
          <div class="footer">
            Taxi Bordeaux Solution — taxibordeauxsolution.fr
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.RESEND_TO_EMAIL!,
      subject: `Message de ${firstName} ${lastName}`,
      html: emailHtml,
      text: `Nouveau message de contact\n\nNom: ${firstName} ${lastName}\nTéléphone: ${phone}\n${email ? `Email: ${email}\n` : ''}Message: ${message}`
    });

    if (error) {
      return NextResponse.json({ error: `Erreur email: ${error.message}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur interne', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
