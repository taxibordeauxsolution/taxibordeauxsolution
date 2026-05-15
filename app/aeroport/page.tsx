'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Phone, CheckCircle, Calendar } from 'lucide-react'
import BookingSection from '../components/BookingSection'
import Breadcrumb from '../components/Breadcrumb'
import {
  AirplaneTakeoff,
  AirplaneLanding,
  ClockCounterClockwise,
  Car,
  Buildings,
  Train,
  Timer,
  UserCheck,
  CreditCard,
} from '@phosphor-icons/react'

const DESTINATIONS = [
  { label: 'Bordeaux Centre-Ville',  desc: 'Chartrons, Quinconces, Triangle d\'Or, hôtels du centre.',       km: 13.2, min: 22, color: 'blue'    },
  { label: 'Gare Saint-Jean',        desc: 'Connexion directe TGV/trains, correspondances SNCF.', href: '/gare', km: 13.5, min: 23, color: 'green'   },
  { label: 'Pessac / Talence',       desc: 'Campus universitaires, zones résidentielles sud.',                km: 9.0,  min: 18, color: 'purple'  },
  { label: 'Bordeaux-Lac',          desc: 'Palais des Congrès, quartier d\'affaires, centre commercial.',    km: 17.0, min: 27, color: 'orange'  },
  { label: 'Bordeaux Bastide',       desc: 'Rive droite, Darwin, quartiers est de Bordeaux.',                 km: 15.8, min: 26, color: 'cyan'    },
  { label: 'Toute la Métropole',     desc: 'Le Bouscat, Eysines, Bègles et toute la Gironde.',               km: 15,   min: 25, color: 'emerald' },
]

