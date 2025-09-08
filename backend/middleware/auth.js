/**
 * MIDDLEWARE D'AUTHENTIFICATION
 * Gestion des tokens JWT et authentification
 */

import jwt from 'jsonwebtoken'
import { asyncHandler } from './errorHandler.js'

const JWT_SECRET = process.env.JWT_SECRET || 'taxi_bordeaux_jwt_secret_2025_very_secure_key_minimum_64_chars_long'

/**
 * Middleware d'authentification JWT
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token = null
  
  // Récupérer le token depuis le header Authorization
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  
  // Ou depuis un cookie (optionnel)
  if (!token && req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token d\'accès requis',
      code: 'NO_TOKEN'
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide ou expiré',
      code: 'INVALID_TOKEN'
    })
  }
})

/**
 * Middleware pour vérifier les rôles administrateur
 */
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise',
      code: 'AUTH_REQUIRED'
    })
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès administrateur requis',
      code: 'ADMIN_REQUIRED'
    })
  }
  
  next()
})

/**
 * Middleware optionnel - authentifie si token présent
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = decoded
    } catch (error) {
      // Token invalide, mais on continue sans authentifier
      req.user = null
    }
  }
  
  next()
})

/**
 * Génerer un token JWT
 */
export const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

/**
 * Générer un token de rafraîchissement
 */
export const generateRefreshToken = (payload, expiresIn = '7d') => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh'
  return jwt.sign(payload, refreshSecret, { expiresIn })
}

/**
 * Vérifier un token de rafraîchissement
 */
export const verifyRefreshToken = (token) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh'
  return jwt.verify(token, refreshSecret)
}

export default {
  authenticate,
  requireAdmin,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
}