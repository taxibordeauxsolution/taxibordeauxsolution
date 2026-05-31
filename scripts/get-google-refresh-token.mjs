// Génère un nouveau GOOGLE_CALENDAR_REFRESH_TOKEN pour la création d'événements agenda.
// Usage : node scripts/get-google-refresh-token.mjs
//
// PRÉREQUIS :
//  1. Dans Google Cloud Console > API et services > Identifiants > votre client OAuth,
//     ajoutez cette URL dans "URI de redirection autorisés" :
//        http://localhost:5555/oauth2callback
//  2. Dans "Écran de consentement OAuth", publiez l'application (statut "En production")
//     pour que le token n'expire plus au bout de 7 jours.

import http from 'node:http'
import { readFileSync } from 'node:fs'
import { exec } from 'node:child_process'

const PORT = 5555
const REDIRECT = `http://localhost:${PORT}/oauth2callback`
const SCOPE = 'https://www.googleapis.com/auth/calendar.events'

function readEnv(key) {
  try {
    const content = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    const line = content.split('\n').find(l => l.startsWith(key + '='))
    if (!line) return ''
    return line.slice(key.length + 1).trim().replace(/^"|"$/g, '')
  } catch { return '' }
}

const CLIENT_ID = readEnv('GOOGLE_CLIENT_ID')
const CLIENT_SECRET = readEnv('GOOGLE_CLIENT_SECRET')

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET manquant dans .env.local')
  process.exit(1)
}

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT,
  response_type: 'code',
  scope: SCOPE,
  access_type: 'offline',
  prompt: 'consent',
}).toString()

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/oauth2callback')) { res.end('...'); return }
  const url = new URL(req.url, REDIRECT)
  const code = url.searchParams.get('code')
  const err = url.searchParams.get('error')
  if (err) { res.end('Erreur : ' + err); console.error('❌', err); server.close(); return }
  if (!code) { res.end('Pas de code reçu.'); return }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT,
      grant_type: 'authorization_code',
    }),
  })
  const data = await tokenRes.json()

  if (data.refresh_token) {
    res.end('✅ Refresh token obtenu ! Vous pouvez fermer cet onglet et retourner au terminal.')
    console.log('\n✅ NOUVEAU REFRESH TOKEN :\n')
    console.log(data.refresh_token)
    console.log('\n👉 À FAIRE :')
    console.log('   1. Coller dans .env.local  ->  GOOGLE_CALENDAR_REFRESH_TOKEN=' + data.refresh_token)
    console.log('   2. Coller la MÊME valeur dans Vercel (Settings > Environment Variables > Production)')
    console.log('   3. Redéployer sur Vercel\n')
  } else {
    res.end('❌ Pas de refresh_token reçu. Détails dans le terminal.')
    console.error('\n❌ Réponse Google :', JSON.stringify(data, null, 2))
    console.error('\nAstuce : si "invalid_grant", revérifiez l\'URI de redirection et le client_secret.\n')
  }
  server.close()
})

server.listen(PORT, () => {
  console.log('\n1) Vérifiez que cette URL est bien dans les "URI de redirection autorisés" du client OAuth :')
  console.log('   ' + REDIRECT)
  console.log('\n2) Ouverture du navigateur pour autoriser l\'accès à l\'agenda...')
  console.log('   (si rien ne s\'ouvre, copiez ce lien dans votre navigateur) :\n')
  console.log('   ' + authUrl + '\n')
  const cmd = process.platform === 'win32'
    ? `start "" "${authUrl}"`
    : process.platform === 'darwin'
      ? `open "${authUrl}"`
      : `xdg-open "${authUrl}"`
  exec(cmd)
})
