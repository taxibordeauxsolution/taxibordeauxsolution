'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Train, Clock, MapPin, Phone, CheckCircle, Star } from 'lucide-react'

export default function GarePage() {
  const phoneNumber = "0667237822"
  const phoneDisplay = "06 67 23 78 22"

  return (
    <div className="min-h-screen">
      {/* Hero Section Gare */}
      <section className="relative min-h-[70vh] bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-400/20 via-transparent to-transparent"></div>
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          {/* Bouton retour */}
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8">
            <ArrowLeft size={20} />
            <span>Retour à l&apos;accueil</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-3 text-green-400 font-semibold">
                <Train size={20} />
                <span>Service Gare Saint-Jean</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent">
                    Taxi Gare
                  </span>
                  <br />
                  <span className="text-green-400">Saint-Jean</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-2xl">
                  Liaison directe avec la gare SNCF Bordeaux Saint-Jean. 
                  <strong className="text-white"> Service fiable 24h/24</strong> pour tous vos déplacements ferroviaires.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={`tel:${phoneNumber}`}
                  className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <Phone size={24} />
                  <span>Réserver maintenant</span>
                </a>
                
                <Link 
                  href="#tarifs"
                  className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-white/20"
                >
                  Voir les tarifs
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <Image 
                  src="/images/hero/Horloge quai de la gare saint jean.jpg" 
                  alt="Horloge Gare Saint-Jean Bordeaux - Service Taxi" 
                  width={600}
                  height={400}
                  className="w-full h-[400px] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Service disponible maintenant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Spécialisés Gare */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              SERVICES GARE SAINT-JEAN
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Spécialiste des
              <span className="text-green-600"> Liaisons Ferroviaires</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Transport professionnel vers et depuis la gare SNCF Bordeaux Saint-Jean
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                🚄
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">TGV & Trains Longue Distance</h3>
              <p className="text-slate-600">
                Prise en charge pour tous vos voyages TGV vers Paris, Lyon, Marseille et autres destinations.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                🚆
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Trains Régionaux</h3>
              <p className="text-slate-600">
                Liaisons avec les trains régionaux TER pour vos déplacements en Nouvelle-Aquitaine.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                ⏰
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Suivi des Horaires</h3>
              <p className="text-slate-600">
                Surveillance des horaires de trains en temps réel pour optimiser vos correspondances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie Gare & Service Professionnel */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              SERVICE PROFESSIONNEL
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Notre Service
              <span className="text-green-600"> Gare</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Service professionnel avec chauffeurs expérimentés pour tous vos déplacements ferroviaires
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Chauffeur professionnel */}
            <div className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <Image 
                src="/images/hero/Chauffeur privé.jpg" 
                alt="Chauffeur professionnel Taxi Bordeaux" 
                width={400}
                height={256}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold mb-1">Chauffeur Professionnel</h3>
                <p className="text-sm opacity-90">Service personnalisé et discret</p>
              </div>
            </div>

            {/* Service ouverture de porte */}
            <div className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <Image 
                src="/images/hero/ouverture de porte vtc.jpg" 
                alt="Service ouverture de porte Taxi" 
                width={400}
                height={256}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold mb-1">Service Haut de Gamme</h3>
                <p className="text-sm opacity-90">Accueil personnalisé et courtois</p>
              </div>
            </div>

            {/* Gare Saint-Jean alternative */}
            <div className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <Image 
                src="/images/hero/gae saint jean bordeaux.jpg" 
                alt="Gare Saint-Jean Bordeaux vue extérieure" 
                width={400}
                height={256}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold mb-1">Gare Saint-Jean</h3>
                <p className="text-sm opacity-90">Hub ferroviaire de Bordeaux</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tarifs Gare */}
      <section id="tarifs" className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              TARIFS GARE SAINT-JEAN
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Tarifs depuis la
              <span className="text-green-600"> Gare</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Gare → Centre-ville */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">🏛️</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Gare → Centre-ville</h4>
                  <p className="text-slate-500">Distance : ~3 km</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-2xl border border-yellow-200">
                  <div className="text-yellow-800 font-semibold text-sm mb-1">☀️ Jour</div>
                  <div className="text-2xl font-bold text-yellow-900">15-20€</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-2xl border border-indigo-200">
                  <div className="text-indigo-800 font-semibold text-sm mb-1">🌙 Nuit</div>
                  <div className="text-2xl font-bold text-indigo-900">20-25€</div>
                </div>
              </div>
            </div>

            {/* Gare → Aéroport */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">✈️</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Gare → Aéroport Mérignac</h4>
                  <p className="text-slate-500">Distance : ~25 km</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-2xl border border-yellow-200">
                  <div className="text-yellow-800 font-semibold text-sm mb-1">☀️ Jour</div>
                  <div className="text-2xl font-bold text-yellow-900">65-73€</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-2xl border border-indigo-200">
                  <div className="text-indigo-800 font-semibold text-sm mb-1">🌙 Nuit</div>
                  <div className="text-2xl font-bold text-indigo-900">80-92€</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Gare */}
      <section className="py-20 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Réservez votre
              <span className="text-green-400"> Taxi Gare</span>
            </h2>
            
            <p className="text-xl text-slate-300 leading-relaxed">
              Service disponible 24h/24 pour tous vos déplacements depuis et vers la gare Saint-Jean
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href={`tel:${phoneNumber}`}
                className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <Phone size={28} />
                <div className="text-left">
                  <div className="text-sm opacity-90">Appelez maintenant</div>
                  <div className="text-xl font-bold">{phoneDisplay}</div>
                </div>
              </a>
              
              <div className="text-center">
                <div className="text-green-400 font-semibold mb-1">⏱️ Temps d&apos;attente moyen</div>
                <div className="text-3xl font-bold">5-10 min</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}