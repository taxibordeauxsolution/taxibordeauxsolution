// app/api/test-email/route.ts
// Créez ce fichier pour tester Resend avant le formulaire complet

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    // Vérification des variables d'environnement
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY manquant dans .env.local' 
      }, { status: 500 });
    }

    if (!process.env.RESEND_TO_EMAIL) {
      return NextResponse.json({ 
        error: 'RESEND_TO_EMAIL manquant dans .env.local' 
      }, { status: 500 });
    }

    console.log('🧪 Test Resend en cours...');
    console.log('API Key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
    console.log('From:', process.env.RESEND_FROM_EMAIL);
    console.log('To:', process.env.RESEND_TO_EMAIL);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [process.env.RESEND_TO_EMAIL],
      subject: '🧪 Test Resend - Taxi Bordeaux Solution',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #3B82F6;">🎉 Test réussi !</h1>
          <p>Si vous recevez cet email, <strong>Resend fonctionne parfaitement</strong>.</p>
          <p>Vous pouvez maintenant utiliser le formulaire de contact.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Email de test depuis taxibordeauxsolution.fr<br>
            Envoyé le ${new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      `,
    });

    console.log('✅ Email de test envoyé avec succès !');
    console.log('Email ID:', result.data?.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Email de test envoyé avec succès !',
      emailId: result.data?.id,
      to: process.env.RESEND_TO_EMAIL
    });

  } catch (error) {
    console.error('❌ Erreur test email:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: 'Vérifiez votre API Key et les variables .env.local'
    }, { status: 500 });
  }
}