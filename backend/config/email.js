/**
 * CONFIGURATION EMAIL RESEND MULTILINGUE
 * Service professionnel avec templates HTML et queue d'envoi
 */

import { Resend } from 'resend'
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

let resendClient = null

/**
 * Configuration et initialisation du client Resend
 */
export const setupEmail = () => {
  try {
    // Vérification des variables d'environnement
    if (!process.env.RESEND_API_KEY) {
      logger.warn('⚠️ Configuration Resend incomplète - service email désactivé')
      return null
    }

    resendClient = new Resend(process.env.RESEND_API_KEY)

    logger.info('✅ Service email Resend configuré', {
      from: process.env.RESEND_FROM_EMAIL
    })

    return resendClient

  } catch (error) {
    logger.error('❌ Erreur configuration email Resend', { error: error.message })
    throw error
  }
}

/**
 * Service Email avec queue et retry
 */
export class EmailService {
  constructor(resendClient) {
    this.resendClient = resendClient
    this.queue = []
    this.processing = false
    this.templates = new Map()
    this.defaultFrom = process.env.RESEND_FROM_EMAIL || 'contact@taxibordeauxsolution.fr'
    this.defaultTo = process.env.RESEND_TO_EMAIL || 'yassinedriyd@gmail.com'
  }

  /**
   * Ajout d'un email à la queue
   */
  async queueEmail(emailData, priority = 'normal') {
    const email = {
      id: this.generateEmailId(),
      ...emailData,
      priority: priority,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      status: 'queued'
    }

    // Insertion selon la priorité
    if (priority === 'high') {
      this.queue.unshift(email)
    } else {
      this.queue.push(email)
    }

    logger.debug('Email ajouté à la queue', { 
      id: email.id, 
      to: email.to, 
      template: email.template,
      priority: priority
    })

    // Démarrer le traitement si pas déjà en cours
    if (!this.processing) {
      this.processQueue()
    }

    return email.id
  }

  /**
   * Traitement de la queue d'emails
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true
    logger.debug('Démarrage traitement queue email', { queueSize: this.queue.length })

    while (this.queue.length > 0) {
      const email = this.queue.shift()
      
      try {
        await this.sendSingleEmail(email)
        email.status = 'sent'
        email.sentAt = new Date()
        logger.info('Email envoyé avec succès', { id: email.id, to: email.to })

      } catch (error) {
        email.attempts++
        email.lastError = error.message
        email.lastAttemptAt = new Date()

        logger.error('Erreur envoi email', { 
          id: email.id, 
          to: email.to,
          attempt: email.attempts,
          error: error.message 
        })

        // Retry si pas encore atteint le maximum
        if (email.attempts < email.maxAttempts) {
          email.status = 'retry'
          // Backoff exponentiel: 1s, 4s, 9s
          const delay = Math.pow(email.attempts, 2) * 1000
          setTimeout(() => {
            this.queue.push(email) // Remettre en queue
          }, delay)
        } else {
          email.status = 'failed'
          logger.error('Email définitivement échoué', { id: email.id, to: email.to })
        }
      }

      // Petit délai entre les envois pour éviter le spam
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.processing = false
    logger.debug('Traitement queue email terminé')
  }

  /**
   * Envoi d'un email individuel via Resend
   */
  async sendSingleEmail(email) {
    if (!this.resendClient) {
      throw new Error('Client Resend non configuré')
    }

    const emailData = {
      from: this.defaultFrom,
      to: [email.to, this.defaultTo], // Envoie au client ET à l'admin
      subject: email.subject,
      html: email.html,
      text: email.text || this.htmlToText(email.html),
      headers: {
        'X-Mailer': 'Taxi Bordeaux Solution',
        'X-Email-ID': email.id,
        'X-Template': email.template || 'custom'
      }
    }

    const result = await this.resendClient.emails.send(emailData)
    
    return {
      messageId: result.data?.id || 'unknown',
      response: 'sent',
      envelope: { from: this.defaultFrom, to: [email.to, this.defaultTo] }
    }
  }

