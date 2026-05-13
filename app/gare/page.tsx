'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Phone, CheckCircle, ArrowRight, Calendar } from 'lucide-react'
import BookingSection from '../components/BookingSection'
import Breadcrumb from '../components/Breadcrumb'
import {
  Train,
  ClockCounterClockwise,
  Car,
  Timer,
  UserCheck
} from '@phosphor-icons/react'


// Distances réelles depuis la Gare Saint-Jean Bordeaux (Google Maps)
const DESTINATIONS = [
  { label: 'Aéroport Bordeaux-Mérignac', desc: 'Liaison directe gare → aéroport. Connexion vols internationaux sans stress.', href: '/aeroport', km: 13.5, min: 23, color: 'blue',    Icon: 'AirplaneTakeoff' },
  { label: 'Bordeaux Centre-Ville',       desc: 'Chartrons, Quinconces, Triangle d\'Or, hôtels et restaurants du centre.',         km: 2.7,  min: 9,  color: 'green',   Icon: 'Buildings'      },
  { label: 'Pessac / Talence',            desc: 'Campus universitaires, zones résidentielles au sud de la métropole.',            km: 8.3,  min: 17, color: 'purple',  Icon: 'GraduationCap'  },
  { label: 'Bordeaux-Lac',               desc: 'Quartier d\'affaires, Palais des Congrès, centre commercial.',                    km: 9.1,  min: 19, color: 'orange',  Icon: 'Desk'           },
  { label: 'Bordeaux Bastide',            desc: 'Rive droite, Darwin, quartiers résidentiels est de Bordeaux.',                    km: 3.2,  min: 10, color: 'cyan',    Icon: 'Bridge'         },
  { label: 'Toute la Métropole',          desc: 'Mérignac, Le Bouscat, Eysines, Bègles et toute la Gironde.',                    km: 11,   min: 22, color: 'emerald', Icon: 'House'          },
]

