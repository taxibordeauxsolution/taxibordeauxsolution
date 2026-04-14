import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) throw new Error('MONGODB_URI manquant dans .env.local')

// Cache de connexion pour éviter de recréer à chaque requête (Next.js serverless)
const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } =
  (global as any).__mongoose || { conn: null, promise: null }
;(global as any).__mongoose = cached

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  cached.conn = await cached.promise
  return cached.conn
}

// ── Modèle ConfigPrix ─────────────────────────────────────────────────────
const ConfigPrixSchema = new mongoose.Schema({
  priseEnCharge:  { type: Number, default: 2.83 },
  tarifKmJour:    { type: Number, default: 2.16 },
  tarifKmNuit:    { type: Number, default: 3.24 },
  fraisApproche:  { type: Number, default: 7.20 },
  courseMini:     { type: Number, default: 28.00 },
  heureDebutNuit: { type: String, default: '19:00' },
  heureFinNuit:   { type: String, default: '06:00' },
}, { timestamps: true })

export const ConfigPrix =
  mongoose.models.ConfigPrix || mongoose.model('ConfigPrix', ConfigPrixSchema)

// ── Modèle Forfait ────────────────────────────────────────────────────────
const PointSchema = new mongoose.Schema({
  adresse: { type: String, required: true },
  lat:     { type: Number, required: true },
  lng:     { type: Number, required: true },
  zone:    { type: [{ lat: Number, lng: Number }], default: [] }
}, { _id: false })

const ForfaitSchema = new mongoose.Schema({
  nom:      { type: String, required: true },
  pointA:   { type: PointSchema, required: true },
  pointB:   { type: PointSchema, required: true },
  prixJour: { type: Number, required: true },
  prixNuit: { type: Number, required: true },
  actif:    { type: Boolean, default: true },
}, { timestamps: true })

export const Forfait =
  mongoose.models.Forfait || mongoose.model('Forfait', ForfaitSchema)
