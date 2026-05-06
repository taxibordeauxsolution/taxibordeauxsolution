/**
 * ROUTES API ADMINISTRATION
 * Gestion des prix et forfaits via interface admin
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import { asyncHandler } from '../middleware/errorHandler.js'
import ConfigPrix from '../models/ConfigPrix.js'
import Forfait from '../models/Forfait.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'taxi_bordeaux_jwt_secret_2025_very_secure_key_minimum_64_chars_long'
const ADMIN_PIN  = process.env.ADMIN_PIN || '3327'

// ─── Middleware vérification token admin ───────────────────────────────────
const requireAdmin = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Non autorisé' })
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET)
    if (payload.role !== 'admin') throw new Error('Role invalide')
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Token invalide ou expiré' })
  }
}

// ─── Helpers ConfigPrix ────────────────────────────────────────────────────
const getConfig = async () => {
  let config = await ConfigPrix.findOne()
  if (!config) config = await ConfigPrix.create({})
  return config
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────
router.post('/login', asyncHandler(async (req, res) => {
  const { pin } = req.body
  if (!pin || String(pin) !== String(ADMIN_PIN)) {
    return res.status(401).json({ success: false, message: 'PIN incorrect' })
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ success: true, token })
}))

// ─── PRIX DE BASE ──────────────────────────────────────────────────────────
router.get('/prix', requireAdmin, asyncHandler(async (req, res) => {
  const config = await getConfig()
  res.json({ success: true, data: config })
}))

router.put('/prix', requireAdmin, asyncHandler(async (req, res) => {
  const {
    priseEnCharge, tarifKmJour, tarifKmNuit,
    fraisApproche, courseMini, courseMiniDe, heureDebutNuit, heureFinNuit
  } = req.body

  const config = await getConfig()
  if (priseEnCharge  !== undefined) config.priseEnCharge  = priseEnCharge
  if (tarifKmJour    !== undefined) config.tarifKmJour    = tarifKmJour
  if (tarifKmNuit    !== undefined) config.tarifKmNuit    = tarifKmNuit
  if (fraisApproche  !== undefined) config.fraisApproche  = fraisApproche
  if (courseMini     !== undefined) config.courseMini     = courseMini
  if (courseMiniDe   !== undefined) config.courseMiniDe   = courseMiniDe
  if (heureDebutNuit !== undefined) config.heureDebutNuit = heureDebutNuit
  if (heureFinNuit   !== undefined) config.heureFinNuit   = heureFinNuit
  await config.save()

  res.json({ success: true, data: config })
}))

// ─── FORFAITS ──────────────────────────────────────────────────────────────
router.get('/forfaits', requireAdmin, asyncHandler(async (req, res) => {
  const forfaits = await Forfait.find().sort({ createdAt: -1 })
  res.json({ success: true, data: forfaits })
}))

router.post('/forfaits', requireAdmin, asyncHandler(async (req, res) => {
  const { nom, pointA, pointB, prixJour, prixNuit, actif } = req.body
  const forfait = await Forfait.create({ nom, pointA, pointB, prixJour, prixNuit, actif })
  res.status(201).json({ success: true, data: forfait })
}))

router.put('/forfaits/:id', requireAdmin, asyncHandler(async (req, res) => {
  const forfait = await Forfait.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!forfait) return res.status(404).json({ success: false, message: 'Forfait introuvable' })
  res.json({ success: true, data: forfait })
}))

router.delete('/forfaits/:id', requireAdmin, asyncHandler(async (req, res) => {
  await Forfait.findByIdAndDelete(req.params.id)
  res.json({ success: true, message: 'Forfait supprimé' })
}))

// ─── HEALTH / CONFIG (anciennes routes conservées) ─────────────────────────
router.get('/health', asyncHandler(async (req, res) => {
  res.json({ success: true, timestamp: new Date().toISOString(), uptime: process.uptime() })
}))

router.get('/stats', asyncHandler(async (req, res) => {
  res.json({ success: true, data: { reservations: { total: 0 } } })
}))

router.get('/config', asyncHandler(async (req, res) => {
  res.json({ success: true, data: { pricing: {}, languages: ['fr', 'en', 'es'] } })
}))

export default router
