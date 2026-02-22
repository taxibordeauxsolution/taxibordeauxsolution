// Simple test to launch the site with core dependencies only
import http from 'http';
import url from 'url';
import path from 'path';
import https from 'https';
import querystring from 'querystring';

// Configuration Resend API pour l'envoi d'emails
const RESEND_API_KEY = 're_Uecgqf4m_PaAVNiVBMaAtJeDWY94qbW3r';
const FROM_EMAIL = 'contact@taxibordeauxsolution.fr';
const TO_EMAIL = 'yassinedriyd@gmail.com';

const PORT = 3002;

// Fonction pour envoyer l'email via Resend API
async function sendReservationEmail(reservationData, reservationId) {
  const { trip, customer, booking } = reservationData;
  
  const emailHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouvelle Réservation Taxi Bordeaux</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; }
    .info-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 10px; background: white; border-radius: 5px; border-left: 3px solid #1e40af; }
    .label { font-weight: bold; color: #1e40af; }
    .value { text-align: right; font-weight: 500; }
    .total { background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚖 Nouvelle Réservation Taxi</h1>
    <h2>Bordeaux Solution</h2>
  </div>
  
  <div class="content">
    <div class="info-row">
      <span class="label">📋 Numéro:</span>
      <span class="value">${reservationId}</span>
    </div>
    
    <div class="info-row">
      <span class="label">👤 Client:</span>
      <span class="value">${customer.name}</span>
    </div>
    
    <div class="info-row">
      <span class="label">📞 Téléphone:</span>
      <span class="value">${customer.phone}</span>
    </div>
    
    <div class="info-row">
      <span class="label">📧 Email:</span>
      <span class="value">${customer.email || 'Non fourni'}</span>
    </div>
    
    <div class="info-row">
      <span class="label">🗺️ Départ:</span>
      <span class="value">${trip.from.address.split(',')[0]}</span>
    </div>
    
    <div class="info-row">
      <span class="label">🎯 Destination:</span>
      <span class="value">${trip.to.address.split(',')[0]}</span>
    </div>
    
    <div class="info-row">
      <span class="label">📏 Distance:</span>
      <span class="value">${trip.distance.toFixed(1)} km</span>
    </div>
    
    <div class="info-row">
      <span class="label">⏱️ Durée:</span>
      <span class="value">${Math.round(trip.duration)} min</span>
    </div>
    
    <div class="info-row">
      <span class="label">👥 Passagers:</span>
      <span class="value">${booking.passengers}</span>
    </div>
    
    <div class="info-row">
      <span class="label">🧳 Bagages:</span>
      <span class="value">${booking.luggage}</span>
    </div>
    
    <div class="total">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 18px; font-weight: bold;">💰 Prix Total:</span>
        <span style="font-size: 24px; font-weight: bold; color: #16a34a;">${trip.estimatedPrice.toFixed(2)}€</span>
      </div>
    </div>
    
    <div class="info-row">
      <span class="label">🕒 Réservé le:</span>
      <span class="value">${new Date().toLocaleString('fr-FR')}</span>
    </div>
  </div>
  
  <div class="footer">
    <p><strong>Taxi Bordeaux Solution</strong> - Service 24h/24 7j/7</p>
    <p>📞 06 67 23 78 22 | 🌐 taxibordeauxsolution.fr</p>
    <p><em>⚡ Prise en charge estimée: rapide</em></p>
  </div>
</body>
</html>`;

  const emailData = JSON.stringify({
    from: FROM_EMAIL,
    to: [TO_EMAIL],
    subject: `🚖 Nouvelle Réservation Taxi - ${reservationId}`,
    html: emailHTML
  });

  const options = {
    hostname: 'api.resend.com',
    port: 443,
    path: '/emails',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(emailData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Email de réservation envoyé avec succès');
          resolve(data);
        } else {
          console.error('❌ Erreur envoi email:', res.statusCode, data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erreur réseau email:', error.message);
      reject(error);
    });

    req.write(emailData);
    req.end();
  });
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  if (req.method === 'POST' && req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'taxi-bordeaux-backend',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Endpoint de réservation
  if (req.method === 'POST' && req.url === '/api/reservations') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const reservationData = JSON.parse(body);
        const reservationId = `TX-${Date.now()}`;
        
        // Log de la réservation reçue
        console.log('\n🚖 ===============================================');
        console.log('📧 NOUVELLE RÉSERVATION TAXI BORDEAUX');
        console.log('===============================================');
        console.log(`📋 Numéro: ${reservationId}`);
        console.log(`👤 Client: ${reservationData.customer.name}`);
        console.log(`📞 Téléphone: ${reservationData.customer.phone}`);
        console.log(`📧 Email: ${reservationData.customer.email || 'Non fourni'}`);
        console.log(`🗺️  Trajet: ${reservationData.trip.from.address}`);
        console.log(`     ➜ ${reservationData.trip.to.address}`);
        console.log(`📏 Distance: ${reservationData.trip.distance.toFixed(1)} km`);
        console.log(`⏱️  Durée: ${Math.round(reservationData.trip.duration)} min`);
        console.log(`💰 Prix: ${reservationData.trip.estimatedPrice.toFixed(2)}€`);
        console.log(`👥 Passagers: ${reservationData.booking.passengers}`);
        console.log(`🧳 Bagages: ${reservationData.booking.luggage}`);
        console.log(`🕒 Heure de réservation: ${new Date().toLocaleString('fr-FR')}`);
        console.log('===============================================\n');
        
        // Envoi de l'email de notification
        try {
          await sendReservationEmail(reservationData, reservationId);
        } catch (error) {
          console.log('⚠️  Email non envoyé:', error.message);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Réservation reçue avec succès',
          reservationId: reservationId,
          estimatedPickupTime: 'rapide',
          data: {
            ...reservationData,
            reservationId,
            status: 'confirmed',
            createdAt: new Date().toISOString()
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Données de réservation invalides'
        }));
      }
    });
    return;
  }

  // Simple pricing estimation endpoint
  if (req.method === 'POST' && req.url === '/api/maps/calculate-route') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { origin, destination } = data;
        
        // Simple distance estimation (this would normally use Google Maps)
        const estimatedDistance = 10; // km
        const estimatedPrice = 2.80 + (estimatedDistance * 2.12); // Base + day rate
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            route: {
              distance: { value: estimatedDistance * 1000, text: `${estimatedDistance} km` },
              duration: { value: estimatedDistance * 60 * 2, text: `${Math.round(estimatedDistance * 2)} min` }
            },
            pricing: {
              totalPrice: Math.round(estimatedPrice * 100) / 100,
              currency: 'EUR',
              breakdown: {
                baseFare: 2.80,
                distanceFare: estimatedDistance * 2.12
              }
            }
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON data'
        }));
      }
    });
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    error: 'Route not found',
    availableRoutes: [
      'GET /health',
      'POST /api/test',
      'POST /api/maps/calculate-route'
    ]
  }));
});

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        🚖 TAXI BORDEAUX SOLUTION                             ║
║                           Backend API Simplifié                              ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ • Serveur HTTP simple démarré                                                ║
║ • Port: ${PORT}                                                             ║
║ • Mode: Development (Simple)                                                 ║
║ • API disponible sur: http://localhost:${PORT}                                ║
║                                                                               ║
║ Endpoints disponibles:                                                       ║
║ → GET  /health              - Health check                                   ║
║ → POST /api/test            - Test API                                       ║
║ → POST /api/reservations    - Réception des réservations                    ║
║ → POST /api/maps/calculate-route - Calcul simple d'itinéraire               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
});

server.on('error', (error) => {
  console.error('Erreur serveur:', error);
});

process.on('SIGTERM', () => {
  console.log('Arrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});