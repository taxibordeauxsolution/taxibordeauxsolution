import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const reservationData = await request.json();

    // Template HTML pour l'email de confirmation
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de réservation - Taxi Bordeaux Solution</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e2e8f0; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .price-box { background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #16a34a; }
            .next-steps { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .reservation-id { background: #fbbf24; color: #92400e; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚖 Taxi Bordeaux Solution</h1>
                <h2>Réservation confirmée !</h2>
            </div>
            
            <div class="content">
                <p>Bonjour <strong>${reservationData.customer.name}</strong>,</p>
                
                <p>Votre réservation de taxi a bien été confirmée. Voici le récapitulatif :</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <span class="reservation-id">N° ${reservationData.reservationId}</span>
                </div>

                <h3>📍 Détails du trajet</h3>
                <div class="detail-row">
                    <span><strong>Départ :</strong></span>
                    <span>${reservationData.trip.from.address}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Destination :</strong></span>
                    <span>${reservationData.trip.to.address}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Distance :</strong></span>
                    <span>${reservationData.trip.distance.toFixed(1)} km</span>
                </div>

                <h3>📅 Informations de prise en charge</h3>
                <div class="detail-row">
                    <span><strong>Date et heure :</strong></span>
                    <span>${reservationData.estimatedPickupTime}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Passagers :</strong></span>
                    <span>${reservationData.bookingDetails.passengers}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Bagages :</strong></span>
                    <span>${reservationData.bookingDetails.luggage}</span>
                </div>
                ${reservationData.bookingDetails.notes ? `
                <div class="detail-row">
                    <span><strong>Notes :</strong></span>
                    <span>${reservationData.bookingDetails.notes}</span>
                </div>` : ''}

                <div class="price-box">
                    <h3>💰 Prix total</h3>
                    <div style="font-size: 2em; font-weight: bold; color: #16a34a;">
                        ${reservationData.pricing.totalPrice.toFixed(2)}€
                    </div>
                    ${reservationData.pricing.priceDetails ? `
                    <div style="font-size: 0.9em; margin-top: 10px; color: #666;">
                        <div>Prix course (${reservationData.pricing.priceDetails.tariffType}) : ${reservationData.pricing.priceDetails.basePrice.toFixed(2)}€</div>

                        ${(reservationData.pricing.priceDetails.isNight || reservationData.pricing.priceDetails.isHoliday || reservationData.pricing.priceDetails.isSunday) ? 
                            '<div style="color: #2563eb; font-weight: bold;">✓ Tarif majoré appliqué</div>' : ''}
                    </div>` : ''}
                </div>

                <div class="next-steps">
                    <h3>📋 Prochaines étapes</h3>
                    <ul>
                        ${reservationData.next_steps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                </div>

                <h3>📞 Contact</h3>
                <p>
                    <strong>Téléphone :</strong> 06 67 23 78 22<br>
                    <strong>Email :</strong> contact@taxibordeauxsolution.fr
                </p>
            </div>

            <div class="footer">
                <p><strong>Taxi Bordeaux Solution</strong><br>
                Service de taxi professionnel à Bordeaux<br>
                Disponible 24h/24 - 7j/7</p>
                <p style="font-size: 0.8em; color: #666; margin-top: 15px;">
                    Cet email de confirmation a été envoyé automatiquement. 
                    Pour toute question, contactez-nous au 06 67 23 78 22.
                </p>
            </div>
        </div>
    </body>
    </html>`;

    // Envoi de l'email de confirmation au client
    const clientEmail = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [reservationData.customer.email],
      subject: `🚖 Réservation confirmée - N° ${reservationData.reservationId}`,
      html: emailHtml,
    });

    // Envoi d'une copie à l'entreprise
    const companyEmailHtml = `
    <h2>🚖 Nouvelle réservation taxi</h2>
    <p><strong>N° ${reservationData.reservationId}</strong></p>
    
    <h3>Client</h3>
    <ul>
        <li><strong>Nom :</strong> ${reservationData.customer.name}</li>
        <li><strong>Téléphone :</strong> ${reservationData.customer.phone}</li>
        <li><strong>Email :</strong> ${reservationData.customer.email}</li>
    </ul>

    <h3>Trajet</h3>
    <ul>
        <li><strong>Départ :</strong> ${reservationData.trip.from.address}</li>
        <li><strong>Destination :</strong> ${reservationData.trip.to.address}</li>
        <li><strong>Distance :</strong> ${reservationData.trip.distance.toFixed(1)} km</li>
        <li><strong>Prix :</strong> ${reservationData.pricing.totalPrice.toFixed(2)}€</li>
    </ul>

    <h3>Détails</h3>
    <ul>
        <li><strong>Prise en charge :</strong> ${reservationData.estimatedPickupTime}</li>
        <li><strong>Passagers :</strong> ${reservationData.bookingDetails.passengers}</li>
        <li><strong>Bagages :</strong> ${reservationData.bookingDetails.luggage}</li>
        ${reservationData.bookingDetails.notes ? `<li><strong>Notes :</strong> ${reservationData.bookingDetails.notes}</li>` : ''}
    </ul>`;

    const companyEmail = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [process.env.RESEND_TO_EMAIL],
      subject: `🚖 Nouvelle réservation - ${reservationData.customer.name} - N° ${reservationData.reservationId}`,
      html: companyEmailHtml,
    });

    return Response.json({ 
      success: true, 
      clientEmailId: clientEmail.data?.id,
      companyEmailId: companyEmail.data?.id 
    });
    
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return Response.json(
      { error: 'Erreur lors de l\'envoi de l\'email de confirmation' },
      { status: 500 }
    );
  }
}