  /**
   * Envoi d'email de confirmation de réservation
   */
  async sendReservationConfirmation(reservation, language = 'fr') {
    try {
      const template = await this.getTemplate('confirmation', language)
      const html = this.renderTemplate(template, {
        reservation: reservation,
        customer: reservation.customer,
        trip: reservation.trip,
        booking: reservation.booking,
        pricing: reservation.pricing,
        formattedPrice: reservation.formattedPrice,
        language: language
      })

      const subject = this.getSubject('confirmation', language, {
        reservationId: reservation.reservationId
      })

      return await this.queueEmail({
        to: reservation.customer.email,
        subject: subject,
        html: html,
        template: 'confirmation',
        language: language,
        reservationId: reservation.reservationId
      }, 'high')

    } catch (error) {
      logger.error('Erreur envoi confirmation réservation', { 
        error: error.message, 
        reservationId: reservation.reservationId 
      })
      throw error
    }
  }

  /**
   * Envoi d'email d'assignation de chauffeur
   */
  async sendDriverAssigned(reservation, language = 'fr') {
    try {
      const template = await this.getTemplate('driver-assigned', language)
      const html = this.renderTemplate(template, {
        reservation: reservation,
        customer: reservation.customer,
        driver: reservation.driver,
        trip: reservation.trip,
        language: language
      })

      const subject = this.getSubject('driver-assigned', language, {
        reservationId: reservation.reservationId,
        driverName: reservation.driver.name
      })

      return await this.queueEmail({
        to: reservation.customer.email,
        subject: subject,
        html: html,
        template: 'driver-assigned',
        language: language,
        reservationId: reservation.reservationId
      }, 'high')

    } catch (error) {
      logger.error('Erreur envoi assignation chauffeur', { 
        error: error.message, 
        reservationId: reservation.reservationId 
      })
      throw error
    }
  }

  /**
   * Envoi d'email d'annulation
   */
  async sendCancellation(reservation, reason = '', language = 'fr') {
    try {
      const template = await this.getTemplate('cancellation', language)
      const html = this.renderTemplate(template, {
        reservation: reservation,
        customer: reservation.customer,
        reason: reason,
        language: language
      })

      const subject = this.getSubject('cancellation', language, {
        reservationId: reservation.reservationId
      })

      return await this.queueEmail({
        to: reservation.customer.email,
        subject: subject,
        html: html,
        template: 'cancellation',
        language: language,
        reservationId: reservation.reservationId,
        reason: reason
      }, 'normal')

    } catch (error) {
      logger.error('Erreur envoi annulation', { 
        error: error.message, 
        reservationId: reservation.reservationId 
      })
      throw error
    }
  }

  /**
   * Récupération d'un template HTML
   */
  async getTemplate(templateName, language) {
    const cacheKey = `${templateName}-${language}`
    
    if (this.templates.has(cacheKey)) {
      return this.templates.get(cacheKey)
    }

    try {
      // Lecture du fichier template
      const fs = await import('fs/promises')
      const templatePath = `./templates/emails/${templateName}-${language}.html`
      const templateContent = await fs.readFile(templatePath, 'utf8')
      
      this.templates.set(cacheKey, templateContent)
      return templateContent

    } catch (error) {
      logger.error('Erreur lecture template email', { 
        templateName, 
        language, 
        error: error.message 
      })
      
      // Template par défaut en cas d'erreur
      return this.getDefaultTemplate(templateName, language)
    }
  }