export default function TaxiAeroport() {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: 'Accueil', href: '/' },
        { label: 'Taxi Aéroport Mérignac' }
      ]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-300/15 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 text-center relative z-10">

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Taxi Bordeaux</span>
            <span className="block mt-2 text-4xl md:text-5xl text-gray-700">Aéroport Mérignac</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto leading-relaxed">
            Chauffeur disponible 24h/24 à l&apos;<a href="https://www.bordeaux.aeroport.fr/" target="_blank" rel="noopener" className="underline decoration-blue-300 hover:text-blue-600 transition-colors">aéroport de Bordeaux-Mérignac</a>.
            Prise en charge immédiate au Hall A — transferts vers tout Bordeaux et sa métropole.
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
            Départ ou arrivée — réservez votre course à l&apos;avance
            ou sur le moment. Tarifs réglementés, service professionnel.
          </p>

          <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto mb-16">
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <a
                href="tel:+33667237822"
                className="group bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-green-500/25 hover:scale-105 flex items-center justify-center gap-3"
              >
                <Phone size={24} />
                <span>+33 6 67 23 78 22</span>
              </a>
            </div>

            <a
              href="#reserver-en-ligne"
              className="group bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <Calendar size={22} />
              <span>Estimez et réservez votre trajet</span>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AirplaneTakeoff size={32} className="text-blue-600" weight="duotone" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Hall A</div>
              <div className="text-sm text-gray-600">Station officielle</div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ClockCounterClockwise size={32} className="text-green-600" weight="duotone" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">24h/24</div>
              <div className="text-sm text-gray-600">7j/7 jours fériés inclus</div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UserCheck size={32} className="text-yellow-600" weight="duotone" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Fiable</div>
              <div className="text-sm text-gray-600">Chauffeurs certifiés & de confiance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Taxi Mérignac — 2 sens */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Taxi Mérignac — Départ et Arrivée
            </h2>
            <p className="text-xl text-gray-600">
              Que vous partiez en voyage ou que vous arriviez à Bordeaux, votre chauffeur est toujours là pour vous conduire.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl border border-blue-200">
              <div className="w-16 h-16 bg-blue-200 rounded-2xl flex items-center justify-center mb-6 shadow">
                <AirplaneTakeoff size={36} className="text-blue-700" weight="duotone" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Bordeaux – Aéroport</h3>
              <p className="text-gray-700 mb-5">
                Prise en charge à domicile, hôtel, gare ou n&apos;importe où dans la métropole. Votre chauffeur est ponctuel même aux horaires matinaux.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500 shrink-0" />Réservation à l&apos;avance recommandée</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500 shrink-0" />Aide au chargement des bagages</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500 shrink-0" />Dépôt au terminal de votre vol</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl border border-green-200">
              <div className="w-16 h-16 bg-green-200 rounded-2xl flex items-center justify-center mb-6 shadow">
                <AirplaneLanding size={36} className="text-green-700" weight="duotone" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aéroport – Bordeaux</h3>
              <p className="text-gray-700 mb-5">
                Station officielle au Hall A. Votre chauffeur suit les horaires de vol en temps réel et s&apos;adapte aux retards éventuels.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500 shrink-0" />Suivi des vols en temps réel</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500 shrink-0" />Attente incluse sans supplément</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500 shrink-0" />Accueil direct en sortie d&apos;arrivées</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations depuis l'aéroport */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Taxi Mérignac vers Toute la Métropole
            </h2>
            <p className="text-xl text-gray-600">
              Depuis l&apos;aéroport Bordeaux-Mérignac, votre chauffeur vous emmène partout dans la région bordelaise.
            </p>
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

      {/* Prix Taxi Bordeaux — Tarif Mérignac */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Prix Taxi Bordeaux — Tarif Mérignac Officiel
            </h2>
            <p className="text-xl text-gray-600">
              Les tarifs sont réglementés par la Préfecture de Gironde.
              Aucun supplément caché — le compteur fait foi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
                <Timer size={32} className="text-blue-600" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tarif Jour</h3>
              <p className="text-gray-600 mb-4 text-sm">Lundi au samedi de 7h00 à 19h00</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-blue-500 shrink-0" />Tarif au compteur réglementé</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-blue-500 shrink-0" />Applicable tous les jours ouvrés</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-blue-500 shrink-0" />Bagages inclus sans supplément</li>
              </ul>
            </div>

            <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5">
                <ClockCounterClockwise size={32} className="text-indigo-600" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tarif Nuit & Week-end</h3>
              <p className="text-gray-600 mb-4 text-sm">19h00 – 7h00, dimanches et jours fériés</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-indigo-500 shrink-0" />Tarif nuit réglementé Préfecture</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-indigo-500 shrink-0" />Applicable dimanches et fériés</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-indigo-500 shrink-0" />Aucun supplément non annoncé</li>
              </ul>
            </div>

            <div className="bg-green-50 p-8 rounded-3xl border border-green-100">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
                <CreditCard size={32} className="text-green-600" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Paiement CB Accepté</h3>
              <p className="text-gray-600 mb-4 text-sm">Tous moyens de paiement acceptés</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-green-500 shrink-0" />Carte bancaire (Visa, Mastercard)</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-green-500 shrink-0" />Espèces</li>
                <li className="flex items-center gap-2"><CheckCircle size={15} className="text-green-500 shrink-0" />Paiement sans contact</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Taxi Aéroport Gare — liaison */}
      <section className="py-20 bg-sky-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Taxi Aéroport – Gare Saint-Jean
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              La liaison aéroport — <Link href="/gare" className="underline decoration-blue-300 hover:text-blue-600 transition-colors">gare Saint-Jean</Link> la plus directe.
              Connectez votre vol à votre <a href="https://www.garesetconnexions.sncf/fr/gares-services/bordeaux-saint-jean" target="_blank" rel="noopener" className="underline decoration-blue-300 hover:text-blue-600 transition-colors">TGV</a> sans stress ni changement.
            </p>
            <div className="inline-flex flex-col sm:flex-row gap-4 bg-white border border-sky-200 rounded-2xl px-8 py-5 shadow-md">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">60€</div>
                <div className="text-sm text-gray-500 mt-1">Tarif jour</div>
                <div className="text-xs text-gray-400">7h – 19h</div>
              </div>
              <div className="hidden sm:block w-px bg-gray-200 self-stretch"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">70€</div>
                <div className="text-sm text-gray-500 mt-1">Tarif nuit / week-end</div>
                <div className="text-xs text-gray-400">19h – 7h • dim. & fériés</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-5">
              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-sky-100">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
                  <AirplaneLanding size={24} className="text-sky-600" weight="duotone" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Aéroport – Gare Saint-Jean</h4>
                  <p className="text-gray-600 text-sm">Votre chauffeur suit votre vol en temps réel. Il sera là à l&apos;atterrissage — même si votre avion a du retard.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-sky-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Train size={24} className="text-green-600" weight="duotone" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Gare Saint-Jean – Aéroport</h4>
                  <p className="text-gray-600 text-sm">Partez de la gare à l&apos;heure exacte. Pas d&apos;attente, trajet direct ~23 min vers l&apos;aéroport.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-sky-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <Timer size={24} className="text-purple-600" weight="duotone" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Correspondances TGV + Vols</h4>
                  <p className="text-gray-600 text-sm">La solution idéale pour les correspondances serrées entre train et avion. Prévenez-nous du contexte pour une prise en charge optimisée.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-sky-100 text-center">
              <div className="w-20 h-20 bg-sky-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Car size={44} className="text-sky-600" weight="duotone" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Réservez votre liaison</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Appelez ou réservez en ligne — indiquez votre n° de vol ou de train pour une prise en charge parfaitement synchronisée.
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
      </section>

      {/* Pourquoi nous */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Pourquoi choisir notre Taxi Bordeaux Aéroport
            </h2>
            <p className="text-xl text-gray-600">
              Taxi Bordeaux Solution est le partenaire de confiance
              des voyageurs à l&apos;aéroport de Mérignac.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-gray-50 rounded-3xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Timer size={48} className="text-blue-600" weight="bold" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Ponctualité Garantie</h3>
              </div>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-blue-500 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Suivi des vols en temps réel</h4>
                    <p className="text-gray-600 text-sm">Votre chauffeur s&apos;adapte aux retards — il sera là à votre atterrissage, pas avant, pas après.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-blue-500 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Réservation à l&apos;avance</h4>
                    <p className="text-gray-600 text-sm">Planifiez votre départ ou arrivée — idéal pour les vols tôt le matin ou tard le soir.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-blue-500 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Itinéraires directs optimisés</h4>
                    <p className="text-gray-600 text-sm">Connaissance parfaite de la circulation bordelaise et des accès aéroport.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <UserCheck size={48} className="text-green-600" weight="duotone" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Service Professionnel</h3>
              </div>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-green-500 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Disponible 24h/24</h4>
                    <p className="text-gray-600 text-sm">Premiers vols du matin, derniers vols de nuit — votre chauffeur est toujours disponible.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-green-500 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Chauffeurs certifiés Préfecture</h4>
                    <p className="text-gray-600 text-sm">Carte professionnelle Taxi délivrée par la Préfecture de Gironde.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-green-500 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Assistance bagages</h4>
                    <p className="text-gray-600 text-sm">Aide au chargement de vos valises — parfait pour les familles et voyages longue durée.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gray-50 rounded-3xl p-8 shadow max-w-6xl mx-auto text-center">
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Taxi Bordeaux Solution en chiffres</h4>
            <p className="text-gray-500 mb-8 text-sm">La confiance des voyageurs à l&apos;aéroport de Bordeaux</p>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-lg font-semibold text-gray-800 mb-1">Service Assuré</div>
                <div className="text-sm text-gray-500">Service ponctuel et fiable</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-lg font-semibold text-gray-800 mb-1">Disponibilité</div>
                <div className="text-sm text-gray-500">Vols de nuit et jours fériés inclus</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">5 min</div>
                <div className="text-lg font-semibold text-gray-800 mb-1">Temps d&apos;Attente</div>
                <div className="text-sm text-gray-500">Maximum à la station Hall A</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations touristiques depuis l'Aéroport */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Destinations touristiques depuis l&apos;Aéroport
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Atterrissez à Bordeaux-Mérignac, votre taxi vous conduit directement vers les plus beaux sites
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Arcachon', img: '/images/hero/Arcachon/Plage Arcachon.jpg', time: '~40 min', desc: 'Plages, Bassin et cabanes ostréicoles.' },
              { name: 'Cap Ferret', img: '/images/hero/Cap Ferret/Plage Cap Ferret.jpg', time: '~55 min', desc: 'Villages ostréicoles, phare et plages océanes.' },
              { name: 'Dune du Pilat', img: '/images/hero/Arcachon/Dune du pyla.jpg', time: '~45 min', desc: 'Plus haute dune d\'Europe, vue panoramique.' },
              { name: 'Saint-Émilion', img: '/images/hero/village de Saint-Emilion.webp', time: '~55 min', desc: 'Village UNESCO, vignobles et cité médiévale.' },
              { name: 'Lacanau', img: '/images/hero/Plage lacanau.jpg', time: '~45 min', desc: 'Spot de surf, lac et station balnéaire.' },
              { name: 'Bassin d\'Arcachon', img: '/images/hero/Vue sur le Bassin-Arcachon.jpg', time: '~40 min', desc: 'Andernos, Gujan-Mestras, tour du Bassin.' },
            ].map(d => (
              <div key={d.name} className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <Image src={d.img} alt={`Taxi Aéroport Bordeaux vers ${d.name}`} width={400} height={192} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{d.time}</div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Aéroport – {d.name}</h3>
                  <p className="text-gray-600 text-sm">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="tel:+33667237822" className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl">
              <Phone size={22} />
              Appeler maintenant
            </a>
          </div>
        </div>
      </section>

      {/* FAQ SEO */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Questions fréquentes — Taxi Bordeaux Aéroport
          </h2>

          <div className="space-y-6">
            <div className="border border-gray-200 bg-white rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Quel est le tarif taxi Mérignac vers Bordeaux centre ?</h3>
              <p className="text-gray-600">Le tarif est calculé selon le compteur officiel réglementé par la Préfecture de Gironde. Le montant varie selon l&apos;heure (jour ou nuit) et la destination. Aucun supplément n&apos;est appliqué sans annonce préalable.</p>
            </div>

            <div className="border border-gray-200 bg-white rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Comment réserver un taxi Bordeaux aéroport à l&apos;avance ?</h3>
              <p className="text-gray-600">Appelez le <strong>+33 6 67 23 78 22</strong> ou utilisez le formulaire de réservation en ligne. Indiquez votre numéro de vol — votre chauffeur suivra les horaires en temps réel et s&apos;adaptera à tout retard.</p>
            </div>

            <div className="border border-gray-200 bg-white rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Le taxi Mérignac accepte-t-il la carte bancaire ?</h3>
              <p className="text-gray-600">Oui. Tous nos véhicules acceptent le paiement par carte bancaire (Visa, Mastercard, sans contact) ainsi que les espèces. Aucune mauvaise surprise à l&apos;arrivée.</p>
            </div>

            <div className="border border-gray-200 bg-white rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Quelle est la différence entre taxi et navette aéroport Bordeaux ?</h3>
              <p className="text-gray-600">La navette est partagée et suit un horaire fixe avec plusieurs arrêts. Le taxi est privatif, direct, disponible 24h/24 et s&apos;adapte à votre heure d&apos;arrivée. Pour les familles ou les voyageurs avec bagages, c&apos;est souvent plus pratique et rapide.</p>
            </div>

            <div className="border border-gray-200 bg-white rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Où se trouve la station taxi à l&apos;aéroport de Bordeaux-Mérignac ?</h3>
              <p className="text-gray-600">La station taxi officielle est située au niveau extérieur du <strong>Hall A</strong>, en sortie des arrivées. Elle est signalisée. Vous pouvez aussi appeler le <strong>+33 6 67 23 78 22</strong> pour une prise en charge immédiate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Module de réservation en ligne */}
      <section id="reserver-en-ligne" className="bg-white">
        <div className="container mx-auto px-4 pt-16 pb-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Réservation en ligne — Taxi Bordeaux Aéroport</h2>
          <p className="text-gray-500 mb-0">Calculez votre trajet et réservez votre taxi Mérignac en quelques clics</p>
        </div>
        <BookingSection />
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Taxi Bordeaux Aéroport Mérignac
          </h2>
          <p className="text-xl text-blue-100 mb-4 max-w-2xl mx-auto">
            Votre chauffeur de confiance — réservez maintenant, voyagez sereinement.
          </p>
          <p className="text-blue-200 mb-12 text-sm max-w-xl mx-auto">
            Tarifs réglementés • Chauffeurs certifiés • Disponible 24h/24
          </p>

          <a
            href="tel:+33667237822"
            className="group bg-white text-green-600 px-12 py-6 rounded-2xl font-bold text-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:scale-105 inline-flex items-center gap-3"
          >
            <Phone size={28} />
            <span>+33 6 67 23 78 22</span>
          </a>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12 text-blue-100 text-sm">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Aéroport 24h/24</span>
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
              <span>CB acceptée</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
