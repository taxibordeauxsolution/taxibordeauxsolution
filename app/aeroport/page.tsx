'use client'

import { Phone, MapPin, Clock, Plane, Shield, Star, Users, CheckCircle, Luggage, CreditCard, Navigation, Zap, ArrowRight, Crown } from 'lucide-react'
import Image from 'next/image'

export default function TaxiAeroport() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section Spécialisé Aéroport */}
      <section className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-300/15 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-blue-600/10 backdrop-blur-sm border border-blue-200 rounded-full px-6 py-3 text-blue-700 font-semibold mb-8">
            <Plane size={20} />
            <span>Station Taxi Officielle Aéroport Bordeaux-Mérignac</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
            <span className="text-blue-600">Taxi Aéroport</span>
            <span className="block mt-2 text-4xl md:text-5xl text-gray-700">Bordeaux-Mérignac</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            <strong>Station officielle Hall A</strong> - Voies de bus prioritaires - Suivi des vols en temps réel
            <br/>Service taxi licencié disponible <strong>24h/24</strong> avec tarifs réglementés
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto mb-16">
            <a 
              href="tel:0667237822" 
              className="group bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center gap-3"
            >
              <Phone size={24} />
              <span>06 67 23 78 22</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            
            <div className="bg-white border-2 border-blue-200 text-blue-600 px-10 py-5 rounded-2xl font-bold text-xl shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <Shield size={24} />
                <span>Tarifs Réglementés</span>
              </div>
            </div>
          </div>

          {/* Indicateurs clés aéroport */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="text-3xl mb-3">🛬</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Hall A</div>
              <div className="text-sm text-gray-600">Niveau extérieur</div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="text-3xl mb-3">🚌</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Voies Bus</div>
              <div className="text-sm text-gray-600">Accès prioritaire</div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="text-3xl mb-3">📱</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Suivi Vol</div>
              <div className="text-sm text-gray-600">Temps réel</div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="text-3xl mb-3">🕒</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">24h/24</div>
              <div className="text-sm text-gray-600">Service continu</div>
            </div>
          </div>
        </div>
      </section>

      {/* Localisation Station Taxi */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Où Nous Trouver à l&apos;Aéroport ?
            </h2>
            <p className="text-xl text-gray-600">
              Station taxi officielle située à l&apos;extérieur du Hall A, niveau arrivées
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl border border-blue-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Station Hall A - Niveau Extérieur</h3>
                    <p className="text-gray-600">
                      Située juste à la sortie du Hall A arrivées, notre station taxi est le premier point de transport 
                      que vous verrez en sortant de l&apos;aéroport.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-green-500" size={20} />
                    <span>Accès immédiat depuis arrivées</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-green-500" size={20} />
                    <span>Signalisation claire &quot;TAXI&quot;</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-green-500" size={20} />
                    <span>Queue organisée et sécurisée</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-green-500" size={20} />
                    <span>Personnel d&apos;accueil présent</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl border border-green-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Navigation className="text-green-600" size={24} />
                  Itinéraire depuis votre arrivée
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-gray-700">Sortez du Hall A niveau arrivées</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-gray-700">Dirigez-vous vers la sortie extérieure</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-gray-700">Station taxi visible immédiatement</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span className="text-gray-700">Présentez-vous à la file d&apos;attente</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl border border-blue-200 text-center">
                <div className="text-8xl mb-6">🚖</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Réservation Recommandée</h4>
                <p className="text-gray-600 mb-6">
                  Pour les vols de nuit, groupes importants ou destinations éloignées, 
                  contactez-nous à l&apos;avance pour garantir votre prise en charge.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-blue-200">
                    <div className="font-semibold text-blue-800 mb-1">📞 Réservation</div>
                    <a href="tel:0667237822" className="text-blue-600 font-bold text-lg hover:text-blue-700">
                      06 67 23 78 22
                    </a>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-blue-200">
                    <div className="font-semibold text-blue-800 mb-1">⏰ Conseil</div>
                    <div className="text-gray-600">Appelez dès la sortie de l&apos;avion</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie Aéroport */}
      <section className="py-20 bg-gradient-to-b from-white to-sky-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              AÉROPORT BORDEAUX-MÉRIGNAC
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Votre Taxi vous attend à
              <span className="text-blue-600"> l&apos;Aéroport</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Découvrez nos services professionnels dans l&apos;environnement aéroportuaire
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Salle d'embarquement */}
            <div className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <Image 
                src="/images/hero/Salle d&apos;embarquement BOD.jpg" 
                alt="Salle d&apos;embarquement Aéroport Bordeaux" 
                width={400}
                height={256}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold mb-1">Salle d&apos;Embarquement</h3>
                <p className="text-sm opacity-90">Récupération après votre vol</p>
              </div>
            </div>

            {/* Avion sur tarmac */}
            <div className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <Image 
                src="/images/hero/Avion sur tarmac Bordeaux.jpg" 
                alt="Avion sur tarmac Bordeaux" 
                width={400}
                height={256}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold mb-1">Liaison Aérienne</h3>
                <p className="text-sm opacity-90">Suivi de vos vols en temps réel</p>
              </div>
            </div>

            {/* Zone dépose minute */}
            <div className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <Image 
                src="/images/hero/aeroport-bordeaux-dépose minute.webp" 
                alt="Zone dépose minute Aéroport Bordeaux" 
                width={400}
                height={256}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold mb-1">Zone Taxi</h3>
                <p className="text-sm opacity-90">Station officielle Hall A</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tarifs Officiels Aéroport */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Tarifs Officiels Taxi Aéroport
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tarifs réglementés par arrêté préfectoral de Gironde - Compteur obligatoire
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Grille tarifaire officielle */}
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-12 border border-gray-200">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Grille Tarifaire Officielle 2025
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200">
                  <h4 className="text-xl font-bold text-yellow-800 mb-6 text-center">
                    ☀️ Tarif JOUR (7h00 - 19h00)
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                      <span className="font-medium">Prise en charge :</span>
                      <span className="font-bold text-lg">2,80€</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                      <span className="font-medium">Prix au kilomètre :</span>
                      <span className="font-bold text-lg">2,12€</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Attente (par heure) :</span>
                      <span className="font-bold text-lg">41,61€</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                  <h4 className="text-xl font-bold text-indigo-800 mb-6 text-center">
                    🌙 Tarif NUIT (19h00 - 7h00)
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-indigo-200">
                      <span className="font-medium">Prise en charge :</span>
                      <span className="font-bold text-lg">2,80€</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-indigo-200">
                      <span className="font-medium">Prix au kilomètre :</span>
                      <span className="font-bold text-lg">3,18€</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Attente (par heure) :</span>
                      <span className="font-bold text-lg">41,61€</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                <p className="text-blue-800 leading-relaxed">
                  <strong>📋 Tarifs réglementés 2025</strong> - Préfecture de Gironde<br/>
                  Compteur obligatoire • Prix final selon distance réelle et conditions de circulation<br/>
                  <strong>Suppléments :</strong> Dimanche et jours fériés • Bagages volumineux (selon règlementation)
                </p>
              </div>
            </div>

            {/* Estimations destinations populaires depuis aéroport */}
            <div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Estimations depuis Aéroport Bordeaux-Mérignac
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏛️</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Bordeaux Centre-Ville</h4>
                    <p className="text-sm text-gray-600 mb-4">Distance : ~12 km</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-xs text-yellow-700 font-medium">JOUR</div>
                        <div className="text-lg font-bold text-yellow-800">60-70€</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <div className="text-xs text-indigo-700 font-medium">NUIT</div>
                        <div className="text-lg font-bold text-indigo-800">75-90€</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🚂</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Gare Saint-Jean</h4>
                    <p className="text-sm text-gray-600 mb-4">Distance : ~15 km</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-xs text-yellow-700 font-medium">JOUR</div>
                        <div className="text-lg font-bold text-yellow-800">50-60€</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <div className="text-xs text-indigo-700 font-medium">NUIT</div>
                        <div className="text-lg font-bold text-indigo-800">65-80€</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🌊</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Bordeaux Bastide</h4>
                    <p className="text-sm text-gray-600 mb-4">Distance : ~18 km</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-xs text-yellow-700 font-medium">JOUR</div>
                        <div className="text-lg font-bold text-yellow-800">60-70€</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <div className="text-xs text-indigo-700 font-medium">NUIT</div>
                        <div className="text-lg font-bold text-indigo-800">75-90€</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏢</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Bordeaux-Lac</h4>
                    <p className="text-sm text-gray-600 mb-4">Distance : ~10 km</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-xs text-yellow-700 font-medium">JOUR</div>
                        <div className="text-lg font-bold text-yellow-800">45-55€</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <div className="text-xs text-indigo-700 font-medium">NUIT</div>
                        <div className="text-lg font-bold text-indigo-800">55-65€</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏫</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Pessac / Talence</h4>
                    <p className="text-sm text-gray-600 mb-4">Distance : ~8 km</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-xs text-yellow-700 font-medium">JOUR</div>
                        <div className="text-lg font-bold text-yellow-800">20-30€</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <div className="text-xs text-indigo-700 font-medium">NUIT</div>
                        <div className="text-lg font-bold text-indigo-800">30-40€</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏘️</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Banlieue Proche</h4>
                    <p className="text-sm text-gray-600 mb-4">Mérignac, Le Bouscat</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-xs text-yellow-700 font-medium">JOUR</div>
                        <div className="text-lg font-bold text-yellow-800">15-25€</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <div className="text-xs text-indigo-700 font-medium">NUIT</div>
                        <div className="text-lg font-bold text-indigo-800">25-35€</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flotte de Véhicules Aéroport */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Notre Flotte Aéroport
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Véhicules confortables et spacieux, adaptés aux voyageurs et leurs bagages
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200 text-center hover:shadow-xl transition-shadow">
              <div className="text-6xl mb-6">🚗</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Berline Confort</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Users size={18} />
                  <span>1-4 passagers</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Luggage size={18} />
                  <span>3 valises + bagages cabine</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <CheckCircle size={18} className="text-green-600" />
                  <span>Climatisation</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">Idéal pour voyageurs individuels</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 border border-green-200 text-center hover:shadow-xl transition-shadow">
              <div className="text-6xl mb-6">🚐</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Monospace</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Users size={18} />
                  <span>5-7 passagers</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Luggage size={18} />
                  <span>6+ valises + bagages cabine</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <CheckCircle size={18} className="text-green-600" />
                  <span>Espace extra-large</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Parfait pour familles & groupes</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 border border-purple-200 text-center hover:shadow-xl transition-shadow">
              <div className="text-6xl mb-6">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Véhicule Haut de Gamme</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Users size={18} />
                  <span>1-4 passagers VIP</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Luggage size={18} />
                  <span>Coffre spacieux</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <CheckCircle size={18} className="text-green-600" />
                  <span>Cuir, WiFi, chargeurs</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Service groupes & familles</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Tous Nos Véhicules Incluent</h4>
              <div className="grid md:grid-cols-4 gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>Climatisation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>GPS intégré</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>Assistance bagages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>Véhicules récents</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Avantages Station Taxi Aéroport */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Avantages de Notre Station Aéroport
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Service professionnel spécialement conçu pour les voyageurs aériens
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-blue-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plane className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Suivi des Vols</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Surveillance des horaires en temps réel. Adaptation automatique aux retards 
                et avances pour une ponctualité parfaite.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-green-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Luggage className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Assistance Bagages</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Aide au chargement et déchargement de vos valises. 
                Coffres spacieux adaptés aux voyages longue distance.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-purple-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Service Licencié</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Taxi officiel avec licence préfectorale. Véhicules assurés, 
                chauffeurs professionnels agréés.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-orange-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paiement Flexible</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Espèces, carte bancaire, facturation entreprise. 
                Reçu officiel fourni sur demande.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conseils Voyageurs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Conseils pour Votre Arrivée
              </h2>
              <p className="text-xl text-gray-600">
                Optimisez votre trajet depuis l&apos;aéroport Bordeaux-Mérignac
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  Avant Votre Départ
                </h3>
                
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">1</span>
                    </div>
                    <span>Notez notre numéro : <strong>06 67 23 78 22</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">2</span>
                    </div>
                    <span>Vérifiez l&apos;heure d&apos;arrivée de votre vol</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">3</span>
                    </div>
                    <span>Préparez l&apos;adresse exacte de destination</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">4</span>
                    </div>
                    <span>Choisissez votre mode de paiement</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center gap-3">
                  <MapPin className="text-blue-600" size={24} />
                  À Votre Arrivée
                </h3>
                
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">1</span>
                    </div>
                    <span>Récupérez vos bagages aux tapis roulants</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">2</span>
                    </div>
                    <span>Sortez par le Hall A niveau arrivées</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">3</span>
                    </div>
                    <span>Direction extérieur, station taxi visible</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">4</span>
                    </div>
                    <span>Présentez-vous à la file d&apos;attente</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-3xl border border-yellow-200 md:col-span-2">
                <h3 className="text-xl font-bold text-yellow-800 mb-6 flex items-center gap-3">
                  <Zap className="text-yellow-600" size={24} />
                  Réservation Anticipée Recommandée
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Idéal pour :</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Vols arrivant après 22h</li>
                      <li>• Groupes de plus de 4 personnes</li>
                      <li>• Destinations éloignées (Arcachon, etc.)</li>
                      <li>• Transport avec bagages nombreux</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Appelez-nous :</h4>
                    <div className="space-y-2 text-gray-700">
                      <div>• <strong>Dès la sortie de l&apos;avion</strong></div>
                      <div>• <strong>Communiquez votre n° de vol</strong></div>
                      <div>• <strong>Précisez votre destination</strong></div>
                      <div>• <strong>Chauffeur vous attend</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Réservation Avancée Aéroport */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Réservation Anticipée Recommandée
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Garantissez votre transport aéroport en réservant à l&apos;avance - Service personnalisé et sans attente
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Widget Réservation */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-green-200">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    Réservez Votre Taxi Aéroport
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="text-white" size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Prise en charge garantie</h4>
                        <p className="text-gray-600">Chauffeur vous attend même en cas de retard de vol</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="text-white" size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Véhicule adapté</h4>
                        <p className="text-gray-600">Choix du véhicule selon vos bagages et nombre de passagers</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="text-white" size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Suivi personnalisé</h4>
                        <p className="text-gray-600">Surveillance de votre vol et ajustement automatique</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="text-white" size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Tarif fixe possible</h4>
                        <p className="text-gray-600">Devis à l&apos;avance pour certaines destinations éloignées</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
                  <h4 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    📞 Réservation Simple
                  </h4>
                  
                  <div className="text-center mb-8">
                    <a 
                      href="tel:0667237822" 
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-bold text-2xl transition-all duration-300 shadow-xl hover:shadow-green-500/25 hover:scale-105"
                    >
                      06 67 23 78 22
                    </a>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-blue-200">
                      <h5 className="font-bold text-blue-800 mb-2">✈️ Informations nécessaires</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Numéro et heure de vol</li>
                        <li>• Nombre de passagers</li>
                        <li>• Nombre de bagages</li>
                        <li>• Destination précise</li>
                      </ul>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Cas spéciaux nécessitant réservation */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-purple-200 text-center">
                <div className="text-5xl mb-6">👥</div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Groupes Recommandé</h4>
                <p className="text-gray-600 mb-4">
                  Plus de 4 personnes ou bagages volumineux - Véhicule spécialisé requis
                </p>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-purple-800 font-semibold text-sm">Monospace recommandé</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-200 text-center">
                <div className="text-5xl mb-6">🗺️</div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Destinations Éloignées</h4>
                <p className="text-gray-600 mb-4">
                  Arcachon, La Rochelle, Libourne - Trajets longs avec tarif préférentiel
                </p>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-800 font-semibold text-sm">Devis personnalisé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages Aéroport */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Voyageurs Satisfaits
            </h2>
            <p className="text-xl text-gray-600">
              Retours d&apos;expérience de nos clients à l&apos;aéroport
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                &quot;Vol retardé de 2h30, le chauffeur m&apos;attendait toujours ! 
                Service exceptionnel, merci pour votre professionnalisme.&quot;
              </p>
              <div className="font-semibold text-gray-900">Michel R. • Vol Air France Paris-Bordeaux</div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                &quot;Station très facile à trouver Hall A. 
                Trajet rapide par les voies de bus, tarif au compteur respecté.&quot;
              </p>
              <div className="font-semibold text-gray-900">Sophie L. • Bordeaux Centre-ville</div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                &quot;Famille avec 4 valises, chauffeur très aidant. 
                Véhicule spacieux, accueil parfait pour nos enfants.&quot;
              </p>
              <div className="font-semibold text-gray-900">Famille Dubois • Départ vacances</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ponctualité et Fiabilité */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ponctualité et Fiabilité Garanties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Service taxi aéroport professionnel avec suivi des vols en temps réel • Zéro retard garanti
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Performance Stats */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Nos Performances Aéroport
                </h3>
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-600 mb-2">100%</div>
                    <div className="text-lg font-semibold text-gray-800 mb-1">Ponctualité</div>
                    <div className="text-sm text-gray-600">Zéro retard depuis 2 ans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">24/7</div>
                    <div className="text-lg font-semibold text-gray-800 mb-1">Disponibilité</div>
                    <div className="text-sm text-gray-600">Service continu aéroport</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-purple-600 mb-2">3min</div>
                    <div className="text-lg font-semibold text-gray-800 mb-1">Temps d'attente</div>
                    <div className="text-sm text-gray-600">Maximum à la station</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-600 mb-2">5⭐</div>
                    <div className="text-lg font-semibold text-gray-800 mb-1">Satisfaction</div>
                    <div className="text-sm text-gray-600">Clients voyageurs</div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <Clock className="text-green-600" size={32} />
                    Ponctualité Absolue
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="text-white" size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-green-800 mb-2">Suivi des vols en temps réel</h5>
                          <p className="text-green-700">Surveillance automatique des retards et avances de votre vol</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="text-white" size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-blue-800 mb-2">Chauffeurs positionnés</h5>
                          <p className="text-blue-700">Taxi déjà sur place à votre arrivée, pas d'attente</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="text-white" size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-purple-800 mb-2">Voies de bus prioritaires</h5>
                          <p className="text-purple-700">Trajet rapide garanti depuis l'aéroport</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <Shield className="text-blue-600" size={32} />
                    Fiabilité Professionnelle
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="text-white" size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-orange-800 mb-2">Licence officielle aéroport</h5>
                          <p className="text-orange-700">Station taxi autorisée Hall A par l'aéroport</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="text-white" size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-red-800 mb-2">Service garanti 24h/24</h5>
                          <p className="text-red-700">Même pour les vols de nuit et les urgences</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="text-white" size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-indigo-800 mb-2">Backup permanent</h5>
                          <p className="text-indigo-700">Plan B automatique en cas d'imprévu</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Excellence */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-green-200 text-center">
                <div className="text-5xl mb-6">⚡</div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Réactivité Immédiate</h4>
                <p className="text-gray-600 mb-4">
                  Adaptation instantanée aux changements d'horaires de vol
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold text-sm">Suivi automatique des vols</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg border border-blue-200 text-center">
                <div className="text-5xl mb-6">🎯</div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Précision Horaire</h4>
                <p className="text-gray-600 mb-4">
                  Arrivée synchronisée avec votre sortie de l'aéroport
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-semibold text-sm">Timing parfait garanti</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg border border-purple-200 text-center">
                <div className="text-5xl mb-6">🛡️</div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Engagement Qualité</h4>
                <p className="text-gray-600 mb-4">
                  Service professionnel avec chauffeurs expérimentés aéroport
                </p>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-purple-800 font-semibold text-sm">Excellence garantie</p>
                </div>
              </div>
            </div>

            {/* Contact Fiabilité */}
            <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 text-center">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">
                🚀 Service Taxi Aéroport Ultra-Fiable
              </h4>
              <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
                <strong>Zéro stress, zéro retard, zéro attente.</strong> Notre service taxi aéroport est optimisé pour la ponctualité absolue des voyageurs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="tel:0667237822" 
                  className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-green-500/25 hover:scale-105"
                >
                  📞 06 67 23 78 22
                </a>
                <div className="text-gray-600">
                  <div className="font-semibold">Service garanti 24h/24</div>
                  <div className="text-sm">Ponctualité absolue • Fiabilité maximale</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Informations de Contact Aéroport */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              CONTACT TAXI AÉROPORT
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Nous Contacter pour
              <span className="text-blue-600"> l&apos;Aéroport</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Service taxi dédié aéroport Bordeaux-Mérignac
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Téléphone Aéroport */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Réservation Aéroport</h3>
              <a href="tel:0667237822" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors mb-2 block">
                06 67 23 78 22
              </a>
              <p className="text-slate-600 text-sm font-medium">
                Station Hall A • Service 24h/24
              </p>
            </div>

            {/* Email */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="text-blue-600" width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Email Aéroport</h3>
              <a href="mailto:contact@taxibordeauxsolution.fr" className="text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-2 block break-all">
                contact@taxibordeauxsolution.fr
              </a>
              <p className="text-slate-600 text-sm font-medium">
                Réservation anticipée • Vol de nuit
              </p>
            </div>

            {/* Station Aéroport */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plane className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Station Officielle</h3>
              <p className="text-lg font-semibold text-purple-600 mb-2">
                Hall A Niveau Extérieur
              </p>
              <p className="text-slate-600 text-sm font-medium">
                Sortie arrivées • Accès immédiat
              </p>
            </div>
          </div>

          {/* Services Taxi Aéroport Spécialisés */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Services Taxi Aéroport
              </h3>
              <p className="text-lg text-slate-600">
                Transport depuis et vers l&apos;aéroport Bordeaux-Mérignac
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Aller à l&apos;Aéroport */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-lg p-8 border border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">🛫</div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">Aller à l&apos;Aéroport</h4>
                    <p className="text-slate-600">Depuis votre domicile vers Bordeaux-Mérignac</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="text-blue-600" size={20} />
                    <span>Prise en charge à domicile</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="text-blue-600" size={20} />
                    <span>Suivi de votre vol au départ</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="text-blue-600" size={20} />
                    <span>Arrivée garantie à temps</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="text-blue-600" size={20} />
                    <span>Aide au transport des bagages</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-blue-200">
                  <h5 className="font-bold text-blue-800 mb-2">💡 Conseil</h5>
                  <p className="text-sm text-slate-700">
                    Réservez 2h avant votre vol pour les vols domestiques, 
                    3h avant pour les vols internationaux.
                  </p>
                </div>
              </div>

              {/* Retour de l&apos;Aéroport */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl shadow-lg p-8 border border-green-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">🛬</div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">Retour de l&apos;Aéroport</h4>
                    <p className="text-slate-600">Depuis Bordeaux-Mérignac vers votre destination</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="text-green-600" size={20} />
                    <span>Station taxi Hall A niveau extérieur</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="text-green-600" size={20} />
                    <span>Surveillance des retards de vol</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="text-green-600" size={20} />
                    <span>Accès prioritaire voies de bus</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="text-green-600" size={20} />
                    <span>Véhicules spacieux pour bagages</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-green-200">
                  <h5 className="font-bold text-green-800 mb-2">📍 Où nous trouver</h5>
                  <p className="text-sm text-slate-700">
                    Sortie Hall A arrivées, niveau extérieur. 
                    Suivez les panneaux &quot;TAXI&quot; - station immédiatement visible.
                  </p>
                </div>
              </div>
            </div>

            {/* Avantages Service Aéroport */}
            <div className="mt-16">
              <h4 className="text-2xl font-bold text-center text-slate-900 mb-8">
                Pourquoi Choisir Notre Service Taxi Aéroport ?
              </h4>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-blue-600" size={24} />
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2">Ponctualité</h5>
                  <p className="text-sm text-slate-600">Suivi des vols en temps réel pour éviter les retards</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-green-600" size={24} />
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2">Localisation</h5>
                  <p className="text-sm text-slate-600">Station officielle Hall A, accès immédiat</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Luggage className="text-purple-600" size={24} />
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2">Bagages</h5>
                  <p className="text-sm text-slate-600">Assistance complète, coffres spacieux</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="text-orange-600" size={24} />
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2">Fiabilité</h5>
                  <p className="text-sm text-slate-600">Service licencié, véhicules assurés</p>
                </div>
              </div>
            </div>

            {/* FAQ Aéroport Spécifique */}
            <div className="mt-12">
              <h4 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Questions Fréquentes Aéroport
              </h4>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                  <h5 className="text-lg font-bold text-blue-800 mb-4">✈️ Où se trouve exactement la station taxi ?</h5>
                  <p className="text-gray-700 leading-relaxed">
                    Station officielle située à l&apos;extérieur du Hall A niveau arrivées. 
                    Sortez du terminal, dirigez-vous vers l&apos;extérieur et vous verrez immédiatement 
                    la signalisation &quot;TAXI&quot; avec la file d&apos;attente organisée.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
                  <h5 className="text-lg font-bold text-green-800 mb-4">⏰ Y a-t-il des taxis disponibles la nuit ?</h5>
                  <p className="text-gray-700 leading-relaxed">
                    La station taxi fonctionne selon les horaires de vol. Pour les arrivées 
                    tardives (après 22h) ou très matinales (avant 6h), nous recommandons 
                    fortement de réserver à l&apos;avance au 06 67 23 78 22.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
                  <h5 className="text-lg font-bold text-purple-800 mb-4">💳 Quels moyens de paiement acceptez-vous ?</h5>
                  <p className="text-gray-700 leading-relaxed">
                    Nous acceptons les espèces, cartes bancaires (Visa, Mastercard, American Express), 
                    chèques et facturation pour les entreprises. Un reçu officiel 
                    est toujours fourni sur demande.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
                  <h5 className="text-lg font-bold text-orange-800 mb-4">🧳 Y a-t-il des suppléments pour les bagages ?</h5>
                  <p className="text-gray-700 leading-relaxed">
                    Aucun supplément pour les bagages standards (valises normales). 
                    Des suppléments peuvent s&apos;appliquer uniquement pour des bagages exceptionnellement 
                    volumineux selon la réglementation en vigueur.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100">
                  <h5 className="text-lg font-bold text-red-800 mb-4">📱 Mon vol est retardé, que faire ?</h5>
                  <p className="text-gray-700 leading-relaxed">
                    Si vous avez réservé, nous surveillons automatiquement votre vol. 
                    Sinon, appelez-nous dès que vous connaissez le retard au 06 67 23 78 22. 
                    Nos chauffeurs s&apos;adaptent aux horaires réels.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
                  <h5 className="text-lg font-bold text-indigo-800 mb-4">👥 Acceptez-vous les groupes importants ?</h5>
                  <p className="text-gray-700 leading-relaxed">
                    Oui, nous disposons de monospaces et minibus pour les groupes. 
                    Réservation obligatoire pour plus de 4 personnes afin de garantir 
                    un véhicule adapté. Tarifs dégressifs selon la taille du groupe.
                  </p>
                </div>
              </div>
            </div>

            {/* Zone de couverture aéroport */}
            <div className="mt-12 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plane className="text-blue-600" size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-blue-900">Service Taxi Aéroport</h4>
                </div>
                <p className="text-blue-800 leading-relaxed mb-4">
                  <strong>Liaison aéroport Bordeaux-Mérignac</strong> vers toutes destinations de Bordeaux et sa métropole
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <strong>Zone Centre</strong><br/>
                    Bordeaux centre-ville, Chartrons, Bastide
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <strong>Métropole</strong><br/>
                    Pessac, Talence, Mérignac, Eysines
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <strong>Transports</strong><br/>
                    Gare Saint-Jean, stations tramway
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Aéroport */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Taxi Aéroport Bordeaux-Mérignac
            <span className="block text-3xl md:text-4xl text-yellow-400 mt-2">Station Officielle 24h/24</span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Hall A niveau extérieur • Voies de bus prioritaires • Suivi des vols • Tarifs réglementés
            <br/>
            <strong className="text-white">Service taxi professionnel</strong> pour tous vos déplacements depuis l&apos;aéroport
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto mb-12">
            <a 
              href="tel:0667237822" 
              className="group bg-white text-blue-600 px-12 py-6 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/10 hover:scale-105 flex items-center justify-center gap-3"
            >
              <Phone size={24} />
              <span>06 67 23 78 22</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            
            <div className="bg-yellow-400 text-blue-900 px-12 py-6 rounded-2xl font-bold text-xl shadow-xl">
              <div className="text-xl mb-1">Station Taxi Hall A</div>
              <div className="text-sm font-medium">Niveau extérieur arrivées</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-blue-100 text-sm">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Licence officielle</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Suivi des vols</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Service 24h/24</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Tarifs réglementés</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}