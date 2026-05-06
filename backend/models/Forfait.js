import mongoose from 'mongoose'

// Un point de forfait : adresse, coordonnées, et zone polygone optionnelle
const PointSchema = new mongoose.Schema({
  adresse: { type: String, required: true },
  lat:     { type: Number, required: true },
  lng:     { type: Number, required: true },
  // Polygone dessiné sur la carte : tableau de {lat, lng}
  // Si vide, on utilise un rayon de 500m autour de lat/lng
  zone:    { type: [{ lat: Number, lng: Number }], default: [] }
}, { _id: false })

const ForfaitSchema = new mongoose.Schema({
  nom:      { type: String, required: true },
  pointA:   { type: PointSchema, required: true },
  pointB:   { type: PointSchema, required: true },
  prixJour: { type: Number, required: true },
  prixNuit: { type: Number, required: true },
  prixMinJour: { type: Number, default: null },
  prixMinNuit: { type: Number, default: null },
  actif:    { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models?.Forfait || mongoose.model('Forfait', ForfaitSchema)
