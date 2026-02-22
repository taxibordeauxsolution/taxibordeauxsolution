import Link from 'next/link'
import { Phone, MapPin, Clock, Star, Shield, Zap, CheckCircle, ArrowRight, Users } from 'lucide-react'

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
              <div className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-3 text-green-400 font-semibold">
                <Zap size={20} className="animate-pulse" />
                <span>Taxi rapide à Bordeaux</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    LA Solution
                  </span>
                  <br />
                  <span className="text-yellow-400">Taxi Bordeaux</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-2xl font-light">
                  Service premium disponible 24h/24. 
                  <strong className="text-white font-semibold"> Réservation instantanée</strong>, 
                  prise en charge rapide dans toute la métropole bordelaise.
                </p>
              </div>

              {/* CTA Buttons Modernes */}
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                <Link
                  href="/contact"
                  className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 text-center shadow-2xl hover:shadow-green-500/25 hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-3">
                    📱 Réserver un Taxi
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                
                <a
                  href={`tel:${phoneNumber}`}
                  className="group relative bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 text-center shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Phone size={20} className="group-hover:rotate-12 transition-transform" />
                    {phoneDisplay}
                  </span>
                </a>
              </div>

              {/* Stats élégantes */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1">Rapide</div>
                  <div className="text-sm text-slate-400 font-medium">Prise en charge</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1">24/7</div>
                  <div className="text-sm text-slate-400 font-medium">Service continu</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1">100%</div>
                  <div className="text-sm text-slate-400 font-medium">Fiabilité</div>
                </div>
              </div>
            </div>

            {/* Visual moderne */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Carte stylisée */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                  <div className="text-center space-y-8">
                    <div className="relative">
                      <div className="text-8xl mb-4">🚖</div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">Taxi Bordeaux Instantané</h3>
                      <p className="text-slate-300">Géolocalisation précise</p>
                      
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg">
                        🚀 Disponible Maintenant
                      </div>
                    </div>
                  </div>
                </div>

                {/* Éléments décoratifs flottants */}
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

      {/* Services Section Moderne */}
      <section id="services" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              NOS SERVICES TAXI BORDEAUX
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              La Solution Transport
              <span className="text-blue-600"> à Bordeaux</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Service taxi professionnel dans toute la métropole. 
              Réservation simple, prise en charge rapide garantie.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Service Aéroport */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">✈️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Taxi Aéroport Bordeaux Mérignac
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Liaison directe aéroport Bordeaux-Mérignac. 
                  Prise en charge rapide, suivi des vols, service premium 24h/24.
                </p>
              </div>
            </div>

            {/* Service Gare */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-green-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🚄</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Taxi Gare Saint-Jean Bordeaux
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Transport gare SNCF Saint-Jean. 
                  Arrivée ponctuelle, aide aux bagages, connexion immédiate.
                </p>
              </div>
            </div>

            {/* Service Ville */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-yellow-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🏙️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Taxi Bordeaux Centre-Ville
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Courses urbaines dans Bordeaux. 
                  Prise en charge rapide, connaissance parfaite de la ville.
                </p>
              </div>
            </div>

            {/* Service Professionnel */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-purple-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">💼</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Transport Professionnel Bordeaux
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Déplacements d&apos;affaires à Bordeaux. 
                  Service discret, ponctualité garantie, véhicules premium.
                </p>
              </div>
            </div>

            {/* Service Événements */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-pink-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Événements & Sorties Bordeaux
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Transport pour vos sorties à Bordeaux. 
                  Mariages, soirées, événements - service sur-mesure.
                </p>
              </div>
            </div>

            {/* Service 24h */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-indigo-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🌙</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Taxi Bordeaux Nuit 24h/24
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Service nocturne à Bordeaux. 
                  Disponible toute la nuit, retours de soirée sécurisés.
                </p>
              </div>
            </div>
          </div>
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
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="text-white" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">
                Rapidité Bordeaux
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Prise en charge rapide partout à Bordeaux. 
                Géolocalisation précise, arrivée garantie.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="text-white" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">
                Taxi Réglementé
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Licence officielle taxi Bordeaux. 
                Véhicules assurés, tarifs préfecture, service légal.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="text-white" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">
                Disponibilité 24h/24
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Service continu jour et nuit à Bordeaux. 
                Weekends, jours fériés - toujours disponible.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="text-white" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">
                Excellence Service
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Chauffeurs expérimentés Bordeaux. 
                Véhicules propres, accueil professionnel, satisfaction garantie.
              </p>
            </div>
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
              <Link
                href="/contact"
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-3">
                  📱 Réserver Taxi Bordeaux
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
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