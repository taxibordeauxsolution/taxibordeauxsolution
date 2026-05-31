// Diagnostic : affiche les dernières réservations et leur googleEventId
import { readFileSync } from 'node:fs'
import mongoose from 'mongoose'

function readEnv(key, file = '.env.local') {
  try {
    const content = readFileSync(new URL('../' + file, import.meta.url), 'utf8')
    const line = content.split('\n').find(l => l.startsWith(key + '='))
    if (!line) return ''
    return line.slice(key.length + 1).trim().replace(/^"|"$/g, '')
  } catch { return '' }
}

const uri = readEnv('MONGODB_URI')
if (!uri) { console.error('MONGODB_URI manquant'); process.exit(1) }

await mongoose.connect(uri)
const Reservation = mongoose.connection.collection('reservations')

const last = await Reservation.find({}).sort({ createdAt: -1 }).limit(6).toArray()
console.log('\n=== 6 dernières réservations ===\n')
for (const r of last) {
  console.log(`${r.reservationId}  | status=${r.status} | pickup=${r.pickupDate ? new Date(r.pickupDate).toLocaleString('fr-FR',{timeZone:'Europe/Paris'}) : '—'} | gcalEventId=${r.googleEventId ? '✅ ' + r.googleEventId : '❌ VIDE'} | créé=${new Date(r.createdAt).toLocaleString('fr-FR',{timeZone:'Europe/Paris'})}`)
}
console.log('')
await mongoose.disconnect()
