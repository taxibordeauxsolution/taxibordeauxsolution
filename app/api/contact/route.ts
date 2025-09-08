import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  console.log('🚀 API Contact appelée')
  
  try {
    const body = await request.json();
    console.log('📥 Body reçu:', body)
    
    // ✅ MAPPING INTELLIGENT - Accepte les deux formats de formulaires
    const { 
      firstName = '', 
      lastName = '', 
      phone = '', 
      email = '', 
      message = '',
      date = '', 
      time = '',
      
      // Format formulaire page contact (/contact)
      departure = '',
      destination = '',
      service = '',
      
      // Format formulaire réservation (page principale)
      departureAddress = '',
      serviceType = 'Contact général'
    } = body;

    // Choix intelligent des valeurs (priorité au format le plus complet)
    const finalDeparture = departureAddress || departure || 'Non spécifié';
    const finalDestination = destination || 'Non spécifié';
    const finalService = serviceType !== 'Contact général' ? serviceType : (service || 'Contact général');

    console.log('📋 Champs mappés:', {
      firstName, lastName, phone, 
      departure: finalDeparture,
      destination: finalDestination,
      service: finalService
    })

    // ✅ VALIDATION SOUPLE - Seulement les champs essentiels
    const errors = []
    
    if (!firstName || firstName.trim() === '') {
      errors.push('firstName (Prénom)')
    }
    if (!lastName || lastName.trim() === '') {
      errors.push('lastName (Nom)')
    }
    if (!phone || phone.trim() === '') {
      errors.push('phone (Téléphone)')
    }

    if (errors.length > 0) {
      console.log('❌ Champs essentiels manquants:', errors)
      return NextResponse.json(
        { 
          error: `Champs obligatoires manquants: ${errors.join(', ')}`,
          missingFields: errors,
          receivedData: body
        }, 
        { status: 400 }
      );
    }

    // Validation de la configuration Resend
    if (!process.env.RESEND_API_KEY) {
      console.log('❌ RESEND_API_KEY manquante')
      return NextResponse.json(
        { error: 'Configuration email manquante' }, 
        { status: 500 }
      );
    }

    console.log('✅ Validation passée, envoi email...')

    // Format date/heure français
    const formatDateTime = () => {
      if (date && time) {
        const dateObj = new Date(`${date}T${time}`);
        return dateObj.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      if (date) {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return 'Non spécifiée';
    };

    // Détection du type de formulaire
    const isFullBooking = finalDeparture !== 'Non spécifié' && finalDestination !== 'Non spécifié';
    const hasServiceDetails = finalService !== 'Contact général';
    
    // Email HTML professionnel
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${isFullBooking ? 'Nouvelle réservation taxi' : 'Nouveau contact'}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            background: #f8f9fa;
          }
          .container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { 
            background: linear-gradient(135deg, #2563eb, #1d4ed8); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .field { 
            margin-bottom: 15px; 
            padding: 12px 15px; 
            background: #f8f9fa; 
            border-radius: 6px; 
            border-left: 4px solid #2563eb;
          }
          .field.important { 
            background: #fff3cd; 
            border-left-color: #ffc107; 
          }
          .field.booking { 
            background: #d1ecf1; 
            border-left-color: #17a2b8; 
          }
          .label { 
            font-weight: 600; 
            color: #2563eb; 
            display: inline-block;
            min-width: 100px;
          }
          .value { color: #333; }
          .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            border-top: 1px solid #e9ecef; 
            color: #6c757d;
            font-size: 14px;
          }
          .action-box {
            background: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .phone-link { 
            color: #2563eb; 
            text-decoration: none; 
            font-weight: 600;
          }
          .email-link { 
            color: #2563eb; 
            text-decoration: none; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isFullBooking ? '🚖 Nouvelle Réservation Taxi' : '📧 Nouveau Message de Contact'}</h1>
            <p>Taxi Bordeaux Solution</p>
          </div>
          
          <div class="content">
            ${isFullBooking ? 
              '<div class="action-box"><strong>⚡ RÉSERVATION À TRAITER</strong><br>Répondre rapidement pour confirmer la disponibilité</div>' :
              '<div class="action-box"><strong>📝 NOUVEAU CONTACT</strong><br>Message client à traiter</div>'
            }
            
            <div class="field important">
              <span class="label">👤 Client:</span>
              <span class="value"><strong>${firstName} ${lastName}</strong></span>
            </div>
            
            <div class="field important">
              <span class="label">📞 Téléphone:</span>
              <span class="value"><a href="tel:${phone}" class="phone-link">${phone}</a></span>
            </div>
            
            ${email ? `
            <div class="field">
              <span class="label">📧 Email:</span>
              <span class="value"><a href="mailto:${email}" class="email-link">${email}</a></span>
            </div>
            ` : ''}
            
            ${hasServiceDetails ? `
            <div class="field">
              <span class="label">🚕 Service:</span>
              <span class="value">${finalService}</span>
            </div>
            ` : ''}
            
            ${isFullBooking ? `
            <div class="field booking">
              <span class="label">📍 Départ:</span>
              <span class="value">${finalDeparture}</span>
            </div>
            
            <div class="field booking">
              <span class="label">🎯 Destination:</span>
              <span class="value">${finalDestination}</span>
            </div>
            
            <div class="field booking">
              <span class="label">📅 Date/Heure:</span>
              <span class="value">${formatDateTime()}</span>
            </div>
            ` : ''}
            
            ${message ? `
            <div class="field">
              <span class="label">💬 Message:</span>
              <div class="value" style="margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e9ecef;">
                ${message}
              </div>
            </div>
            ` : ''}
            
            <div class="field" style="background: #f0f9ff; border-left-color: #0ea5e9;">
              <span class="label">📊 Source:</span>
              <span class="value">${isFullBooking ? 'Formulaire de réservation' : 'Formulaire de contact'}</span>
            </div>
          </div>
          
          <div class="footer">
            <strong>Taxi Bordeaux Solution</strong><br>
            Service professionnel 24h/24 - 7j/7<br>
            <em>Email généré automatiquement via Resend</em>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoi email avec sujet adaptatif
    console.log('📧 Envoi email via Resend...')
    console.log('From:', process.env.RESEND_FROM_EMAIL)
    console.log('To:', process.env.RESEND_TO_EMAIL)

    const subject = isFullBooking 
      ? `🚖 Réservation Taxi - ${firstName} ${lastName} (${finalService})`
      : `📧 Contact - ${firstName} ${lastName}${hasServiceDetails ? ` (${finalService})` : ''}`;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.RESEND_TO_EMAIL,
      subject: subject,
      html: emailHtml,
      text: `
${isFullBooking ? 'NOUVELLE RÉSERVATION TAXI' : 'NOUVEAU MESSAGE DE CONTACT'}

Client: ${firstName} ${lastName}
Téléphone: ${phone}
${email ? `Email: ${email}` : ''}
${hasServiceDetails ? `Service: ${finalService}` : ''}
${isFullBooking ? `
Départ: ${finalDeparture}
Destination: ${finalDestination}
Date/Heure: ${formatDateTime()}` : ''}
${message ? `
Message: ${message}` : ''}

Source: ${isFullBooking ? 'Formulaire de réservation' : 'Formulaire de contact'}
      `
    });

    if (error) {
      console.error('❌ Erreur Resend:', error);
      return NextResponse.json({ 
        error: `Erreur email: ${error.message || error}`,
        resendError: error 
      }, { status: 400 });
    }

    console.log('✅ Email envoyé avec succès!')
    console.log('📬 ID email:', data?.id)

    return NextResponse.json({ 
      success: true,
      message: 'Email envoyé avec succès',
      emailId: data?.id,
      formType: isFullBooking ? 'booking' : 'contact',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Erreur API:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur interne',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

// Test GET - Affiche la config
export async function GET() {
  return NextResponse.json({ 
    message: 'API Contact Taxi Bordeaux Solution - Compatible Multi-Formulaires',
    status: 'operational',
    timestamp: new Date().toISOString(),
    supportedFields: {
      required: ['firstName', 'lastName', 'phone'],
      optional: ['email', 'message', 'date', 'time'],
      booking: ['departure/departureAddress', 'destination', 'service/serviceType']
    },
    env: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL,
      toEmail: process.env.RESEND_TO_EMAIL,
    }
  });
}