export default function TaxiGare() {

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: 'Accueil', href: '/' },
        { label: 'Taxi Gare Saint-Jean' }
      ]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 text-center relative z-10">


          {/* H1 — keyword: taxi bordeaux gare + taxi bordeaux saint jean */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            <span className="text-green-600">Taxi Bordeaux</span>
            <span className="block mt-2 text-4xl md:text-5xl text-gray-700">Gare Saint-Jean</span>
          </h1>

          {/* Intro — keywords: taxi bordelais, réserver taxi bordeaux */}
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto leading-relaxed">
            Votre <strong>taxi bordelais</strong> disponible 24h/24 à la{' '}
            <a href="https://www.garesetconnexions.sncf/fr/gares-services/bordeaux-saint-jean" target="_blank" rel="noopener noreferrer" className="text-green-600 underline hover:text-green-800">gare SNCF Bordeaux Saint-Jean</a>.
            Prise en charge directe sur le parvis — sans attente, sans surprise sur la note.
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
            Réservez votre <strong>taxi Bordeaux</strong> à l&apos;avance ou sur le moment.
            Transferts gare, aéroport, hôtels et toute la métropole bordelaise.
          </p>

          <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto mb-16">
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <a
                href="tel:+33667237822"
                className="group bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-green-500/25 hover:scale-105 flex items-center justify-center gap-3"
              >
                <Phone size={24} />
                <span>+33 6 67 23 78 22</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>

            </div>

            <a
              href="#reserver-en-ligne"
              className="group bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <Calendar size={22} />
              <span>Estimez et réservez votre trajet</span>
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
              <div className="text-2xl font-bold text-gray-900 mb-1">10 min</div>
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
              Réservez votre Taxi Bordeaux Gare en ligne ou par appel
            </h2>
            <p className="text-xl text-gray-600">
              La <strong>réservation taxi Bordeaux</strong> la plus simple depuis la gare Saint-Jean.
              Réservez en ligne ou par appel — votre taxi bordelais est là.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                2 façons de réserver votre taxi Bordeaux
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-2xl">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Appel direct</h4>
                    <p className="text-gray-600">Appelez le <strong>+33 6 67 23 78 22</strong> — réponse immédiate, prise en charge en moins de 10 minutes.</p>
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

              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Car size={48} className="text-green-700" weight="duotone" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Prise en Charge Immédiate</h3>
                <p className="text-gray-700 mb-2">
                  Service professionnel, ponctuel, tarifs officiels.
                </p>
                <p className="text-gray-600 mb-6 text-sm">
                  Aucun supplément caché. Tarifs officiels réglementés.
                </p>

                <a
                  href="tel:+33667237822"
                  className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Phone size={20} />
                  +33 6 67 23 78 22
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
              Toutes les destinations depuis la Gare Saint-Jean
            </h2>
            <p className="text-xl text-gray-600">
              Depuis la <strong>gare Saint-Jean Bordeaux</strong>, votre taxi vous emmène partout dans la métropole.
              Transferts ponctuels, trajets professionnels ou touristiques.
            </p>
          </div>

          {/* Liaison vedette Gare ↔ Aéroport */}
          <div className="max-w-6xl mx-auto mb-10">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <div className="text-sm font-semibold text-blue-200 mb-1 uppercase tracking-wide">Liaison directe</div>
                <h3 className="text-2xl font-bold mb-2"><Link href="/aeroport" className="hover:underline">Gare Saint-Jean ↔ Aéroport Mérignac</Link></h3>
                <p className="text-blue-100 text-sm">~25 min • Trajet direct sans escale</p>
              </div>
              <div className="flex gap-6 shrink-0">
                <div className="text-center bg-white/15 rounded-2xl px-6 py-4">
                  <div className="text-3xl font-bold">60€</div>
                  <div className="text-blue-200 text-xs mt-1">Tarif jour</div>
                  <div className="text-blue-300 text-xs">7h – 19h</div>
                </div>
                <div className="text-center bg-white/15 rounded-2xl px-6 py-4">
                  <div className="text-3xl font-bold">70€</div>
                  <div className="text-blue-200 text-xs mt-1">Tarif nuit</div>
                  <div className="text-blue-300 text-xs">19h – 7h • dim.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {DESTINATIONS.map(({ label, desc, href }) => {
              const content = (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{label}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </>
              )
              return href ? (
                <Link key={label} href={href} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300 block">
                  {content}
                </Link>
              ) : (
                <div key={label} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
                  {content}
                </div>
              )
            })}
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
                      <p className="text-gray-600 text-sm">Tous nos chauffeurs sont titulaires de la carte professionnelle Taxi délivrée par la <a href="https://www.gironde.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-green-600 underline hover:text-green-800">Préfecture de Gironde</a>.</p>
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
                  <div className="text-sm text-gray-500">Service ponctuel et fiable</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-lg font-semibold text-gray-800 mb-1">Disponibilité</div>
                  <div className="text-sm text-gray-500">Jours fériés et nuits inclus</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">10 min</div>
                  <div className="text-lg font-semibold text-gray-800 mb-1">Temps d&apos;Attente</div>
                  <div className="text-sm text-gray-500">Maximum à la station parvis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations touristiques depuis la Gare */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Destinations touristiques depuis la Gare Saint-Jean
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Votre taxi vous emmène vers les plus beaux sites de la région bordelaise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Arcachon', img: '/images/hero/Arcachon/Plage Arcachon.jpg', time: '~50 min', desc: 'Plages, Bassin et cabanes ostréicoles.' },
              { name: 'Cap Ferret', img: '/images/hero/Cap Ferret/Plage Cap Ferret.jpg', time: '~1h', desc: 'Villages ostréicoles, phare et plages océanes.' },
              { name: 'Dune du Pilat', img: '/images/hero/Arcachon/Dune du pyla.jpg', time: '~50 min', desc: 'Plus haute dune d\'Europe, vue panoramique.' },
              { name: 'Saint-Émilion', img: '/images/hero/village de Saint-Emilion.webp', time: '~45 min', desc: 'Village UNESCO, vignobles et cité médiévale.' },
              { name: 'Lacanau', img: '/images/hero/Plage lacanau.jpg', time: '~1h', desc: 'Spot de surf, lac et station balnéaire.' },
              { name: 'Bassin d\'Arcachon', img: '/images/hero/Vue sur le Bassin-Arcachon.jpg', time: '~50 min', desc: 'Andernos, Gujan-Mestras, tour du Bassin.' },
            ].map(d => (
              <div key={d.name} className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <Image src={d.img} alt={`Taxi Gare Bordeaux vers ${d.name}`} width={400} height={192} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{d.time}</div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Gare Saint-Jean → {d.name}</h3>
                  <p className="text-gray-600 text-sm">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="tel:+33667237822" className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl">
              <Phone size={22} />
              Appeler maintenant
              <ArrowRight size={20} />
            </a>
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
              <p className="text-gray-600">Appelez directement le <strong>+33 6 67 23 78 22</strong> ou utilisez le formulaire en ligne. La réservation prend moins d&apos;une minute. Vous pouvez aussi vous présenter directement à la station taxi sur le parvis de la gare.</p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Quel est le tarif taxi Bordeaux gare vers l&apos;aéroport ?</h3>
              <p className="text-gray-600">Le trajet en taxi de la gare Saint-Jean vers l&apos;aéroport de Mérignac est facturé selon le compteur officiel de la Préfecture de Gironde. Comptez environ 30 minutes.</p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Les taxis bordelais sont-ils disponibles la nuit à la gare ?</h3>
              <p className="text-gray-600">Oui. Notre service de taxi à Bordeaux fonctionne 24h/24, 7j/7. Que votre train arrive à 23h ou à 5h du matin, un chauffeur sera disponible à la station parvis ou en quelques minutes sur appel.</p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Puis-je réserver un taxi Bordeaux à l&apos;avance pour la gare ?</h3>
              <p className="text-gray-600">Absolument. La réservation à l&apos;avance est recommandée pour les correspondances, les horaires matinaux et les groupes. Nous suivons les horaires SNCF en temps réel pour nous adapter aux retards éventuels.</p>
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
            Transferts gare et aéroport • Tarifs réglementés • Chauffeurs certifiés • 24h/24
          </p>

          <a
            href="tel:+33667237822"
            className="group bg-white text-green-600 px-12 py-6 rounded-2xl font-bold text-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:scale-105 inline-flex items-center gap-3"
          >
            <Phone size={28} />
            <span>+33 6 67 23 78 22</span>
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
