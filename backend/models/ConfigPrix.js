import mongoose from 'mongoose'

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

export default mongoose.models?.ConfigPrix || mongoose.model('ConfigPrix', ConfigPrixSchema)
