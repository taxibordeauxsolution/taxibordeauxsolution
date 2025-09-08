// app/api/diagnostic/route.ts
// Créez ce fichier pour diagnostiquer Resend

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    // Vérification des variables d'environnement
    const diagnostics = {
      timestamp: new Date().toISOString(),
      env_check: {
        resend_api_key: !!process.env.RESEND_API_KEY,
        resend_api_key_format: process.env.RESEND_API_KEY?.startsWith('re_') || false,
        resend_api_key_length: process.env.RESEND_API_KEY?.length || 0,
        resend_from_email: process.env.RESEND_FROM_EMAIL || 'NON_DEFINI',
        resend_to_email: process.env.RESEND_TO_EMAIL || 'NON_DEFINI'
      }
    };

    // Test de connexion Resend
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        ...diagnostics,
        status: 'ERROR',
        error: 'RESEND_API_KEY manquant'
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Test d'envoi d'email simple
    console.log('🔍 Diagnostic Resend...');
    console.log('From:', process.env.RESEND_FROM_EMAIL);
    console.log('To:', process.env.RESEND_TO_EMAIL);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [process.env.RESEND_TO_EMAIL!],
      subject: `🔍 DIAGNOSTIC ${new Date().toLocaleTimeString()} - Resend Test`,
      html: `
        <div style="font-family: monospace; padding: 20px; background: #f0f0f0;">
          <h1>🔍 DIAGNOSTIC RESEND</h1>
          <p><strong>Heure envoi:</strong> ${new Date().toLocaleString('fr-FR')}</p>
          <p><strong>Destinataire:</strong> ${process.env.RESEND_TO_EMAIL}</p>
          <p><strong>Expéditeur:</strong> ${process.env.RESEND_FROM_EMAIL}</p>
          
          <div style="background: white; padding: 15px; margin: 20px 0; border: 2px solid #4CAF50;">
            <h2>✅ SI VOUS RECEVEZ CET EMAIL</h2>
            <p>Resend fonctionne parfaitement !</p>
            <p>Le problème vient peut-être de votre boîte email.</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border: 2px solid #ffc107;">
            <h3>🔍 VÉRIFICATIONS À FAIRE :</h3>
            <ul>
              <li>Regardez dans vos SPAMS/Courriers indésirables</li>
              <li>Vérifiez l'adresse: ${process.env.RESEND_TO_EMAIL}</li>
              <li>Attendez 5 minutes maximum</li>
              <li>Vérifiez les logs Resend dashboard</li>
            </ul>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      ...diagnostics,
      status: 'SUCCESS',
      message: 'Email diagnostic envoyé',
      email_result: {
        id: result.data?.id,
        to: process.env.RESEND_TO_EMAIL
      }
    });

  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}