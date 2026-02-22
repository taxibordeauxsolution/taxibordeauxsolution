'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, MapPin, Clock, Star, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import TaxiBookingHomePreview from './components/TaxiBookingHomePreview'
import { motion } from 'motion/react'

export default function HomePage() {
  const phoneNumber = "0667237822"
  const phoneDisplay = "06 67 23 78 22"


  return (
    <div className="min-h-screen">
      
      {/* Hero Section Ultra-Moderne */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent"></div>
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
            
            {/* Contenu principal */}
            <div className="space-y-8 lg:space-y-12">
              
              {/* Badge de rapidité */}
              <motion.div 
                className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-3 text-green-400 font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap size={20} />
                </motion.div>
                <span>Taxi rapide à Bordeaux</span>
              </motion.div>
              
              <div className="space-y-6">
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    LA Solution
                  </span>
                  <br />
                  <motion.span 
                    className="text-yellow-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    Taxi Bordeaux
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-2xl font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  Service fiable et régulier disponible 24h/24. 
                  <strong className="text-white font-semibold"> Réservation instantanée</strong>, 
                  prise en charge rapide dans toute la métropole bordelaise.
                </motion.p>
              </div>

              {/* CTA Buttons Modernes */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 lg:gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <motion.a
                  href="#reservation"
                  className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 text-center shadow-2xl hover:shadow-green-500/25"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="flex items-center justify-center gap-3">
                    📱 Réserver un Taxi
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </span>
                </motion.a>
                
                <motion.a
                  href={`tel:${phoneNumber}`}
                  className="group relative bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 text-center shadow-xl hover:shadow-2xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 12 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Phone size={20} />
                    </motion.div>
                    {phoneDisplay}
                  </span>
                </motion.a>
              </motion.div>

              {/* Stats élégantes */}
              <motion.div 
                className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div 
                    className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                  >
                    Rapide
                  </motion.div>
                  <div className="text-sm text-slate-400 font-medium">Prise en charge</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div 
                    className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                  >
                    24/7
                  </motion.div>
                  <div className="text-sm text-slate-400 font-medium">Service continu</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div 
                    className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 2.0 }}
                  >
                    100%
                  </motion.div>
                  <div className="text-sm text-slate-400 font-medium">Fiabilité</div>
                </motion.div>
              </motion.div>
            </div>

            {/* Photo Hero - Place de la Bourse */}
            <div className="hidden lg:block relative">
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <Image 
                    src="/images/hero/Place de la bourse Bordeaux.jpg" 
                    alt="Taxi Bordeaux Solution - Place de la Bourse" 
                    width={600}
                    height={500}
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-white font-semibold">Disponible Maintenant</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">Taxi Bordeaux Solution</h3>
                        <p className="text-white/80 text-sm">Service fiable • Prise en charge rapide</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Section Module de Réservation */}
      <section className="bg-white relative">
        {/* Module de réservation complet */}
        <TaxiBookingHomePreview />
      </section>

      {/* Services Section Moderne */}
      <section id="services" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div 
              className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              NOS SERVICES TAXI BORDEAUX
            </motion.div>
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              La Solution Transport
              <span className="text-blue-600"> à Bordeaux</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-slate-600 max-w-3xl mx-auto font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Service taxi professionnel dans toute la métropole. 
              Réservation simple, prise en charge rapide garantie.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            
            {/* Service Aéroport */}
            <Link href="/aeroport" className="block">
              <motion.div 
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-200 overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                viewport={{ once: true }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Photo du service aéroport */}
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src="/images/hero/Hall aéroport Bordeaux.jpg" 
                    alt="Hall Aéroport Bordeaux Mérignac" 
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                <div className="relative p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Taxi Aéroport Bordeaux Mérignac
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Liaison directe aéroport Bordeaux-Mérignac. 
                    Prise en charge rapide, suivi des vols, service fiable 24h/24.
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Service Gare */}
            <Link href="/gare" className="block">
              <motion.div 
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-green-200 overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                viewport={{ once: true }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Photo du service gare */}
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src="/images/hero/gare de bordeaux.jpg" 
                    alt="Gare de Bordeaux Saint-Jean - Service Taxi" 
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                <div className="relative p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Taxi Gare Saint-Jean Bordeaux
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Transport gare SNCF Saint-Jean. 
                    Arrivée ponctuelle, aide aux bagages, connexion immédiate.
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Service Ville */}
            <motion.div 
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-yellow-200 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Photo du service centre-ville */}
              <div className="relative h-48 overflow-hidden">
                <Image 
                  src="/images/hero/Panorama Bordeaux.jpg" 
                  alt="Panorama Bordeaux - Vue sur la ville" 
                  width={400}
                  height={192}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="relative p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Taxi Bordeaux Centre-Ville
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Courses urbaines dans Bordeaux. 
                  Prise en charge rapide, connaissance parfaite de la ville.
                </p>
              </div>
            </motion.div>

            {/* Service Professionnel */}
            <motion.div 
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-purple-200 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Photo du service professionnel */}
              <div className="relative h-48 overflow-hidden">
                <Image 
                  src="/images/hero/Voyage d'affaire.png" 
                  alt="Transport Professionnel Bordeaux - Voyage d'Affaires" 
                  width={400}
                  height={192}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="relative p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Transport Professionnel Bordeaux
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Déplacements d&apos;affaires à Bordeaux. 
                  Service discret, ponctualité garantie, transport régulier et fiable.
                </p>
              </div>
            </motion.div>

            {/* Service Événements */}
            <motion.div 
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-pink-200 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Photo du service événements */}
              <div className="relative h-48 overflow-hidden">
                <Image 
                  src="/images/hero/village de Saint-Emilion.webp" 
                  alt="Village de Saint-Émilion - Excursions et Événements" 
                  width={400}
                  height={192}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="relative p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Événements & Sorties Bordeaux
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Transport pour vos sorties à Bordeaux. 
                  Mariages, soirées, événements - service sur-mesure.
                </p>
              </div>
            </motion.div>

            {/* Service 24h */}
            <motion.div 
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-indigo-200 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Photo du service 24h */}
              <div className="relative h-48 overflow-hidden">
                <Image 
                  src="/images/hero/Pont-de-pierre- service taxi bordeaux.jpg" 
                  alt="Pont de Pierre Bordeaux - Service Taxi 24h/24" 
                  width={400}
                  height={192}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="relative p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Taxi Bordeaux Nuit 24h/24
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Service nocturne à Bordeaux. 
                  Disponible toute la nuit, retours de soirée sécurisés.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pourquoi nous choisir - Section Premium */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
        
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              VOTRE TAXI DE CONFIANCE À BORDEAUX
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Pourquoi Choisir
              <span className="text-yellow-400"> Notre Service ?</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto font-light">
              La référence du transport à Bordeaux depuis des années
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="text-white" size={36} />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">
                Rapidité Bordeaux
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Prise en charge rapide partout à Bordeaux. 
                Géolocalisation précise, arrivée garantie.
              </p>
            </motion.div>

            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="text-white" size={36} />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">
                Taxi Réglementé
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Licence officielle taxi Bordeaux. 
                Véhicules assurés, tarifs préfecture, service légal.
              </p>
            </motion.div>

            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Clock className="text-white" size={36} />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">
                Disponibilité 24h/24
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Service continu jour et nuit à Bordeaux. 
                Weekends, jours fériés - toujours disponible.
              </p>
            </motion.div>

            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="text-white" size={36} />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">
                Excellence Service
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Chauffeurs expérimentés Bordeaux. 
                Véhicules propres, accueil professionnel, satisfaction garantie.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Zone Bordeaux - SEO Optimisé */}
      <section id="zones-bordeaux" className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              TAXI BORDEAUX - ZONES COUVERTES
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Service Taxi dans tout
              <span className="text-blue-600"> Bordeaux</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Prise en charge rapide dans tous les quartiers de Bordeaux et sa métropole
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <MapPin className="text-blue-600" size={24} />
                </div>
                Bordeaux Centre
              </h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Place de la Comédie Bordeaux</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Quartier Chartrons Bordeaux</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Bastide Rive Droite Bordeaux</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Saint-Pierre Bordeaux</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Place Victoire Bordeaux</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <MapPin className="text-green-600" size={24} />
                </div>
                Transports Bordeaux
              </h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Aéroport Bordeaux-Mérignac</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Gare Saint-Jean Bordeaux</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Gare Blanquefort</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Port de Bordeaux</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Stations Tramway Bordeaux</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <MapPin className="text-purple-600" size={24} />
                </div>
                Métropole Bordeaux
              </h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Pessac & Talence</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Mérignac & Eysines</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Le Bouscat & Bruges</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Cenon & Floirac</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 shrink-0" size={18} />
                  <span>Taxi Bègles & Villenave</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* Informations de Contact */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              NOUS CONTACTER
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Informations de
              <span className="text-blue-600"> Contact</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Contactez-nous pour vos réservations de taxi à Bordeaux
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Téléphone */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Téléphone</h3>
              <a href="tel:0667237822" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors mb-2 block">
                06 67 23 78 22
              </a>
              <p className="text-slate-600 text-sm font-medium">
                Service 24h/24 - 7j/7
              </p>
            </div>

            {/* Email */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="text-blue-600" width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Email</h3>
              <a href="mailto:contact@taxibordeauxsolution.fr" className="text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-2 block break-all">
                contact@taxibordeauxsolution.fr
              </a>
              <p className="text-slate-600 text-sm font-medium">
                Réponse sous 24h
              </p>
            </div>

            {/* Zone de service */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Zone de Service</h3>
              <p className="text-lg font-semibold text-purple-600 mb-2">
                Bordeaux et Gironde
              </p>
              <p className="text-slate-600 text-sm font-medium">
                Aéroport, gare, centre-ville
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Final Premium */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent"></div>
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <div className="inline-block bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-3 text-green-400 font-semibold mb-8">
              🚀 RÉSERVATION TAXI BORDEAUX INSTANTANÉE
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
              Besoin d&apos;un Taxi à
              <span className="text-yellow-400"> Bordeaux ?</span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-slate-300 font-light leading-relaxed">
              <strong className="text-white">Réservation en 30 secondes</strong> - 
              Prise en charge rapide garantie partout à Bordeaux. 
              Service professionnel disponible 24h/24.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <a
                href="#reservation"
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25 hover:scale-105"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="flex items-center justify-center gap-3">
                  📱 Réserver Taxi Bordeaux
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              
              <a
                href={`tel:${phoneNumber}`}
                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/20 text-white px-10 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <span className="flex items-center justify-center gap-3">
                  <Phone size={24} className="group-hover:rotate-12 transition-transform" />
                  Appeler {phoneDisplay}
                </span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-slate-300">
              <div className="flex items-center justify-center gap-3">
                <Zap className="text-yellow-400" size={20} />
                <span>Prise en charge rapide</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Shield className="text-green-400" size={20} />
                <span>Service taxi réglementé</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Star className="text-blue-400" size={20} />
                <span>Satisfaction garantie</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}