import mongoose from 'mongoose'

// Cache de connexion pour éviter de recréer à chaque requête (Next.js serverless)
const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } =
  (global as any).__mongoose || { conn: null, promise: null }
;(global as any).__mongoose = cached

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) throw new Error('MONGODB_URI manquant dans les variables d\'environnement Vercel')
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    // Nettoyer les paramètres non supportés via le parseur URL natif
    let cleanUri = MONGODB_URI
    try {
      const url = new URL(MONGODB_URI)
      url.searchParams.delete('retryWrites')
      url.searchParams.delete('w')
      url.searchParams.delete('appName')
      cleanUri = url.toString()
    } catch { /* garde l'URI d'origine si le parsing échoue */ }

    cached.promise = mongoose
      .connect(cleanUri, { bufferCommands: false, serverSelectionTimeoutMS: 5000 })
      .catch(err => { cached.promise = null; throw err })
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
  courseMiniDe:   { type: Number, default: 20.00 },
  heureDebutNuit: { type: String, default: '19:00' },
  heureFinNuit:   { type: String, default: '07:00' },
  remiseActive:       { type: Boolean, default: false },
  remiseSeuilKm:      { type: Number, default: 50 },
  remisePourcentage:  { type: Number, default: 10 },
  suppApprocheActive:  { type: Boolean, default: false },
  suppApprocheSeuilKm: { type: Number, default: 50 },
  itineraireCourt:     { type: Boolean, default: true },
  tarifNuitDegressifActive: { type: Boolean, default: false },
  tarifNuitDegressifSeuilKm: { type: Number, default: 30 },
  tarifNuitDegressifPrixKm: { type: Number, default: 2.50 },
  tarifNuitDegressifMode: { type: String, default: 'degressif' },
  tarifJourDegressifActive: { type: Boolean, default: false },
  tarifJourDegressifSeuilKm: { type: Number, default: 30 },
  tarifJourDegressifPrixKm: { type: Number, default: 1.80 },
  tarifJourDegressifMode: { type: String, default: 'degressif' },
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

// ── Modèle Estimation ────────────────────────────────────────────────────
const EstimationSchema = new mongoose.Schema({
  from:          { type: String, required: true },
  to:            { type: String, required: true },
  distance:      { type: Number, required: true },
  duration:      { type: Number, required: true },
  price:         { type: Number, required: true },
  fourchette:    {
    de: { type: Number },
    a:  { type: Number },
  },
  tariffType:    { type: String, required: true },
  isForfait:     { type: Boolean, default: false },
  departureDate: { type: Date },
  createdAt:     { type: Date, default: Date.now },
  // ── Champs lead (ajoutés feat/capture-lead-email) ──
  email:         { type: String, default: null },
  telephone:     { type: String, default: null },
  dateSouhaitee: { type: Date, default: null },
  rgpdConsent:   { type: Boolean, default: false },
  leadCreatedAt: { type: Date, default: null },
  statut:        { type: String, enum: ['estimation_seule', 'lead', 'contacte', 'converti', 'perdu'], default: 'estimation_seule' },
  notes:         { type: String, default: null },
  utmSource:     { type: String, default: null },
  utmMedium:     { type: String, default: null },
  utmCampaign:   { type: String, default: null },
})

EstimationSchema.index({ createdAt: -1 })

export const Estimation =
  mongoose.models.Estimation || mongoose.model('Estimation', EstimationSchema)

// ── Modèle Reservation ───────────────────────────────────────────────────
const ReservationSchema = new mongoose.Schema({
  reservationId:  { type: String, required: true, unique: true },
  status:         { type: String, default: 'en_attente', enum: ['en_attente', 'confirmee', 'terminee', 'annulee'] },
  customer: {
    name:  { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
  },
  trip: {
    from:     { type: String, required: true },
    to:       { type: String, required: true },
    distance: { type: Number, required: true },
  },
  pricing: {
    totalPrice: { type: Number, required: true },
    fourchette: {
      de: { type: Number },
      a:  { type: Number },
    },
    tariffType: { type: String },
    isForfait:  { type: Boolean, default: false },
  },
  passengers: { type: Number, default: 1 },
  luggage:    { type: Number, default: 0 },
  notes:      { type: String, default: '' },
  pickupDate: { type: Date, required: true },
  invoiceNumber: { type: Number, default: null },
  rappel24h: { type: Boolean, default: false },
  rappel1h:  { type: Boolean, default: false },
  googleEventId: { type: String, default: '' },
}, { timestamps: true })

ReservationSchema.index({ pickupDate: 1 })
ReservationSchema.index({ status: 1 })
ReservationSchema.index({ createdAt: -1 })

export const Reservation =
  mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema)

// ── Modèle Counter (numéros de facture incrémentaux) ─────────────────────
const CounterSchema = new mongoose.Schema({
  _id:  { type: String, required: true },
  seq:  { type: Number, default: 0 },
})

export const Counter =
  mongoose.models.Counter || mongoose.model('Counter', CounterSchema)
