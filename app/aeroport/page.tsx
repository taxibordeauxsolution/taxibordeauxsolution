'use client'

import { Phone, MapPin, Clock, Plane, Shield, CheckCircle, ArrowRight } from 'lucide-react'

export default function TaxiAeroport() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section Aéroport */}
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
            Service taxi professionnel à l'aéroport de Bordeaux-Mérignac.
            Prise en charge rapide, trajets vers toute la région bordelaise.
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

          {/* Infos pratiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="text-3xl mb-3">🛬</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Hall A</div>
              <div className="text-sm text-gray-600">Station officielle</div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="text-3xl mb-3">🕒</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">24h/24</div>
              <div className="text-sm text-gray-600">Service continu</div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="text-3xl mb-3">🚖</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Direct</div>
              <div className="text-sm text-gray-600">Prise en charge rapide</div>
            </div>
          </div>
        </div>
      </section>

      {/* Taxis Disponibles sur Aéroport */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Taxis Disponibles sur l'Aéroport
            </h2>
            <p className="text-xl text-gray-600">
              Notre service taxi est présent en permanence à l'aéroport Bordeaux-Mérignac
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Service Continu 7j/7
              </h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Nos taxis sont disponibles tous les jours de la semaine, même les week-ends
                et jours fériés. Station taxi officielle située au niveau extérieur du Hall A.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-gray-700">Taxis disponibles en permanence</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-gray-700">Station officielle Hall A extérieur</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-gray-700">Accès direct depuis les arrivées</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-gray-700">File d'attente organisée</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl">
              <div className="text-center">
                <div className="text-6xl mb-6">🚖</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Prise en Charge Immédiate</h3>
                <p className="text-gray-700 mb-6">
                  Sortez de l'aéroport, dirigez-vous vers la station taxi Hall A.
                  Un chauffeur professionnel vous prend en charge directement.
                </p>

                <a
                  href="tel:0667237822"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  📞 06 67 23 78 22
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principales Destinations Région Bordelaise */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Principales Destinations dans la Région Bordelaise
            </h2>
            <p className="text-xl text-gray-600">
              Nos taxis vous conduisent vers toutes les destinations de Bordeaux et sa région
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {/* Bordeaux Centre */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bordeaux Centre-Ville</h3>
              <p className="text-gray-600">
                Quartiers historiques, Chartrons, place des Quinconces
              </p>
            </div>

            {/* Gare Saint-Jean */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🚂</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gare Saint-Jean</h3>
              <p className="text-gray-600">
                Liaison directe gare SNCF, connexion TGV
              </p>
            </div>

            {/* Pessac Talence */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🏫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pessac / Talence</h3>
              <p className="text-gray-600">
                Campus universitaires, zones résidentielles
              </p>
            </div>

            {/* Bordeaux Lac */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bordeaux-Lac</h3>
              <p className="text-gray-600">
                Quartier d'affaires, centre commercial
              </p>
            </div>

            {/* Bastide */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🌊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bordeaux Bastide</h3>
              <p className="text-gray-600">
                Rive droite, quartiers résidentiels
              </p>
            </div>

            {/* Banlieue */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🏘️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Banlieue Proche</h3>
              <p className="text-gray-600">
                Mérignac, Le Bouscat, Eysines, Bègles
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-8 max-w-3xl mx-auto shadow-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Tarifs au Compteur Réglementés</h4>
              <p className="text-gray-700">
                Tous nos trajets sont facturés selon les tarifs officiels de la Préfecture de Gironde.
                Prix final calculé selon la distance réelle et les conditions de circulation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ponctualité et Fiabilité */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ponctualité et Fiabilité
            </h2>
            <p className="text-xl text-gray-600">
              Notre priorité : un service taxi fiable pour vos déplacements aéroport
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">

              {/* Ponctualité */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Ponctualité Garantie</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-green-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Surveillance des vols</h4>
                      <p className="text-gray-700">Suivi en temps réel des horaires d'arrivée et de départ</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-green-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Adaptation aux retards</h4>
                      <p className="text-gray-700">Ajustement automatique en cas de vol retardé</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-green-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Trajets directs</h4>
                      <p className="text-gray-700">Itinéraires optimisés par nos chauffeurs expérimentés</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fiabilité */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Fiabilité Professionnelle</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-blue-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Service 24h/24</h4>
                      <p className="text-gray-700">Disponible tous les jours, même les jours fériés</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-blue-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Chauffeurs professionnels</h4>
                      <p className="text-gray-700">Expérience aéroport, connaissance parfaite de la région</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-blue-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Véhicules entretenus</h4>
                      <p className="text-gray-700">Flotte récente, vérifications régulières</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performances */}
            <div className="mt-12 bg-white rounded-3xl p-8 shadow-lg text-center">
              <h4 className="text-2xl font-bold text-gray-900 mb-8">Nos Performances</h4>

              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                  <div className="text-lg font-semibold text-gray-800 mb-1">Service Assuré</div>
                  <div className="text-sm text-gray-600">Aucune annulation depuis 2 ans</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-lg font-semibold text-gray-800 mb-1">Disponibilité</div>
                  <div className="text-sm text-gray-600">Service continu aéroport</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">5min</div>
                  <div className="text-lg font-semibold text-gray-800 mb-1">Temps d'Attente</div>
                  <div className="text-sm text-gray-600">Maximum à la station</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Final */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Taxi Aéroport Bordeaux-Mérignac
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Service taxi professionnel • Station officielle Hall A • Disponible 24h/24
          </p>

          <a
            href="tel:0667237822"
            className="group bg-white text-blue-600 px-12 py-6 rounded-2xl font-bold text-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/10 hover:scale-105 inline-flex items-center gap-3"
          >
            <Phone size={28} />
            <span>06 67 23 78 22</span>
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12 text-blue-100 text-sm">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Service 24h/24</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Tarifs réglementés</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Chauffeurs pro</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Toute la région</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}