import type { Metadata } from 'next'
import { Phone, Shield, CheckCircle, ArrowRight, Star, Calendar } from 'lucide-react'
import BookingSection from '../components/BookingSection'
import {
  Train,
  ClockCounterClockwise,
  Car,
  Buildings,
  AirplaneTakeoff,
  GraduationCap,
  Desk,
  Bridge,
  House,
  Timer,
  UserCheck
} from '@phosphor-icons/react'

export const metadata: Metadata = {
  title: 'Taxi Bordeaux Gare Saint-Jean | Réservation Taxi Bordeaux 24h/24',
  description: 'Réservez votre taxi Bordeaux Gare Saint-Jean en quelques secondes. Taxi bordelais professionnel disponible 24h/24. Bordeaux taxis transfers vers aéroport, centre-ville et toute la région. Tarifs réglementés.',
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/gare',
  },
  keywords: 'taxi bordeaux gare, taxi bordeaux, taxi bordelais, réserver taxi bordeaux, taxi bordeaux saint jean, reservation taxi bordeaux, bordeaux taxis transfers, taxi service in bordeaux',
}

export default function TaxiGare() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-green-600/10 backdrop-blur-sm border border-green-200 rounded-full px-6 py-3 text-green-700 font-semibold mb-8">
            <Train size={20} />
            <span>Station Taxi Officielle — Gare Saint-Jean Bordeaux</span>
          </div>

          {/* H1 — keyword: taxi bordeaux gare + taxi bordeaux saint jean */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            <span className="text-green-600">Taxi Bordeaux</span>
            <span className="block mt-2 text-4xl md:text-5xl text-gray-700">Gare Saint-Jean</span>
          </h1>

          {/* Intro — keywords: taxi bordelais, réserver taxi bordeaux, bordeaux taxis transfers */}
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto leading-relaxed">
            Votre <strong>taxi bordelais</strong> disponible 24h/24 à la gare SNCF Bordeaux Saint-Jean.
            Prise en charge directe sur le parvis — sans attente, sans surprise sur la note.
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
            Réservez votre <strong>taxi Bordeaux</strong> à l&apos;avance ou sur le moment.
            Transferts gare, aéroport, hôtels et toute la métropole bordelaise.
          </p>

          <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto mb-16">
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <a
                href="tel:0667237822"
                className="group bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-green-500/25 hover:scale-105 flex items-center justify-center gap-3"
              >
                <Phone size={24} />
                <span>06 67 23 78 22</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#reservation-taxi-bordeaux"
                className="bg-white border-2 border-green-200 text-green-700 px-10 py-5 rounded-2xl font-bold text-xl shadow-lg hover:border-green-400 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Shield size={24} />
                <span>Tarifs Réglementés</span>
              </a>
            </div>

            <a
              href="#reserver-en-ligne"
              className="group bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <Calendar size={22} />
              <span>Réserver en ligne</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Train size={32} className="text-green-600" weight="duotone" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Parvis Gare</div>
              <div className="text-sm text-gray-600">Station officielle</div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ClockCounterClockwise size={32} className="text-blue-600" weight="duotone" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">24h/24</div>
              <div className="text-sm text-gray-600">7j/7 jours fériés inclus</div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Car size={32} className="text-yellow-600" weight="duotone" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">3 min</div>
              <div className="text-sm text-gray-600">Temps d&apos;attente max</div>
            </div>
          </div>
        </div>
      </section>

      {/* Réserver un taxi Bordeaux — keyword: réserver taxi bordeaux + reservation taxi bordeaux */}
      <section id="reservation-taxi-bordeaux" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Réserver votre Taxi Bordeaux Gare en 30 secondes
            </h2>
            <p className="text-xl text-gray-600">
              La <strong>réservation taxi Bordeaux</strong> la plus simple depuis la gare Saint-Jean.
              Appelez ou montez directement à bord — votre taxi bordelais est là.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                3 façons de réserver votre taxi Bordeaux
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-2xl">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Appel direct</h4>
                    <p className="text-gray-600">Appelez le <strong>06 67 23 78 22</strong> — réponse immédiate, prise en charge en moins de 5 minutes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Réservation en ligne</h4>
                    <p className="text-gray-600">Utilisez le formulaire sur notre site pour planifier votre <strong>taxi Bordeaux</strong> à l&apos;heure exacte de votre arrivée.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-2xl">
                  <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Station parvis</h4>
                    <p className="text-gray-600">Sortez de la gare, dirigez-vous vers le parvis côté sortie principale. La station taxi officielle est signalisée.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Car size={48} className="text-green-700" weight="duotone" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Prise en Charge Immédiate</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Taxi service in Bordeaux</strong> — professionnel, ponctuel, tarifs officiels.
                </p>
                <p className="text-gray-600 mb-6 text-sm">
                  Aucun supplément caché. Prix compteur selon tarifs Préfecture de Gironde.
                </p>

                <a
                  href="tel:0667237822"
                  className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Phone size={20} />
                  06 67 23 78 22
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bordeaux Taxis Transfers — keyword: bordeaux taxis transfers */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Bordeaux Taxis Transfers — Toutes Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Depuis la <strong>gare Saint-Jean Bordeaux</strong>, votre taxi vous emmène partout dans la métropole.
              Transferts ponctuels, trajets professionnels ou touristiques.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <AirplaneTakeoff size={40} className="text-blue-600" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aéroport Bordeaux-Mérignac</h3>
              <p className="text-gray-600 text-sm mb-3">Liaison directe gare → aéroport. Connexion vols internationaux sans stress.</p>
              <span className="text-green-600 font-semibold text-sm">Transfer direct ~25 min</span>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Buildings size={40} className="text-green-600" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bordeaux Centre-Ville</h3>
              <p className="text-gray-600 text-sm mb-3">Chartrons, Quinconces, Triangle d&apos;Or, hôtels et restaurants du centre.</p>
              <span className="text-green-600 font-semibold text-sm">Transfer direct ~10 min</span>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <GraduationCap size={40} className="text-purple-600" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pessac / Talence</h3>
              <p className="text-gray-600 text-sm mb-3">Campus universitaires, zones résidentielles au sud de la métropole.</p>
              <span className="text-green-600 font-semibold text-sm">Transfer direct ~20 min</span>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Desk size={40} className="text-orange-600" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bordeaux-Lac</h3>
              <p className="text-gray-600 text-sm mb-3">Quartier d&apos;affaires, Palais des Congrès, centre commercial.</p>
              <span className="text-green-600 font-semibold text-sm">Transfer direct ~20 min</span>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Bridge size={40} className="text-cyan-600" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bordeaux Bastide</h3>
              <p className="text-gray-600 text-sm mb-3">Rive droite, Darwin, quartiers résidentiels est de Bordeaux.</p>
              <span className="text-green-600 font-semibold text-sm">Transfer direct ~15 min</span>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <House size={40} className="text-emerald-600" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Toute la Métropole</h3>
              <p className="text-gray-600 text-sm mb-3">Mérignac, Le Bouscat, Eysines, Bègles et toute la Gironde.</p>
              <span className="text-green-600 font-semibold text-sm">Sur devis au compteur</span>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-8 max-w-3xl mx-auto shadow-lg border border-green-100">
              <h4 className="text-xl font-bold text-gray-900 mb-3">Tarifs Compteur — Préfecture de Gironde</h4>
              <p className="text-gray-700">
                Tous les <strong>taxis bordelais</strong> de notre service appliquent les tarifs officiels réglementés.
                Prix calculé selon la distance réelle et les conditions de circulation — aucun supplément non annoncé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir — keywords: taxi bordeaux, taxi service in bordeaux */}
      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Pourquoi choisir notre Taxi Service à Bordeaux
            </h2>
            <p className="text-xl text-gray-600">
              Parmi tous les <strong>taxis Bordeaux</strong>, Taxi Bordeaux Solution est le partenaire de confiance
              des voyageurs à la gare Saint-Jean depuis plusieurs années.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">

              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Timer size={48} className="text-green-600" weight="bold" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Ponctualité Garantie</h3>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-green-500 mt-1 shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Suivi des trains SNCF</h4>
                      <p className="text-gray-600 text-sm">Votre chauffeur suit les horaires en temps réel — il sera là même si votre train est en retard.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-green-500 mt-1 shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Réservation taxi Bordeaux à l&apos;avance</h4>
                      <p className="text-gray-600 text-sm">Planifiez votre prise en charge avec précision — idéal pour les correspondances et les vols.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-green-500 mt-1 shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Trajets directs optimisés</h4>
                      <p className="text-gray-600 text-sm">Itinéraires les plus rapides, connaissance parfaite de la circulation bordelaise.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <UserCheck size={48} className="text-blue-600" weight="duotone" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Service Professionnel</h3>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-blue-500 mt-1 shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Taxi Bordeaux disponible 24h/24</h4>
                      <p className="text-gray-600 text-sm">Premiers trains du matin, derniers trains de nuit — votre taxi bordelais est toujours là.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-blue-500 mt-1 shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Chauffeurs certifiés</h4>
                      <p className="text-gray-600 text-sm">Tous nos chauffeurs sont titulaires de la carte professionnelle VTC/Taxi délivrée par la Préfecture.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-blue-500 mt-1 shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Assistance bagages</h4>
                      <p className="text-gray-600 text-sm">Aide au chargement de vos valises — parfait pour les longs voyages et les familles.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performances */}
            <div className="mt-12 bg-white rounded-3xl p-8 shadow-lg text-center">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Taxi Bordeaux Solution en chiffres</h4>
              <p className="text-gray-500 mb-8 text-sm">Le taxi bordelais qui a la confiance des voyageurs de la gare Saint-Jean</p>

              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                  <div className="text-lg font-semibold text-gray-800 mb-1">Service Assuré</div>
                  <div className="text-sm text-gray-500">Aucune annulation depuis 2 ans</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-lg font-semibold text-gray-800 mb-1">Disponibilité</div>
                  <div className="text-sm text-gray-500">Jours fériés et nuits inclus</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">3 min</div>
                  <div className="text-lg font-semibold text-gray-800 mb-1">Temps d&apos;Attente</div>
                  <div className="text-sm text-gray-500">Maximum à la station parvis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SEO — keywords longue traîne */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Questions fréquentes — Taxi Bordeaux Gare
          </h2>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Comment réserver un taxi Bordeaux depuis la gare Saint-Jean ?</h3>
              <p className="text-gray-600">Appelez directement le <strong>06 67 23 78 22</strong> ou utilisez le formulaire en ligne. La <strong>réservation taxi Bordeaux</strong> prend moins d&apos;une minute. Vous pouvez aussi vous présenter directement à la station taxi sur le parvis de la gare.</p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Quel est le tarif taxi Bordeaux gare vers l&apos;aéroport ?</h3>
              <p className="text-gray-600">Le <strong>taxi Bordeaux</strong> gare Saint-Jean vers l&apos;aéroport de Mérignac est facturé selon le compteur officiel de la Préfecture de Gironde. Le trajet dure environ 25 minutes et coûte entre 35€ et 50€ selon les horaires (tarif jour/nuit).</p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Les taxis bordelais sont-ils disponibles la nuit à la gare ?</h3>
              <p className="text-gray-600">Oui. Notre <strong>taxi service in Bordeaux</strong> fonctionne 24h/24, 7j/7. Que votre train arrive à 23h ou à 5h du matin, un <strong>taxi bordelais</strong> sera disponible à la station parvis ou en quelques minutes sur appel.</p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Puis-je réserver un taxi Bordeaux à l&apos;avance pour la gare ?</h3>
              <p className="text-gray-600">Absolument. La <strong>reservation taxi Bordeaux</strong> à l&apos;avance est recommandée pour les correspondances, les horaires matinaux et les groupes. Nous suivons les horaires SNCF en temps réel pour nous adapter aux retards éventuels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Module de réservation en ligne */}
      <section id="reserver-en-ligne" className="bg-white">
        <div className="container mx-auto px-4 pt-16 pb-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Réservation en ligne — Taxi Bordeaux Gare</h2>
          <p className="text-gray-500 mb-0">Calculez votre trajet et réservez votre taxi Bordeaux en quelques clics</p>
        </div>
        <BookingSection />
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Taxi Bordeaux Gare Saint-Jean
          </h2>
          <p className="text-xl text-green-100 mb-4 max-w-2xl mx-auto">
            Votre <strong>taxi bordelais</strong> de confiance — réservez maintenant, voyagez sereinement.
          </p>
          <p className="text-green-200 mb-12 text-sm max-w-xl mx-auto">
            Bordeaux taxis transfers • Tarifs réglementés • Chauffeurs certifiés • 24h/24
          </p>

          <a
            href="tel:0667237822"
            className="group bg-white text-green-600 px-12 py-6 rounded-2xl font-bold text-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:scale-105 inline-flex items-center gap-3"
          >
            <Phone size={28} />
            <span>06 67 23 78 22</span>
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12 text-green-100 text-sm">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Taxi Bordeaux 24h/24</span>
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
              <span>Toute la métropole</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