  /**
   * Template par défaut si fichier introuvable
   */
  getDefaultTemplate(templateName, language) {
    const texts = {
      fr: {
        greeting: 'Bonjour',
        footer: 'Cordialement,<br>L\'équipe Taxi Bordeaux Solution',
        contact: 'Besoin d\'aide ? Contactez-nous au 06 67 23 78 22'
      },
      en: {
        greeting: 'Hello',
        footer: 'Best regards,<br>Taxi Bordeaux Solution Team',
        contact: 'Need help? Contact us at +33 6 67 23 78 22'
      },
      es: {
        greeting: 'Hola',
        footer: 'Saludos,<br>Equipo Taxi Bordeaux Solution',
        contact: '¿Necesita ayuda? Contáctenos al +33 6 67 23 78 22'
      }
    }

    const t = texts[language] || texts.fr

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Taxi Bordeaux Solution</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2>${t.greeting},</h2>
            <p>{{content}}</p>
            <br>
            <p>${t.footer}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">${t.contact}</p>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Rendu d'un template avec variables
   */
  renderTemplate(template, variables) {
    let rendered = template

    // Fonction pour accéder aux propriétés imbriquées
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null
      }, obj)
    }

    // Formater les dates
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return dateString
      }
    }

    // Remplacer toutes les variables {{path.to.property}}
    rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      // Cas spéciaux pour le formatage
      if (path === 'booking.scheduledDateTime') {
        const value = getNestedValue(variables, path)
        return value ? formatDate(value) : match
      }

      // Cas général
      const value = getNestedValue(variables, path)
      
      if (value !== null && value !== undefined) {
        return String(value)
      }
      
      return match // Garder le placeholder si pas de valeur
    })

    return rendered
  }

  /**
   * Génération des sujets d'emails
   */
  getSubject(templateType, language, variables = {}) {
    const subjects = {
      fr: {
        confirmation: `Confirmation réservation ${variables.reservationId} - Taxi Bordeaux`,
        'driver-assigned': `Chauffeur ${variables.driverName} assigné - ${variables.reservationId}`,
        cancellation: `Annulation réservation ${variables.reservationId}`,
        receipt: `Reçu trajet ${variables.reservationId} - Taxi Bordeaux`
      },
      en: {
        confirmation: `Booking confirmation ${variables.reservationId} - Taxi Bordeaux`,
        'driver-assigned': `Driver ${variables.driverName} assigned - ${variables.reservationId}`,
        cancellation: `Booking cancellation ${variables.reservationId}`,
        receipt: `Trip receipt ${variables.reservationId} - Taxi Bordeaux`
      },
      es: {
        confirmation: `Confirmación reserva ${variables.reservationId} - Taxi Bordeaux`,
        'driver-assigned': `Conductor ${variables.driverName} asignado - ${variables.reservationId}`,
        cancellation: `Cancelación reserva ${variables.reservationId}`,
        receipt: `Recibo viaje ${variables.reservationId} - Taxi Bordeaux`
      }
    }

    return subjects[language]?.[templateType] || subjects.fr[templateType] || 'Taxi Bordeaux Solution'
  }

  /**
   * Conversion HTML vers texte brut
   */
  htmlToText(html) {
    if (!html) return ''
    
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
  }

  /**
   * Génération d'ID unique pour email
   */
  generateEmailId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Statistiques de la queue
   */
  getQueueStats() {
    return {
      queueSize: this.queue.length,
      processing: this.processing,
      queueByStatus: this.queue.reduce((acc, email) => {
        acc[email.status] = (acc[email.status] || 0) + 1
        return acc
      }, {}),
      queueByPriority: this.queue.reduce((acc, email) => {
        acc[email.priority] = (acc[email.priority] || 0) + 1
        return acc
      }, {})
    }
  }

  /**
   * Test de connexion SMTP
   */
  async testConnection() {
    if (!this.transporter) {
      throw new Error('Transporteur email non configuré')
    }

    try {
      await this.transporter.verify()
      return { success: true, message: 'Connexion SMTP OK' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

/**
 * Instance globale du service email
 */
export const getEmailService = () => {
  if (!resendClient) {
    logger.warn('Service email Resend non disponible')
    return null
  }
  return new EmailService(resendClient)
}

export { resendClient }
export default { setupEmail, getEmailService, EmailService }