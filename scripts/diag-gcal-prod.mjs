// Diagnostic agenda avec les variables EXACTES de la prod (.env.prodcheck)
import { readFileSync } from 'node:fs'

function readEnv(key, file) {
  const content = readFileSync(new URL('../' + file, import.meta.url), 'utf8')
  const line = content.split('\n').find(l => l.startsWith(key + '='))
  if (!line) return ''
  return line.slice(key.length + 1).trim().replace(/^"|"$/g, '').replace(/\r$/, '')
}

const file = process.argv[2] || '.env.prodcheck'
const cid = readEnv('GOOGLE_CLIENT_ID', file)
const sec = readEnv('GOOGLE_CLIENT_SECRET', file)
const tok = readEnv('GOOGLE_CALENDAR_REFRESH_TOKEN', file)
const cal = readEnv('GOOGLE_CALENDAR_ID', file) || 'primary'

console.log(`\n=== ${file} ===`)
console.log('client_id :', cid.slice(0, 30) + '... (len ' + cid.length + ')')
console.log('secret    :', sec.slice(0, 12) + '... (len ' + sec.length + ')')
console.log('token     :', tok.slice(0, 10) + '... (len ' + tok.length + ')')
console.log('calendarId:', JSON.stringify(cal))

if (!cid || !sec || !tok) { console.error('\n❌ Une variable est VIDE'); process.exit(1) }

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_id: cid, client_secret: sec, refresh_token: tok, grant_type: 'refresh_token' }),
})
const tokenData = await tokenRes.json()
console.log('\n--- token exchange ---')
console.log('status:', tokenRes.status, '| access_token:', tokenData.access_token ? 'OUI' : 'NON', '| error:', tokenData.error || '-', tokenData.error_description || '')
console.log('scope:', tokenData.scope || '-')

if (!tokenData.access_token) { console.error('\n❌ ECHEC token — c\'est la cause'); process.exit(1) }

const start = new Date(Date.now() + 86400000)
const end = new Date(start.getTime() + 30 * 60000)
const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal)}/events`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    summary: 'TEST diag prod (supprimer)',
    start: { dateTime: start.toISOString(), timeZone: 'Europe/Paris' },
    end: { dateTime: end.toISOString(), timeZone: 'Europe/Paris' },
  }),
})
const calData = await calRes.json()
console.log('\n--- creation event ---')
console.log('status:', calRes.status, '| id:', calData.id || 'NON', '| error:', calData.error?.message || '-')
console.log(calData.id ? '\n✅ AGENDA OK avec ces identifiants' : '\n❌ ECHEC creation event')
