import Link from 'next/link'
import Image from 'next/image'
import { Phone, MapPin, Clock, Star, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import BookingSection from './components/BookingSection'
import AnimateOnScroll from './components/AnimateOnScroll'

export default function HomePage() {
  const phoneNumber = "+33667237822"
  const phoneDisplay = "+33 6 67 23 78 22"

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] text-white overflow-hidden">
        <Image
          src="/images/hero/taxi-sign-sunset.jpg"
          alt="Taxi Bordeaux"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">

            {/* Contenu principal */}
            <div className="space-y-8 lg:space-y-12">

              <div className="space-y-6">
                {/* H1 : pas de masquage opacity → LCP immédiat */}
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    LA Solution
                  </span>
                  <br />
                  <span className="text-yellow-400">
                    Taxi Bordeaux
                  </span>
                </h1>

                <p
                  className="text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-2xl font-light"
                  style={{ animation: 'slideUp 0.5s ease 0.15s both' }}
                >
                  Service fiable et régulier disponible 24h/24.{' '}
                  <strong className="text-white font-semibold">Réservation instantanée</strong>,{' '}
                  prise en charge rapide dans toute la métropole bordelaise.
                </p>
              </div>

              {/* CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-4 lg:gap-6"
                style={{ animation: 'slideUp 0.5s ease 0.25s both' }}
              >
                <a
                  href="#reservation-mobile"
                  className="lg:hidden group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 text-center shadow-2xl hover:shadow-blue-500/25 hover:scale-105 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-3">
                    Estimez votre trajet en ligne
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>

                <a
                  href={`tel:${phoneNumber}`}
                  className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 text-center shadow-2xl hover:shadow-green-500/25 hover:scale-105 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Phone size={20} className="group-hover:rotate-12 transition-transform" />
                    {phoneDisplay}
                  </span>
                </a>

                <a
                  href="/contact"
                  className="hidden lg:block group relative bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 text-center shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-3">
                    Nous contacter
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
              </div>

              {/* Stats */}
              <div
                className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10"
                style={{ animation: 'slideUp 0.5s ease 0.35s both' }}
              >
                <div className="text-center hover:scale-105 transition-transform duration-300 cursor-default">
                  <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1">Rapide</div>
                  <div className="text-sm text-slate-400 font-medium">Prise en charge</div>
                </div>
                <div className="text-center hover:scale-105 transition-transform duration-300 cursor-default">
                  <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1">24/7</div>
                  <div className="text-sm text-slate-400 font-medium">Service continu</div>
                </div>
                <div className="text-center hover:scale-105 transition-transform duration-300 cursor-default">
                  <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1">100%</div>
                  <div className="text-sm text-slate-400 font-medium">Fiabilité</div>
                </div>
              </div>
            </div>

            {/* Module de réservation - visible sur desktop */}
            <div className="hidden lg:block relative z-10" id="reservation">
              <BookingSection />
            </div>
          </div>
        </div>
      </section>

      {/* Module de réservation - visible sur mobile uniquement */}
      <section id="reservation-mobile" className="bg-white relative lg:hidden">
        <BookingSection />
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">

          <AnimateOnScroll className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              La Solution Transport
              <span className="text-blue-600"> à Bordeaux</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Service taxi professionnel dans toute la métropole.{' '}
              Réservation simple, prise en charge rapide garantie.
            </p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Service Aéroport */}
            <AnimateOnScroll delay={0}>
            <Link href="/aeroport" className="block group">
              <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-200 overflow-hidden cursor-pointer hover:-translate-y-2 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
                    Liaison directe aéroport Bordeaux-Mérignac.{' '}
                    Prise en charge rapide, suivi des vols, service fiable 24h/24.
                  </p>
                </div>
              </div>
            </Link>
            </AnimateOnScroll>

            {/* Service Gare */}
            <AnimateOnScroll delay={100}>
            <Link href="/gare" className="block group">
              <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-green-200 overflow-hidden cursor-pointer hover:-translate-y-2 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/images/hero/gare de bordeaux.webp"
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
                    Transport gare SNCF Saint-Jean.{' '}
                    Arrivée ponctuelle, aide aux bagages, connexion immédiate.
                  </p>
                </div>
              </div>
            </Link>
            </AnimateOnScroll>

            {/* Service Ville */}
            <AnimateOnScroll delay={200}>
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-yellow-200 overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/hero/Panorama Bordeaux.webp"
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
                  Courses urbaines dans Bordeaux.{' '}
                  Prise en charge rapide, connaissance parfaite de la ville.
                </p>
              </div>
            </div>
            </AnimateOnScroll>

            {/* Service Professionnel */}
            <AnimateOnScroll delay={0}>
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-purple-200 overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/hero/Voyage d'affaire.webp"
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
                  Déplacements d&apos;affaires à Bordeaux.{' '}
                  Service discret, ponctualité garantie, transport régulier et fiable.
                </p>
              </div>
            </div>
            </AnimateOnScroll>

            {/* Service Événements */}
            <AnimateOnScroll delay={100}>
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-pink-200 overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
                  Transport pour vos sorties à Bordeaux.{' '}
                  Mariages, soirées, événements - service sur-mesure.
                </p>
              </div>
            </div>
            </AnimateOnScroll>

            {/* Service 24h */}
            <AnimateOnScroll delay={200}>
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-indigo-200 overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
                  Service nocturne à Bordeaux.{' '}
                  Disponible toute la nuit, retours de soirée sécurisés.
                </p>
              </div>
            </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Destinations touristiques depuis Bordeaux */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <AnimateOnScroll className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Taxi Bordeaux vers les
              <span className="text-blue-600"> plus belles destinations</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Stations balnéaires, vignobles et sites touristiques — votre taxi vous emmène partout depuis Bordeaux
            </p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

            <AnimateOnScroll delay={0}>
              <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden hover:-translate-y-2">
                <div className="relative h-52 overflow-hidden">
                  <Image src="/images/hero/Arcachon/Plage Arcachon.jpg" alt="Taxi Bordeaux Arcachon - Plage" width={400} height={208} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">~50 min</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Taxi Bordeaux → Arcachon</h3>
                  <p className="text-slate-600 text-sm">Bassin d&apos;Arcachon, plages de sable fin, restaurants de fruits de mer et cabanes ostréicoles.</p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden hover:-translate-y-2">
                <div className="relative h-52 overflow-hidden">
                  <Image src="/images/hero/Cap Ferret/Plage Cap Ferret.jpg" alt="Taxi Bordeaux Cap Ferret - Plage" width={400} height={208} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">~1h</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Taxi Bordeaux → Cap Ferret</h3>
                  <p className="text-slate-600 text-sm">Le &quot;Saint-Tropez de l&apos;Atlantique&quot;. Villages ostréicoles, phare, plages océanes et ambiance unique.</p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden hover:-translate-y-2">
                <div className="relative h-52 overflow-hidden">
                  <Image src="/images/hero/Arcachon/Dune du pyla.jpg" alt="Taxi Bordeaux Dune du Pilat" width={400} height={208} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">~50 min</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Taxi Bordeaux → Dune du Pilat</h3>
                  <p className="text-slate-600 text-sm">La plus haute dune d&apos;Europe. Vue panoramique sur l&apos;océan, le banc d&apos;Arguin et la forêt des Landes.</p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={0}>
              <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden hover:-translate-y-2">
                <div className="relative h-52 overflow-hidden">
                  <Image src="/images/hero/village de Saint-Emilion.webp" alt="Taxi Bordeaux Saint-Émilion" width={400} height={208} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">~45 min</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Taxi Bordeaux → Saint-Émilion</h3>
                  <p className="text-slate-600 text-sm">Village classé UNESCO. Vignobles prestigieux, cité médiévale et dégustations de grands crus.</p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden hover:-translate-y-2">
                <div className="relative h-52 overflow-hidden">
                  <Image src="/images/hero/Plage lacanau.jpg" alt="Taxi Bordeaux Lacanau - Plage et surf" width={400} height={208} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">~1h</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Taxi Bordeaux → Lacanau</h3>
                  <p className="text-slate-600 text-sm">Spot de surf réputé, lac et océan. Station balnéaire familiale très prisée en été.</p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden hover:-translate-y-2">
                <div className="relative h-52 overflow-hidden">
                  <Image src="/images/hero/Vue sur le Bassin-Arcachon.jpg" alt="Taxi Bordeaux Bassin d'Arcachon" width={400} height={208} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">~50 min</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Taxi Bordeaux → Bassin d&apos;Arcachon</h3>
                  <p className="text-slate-600 text-sm">Andernos, Gujan-Mestras, La Teste-de-Buch. Tour du Bassin, parcs à huîtres et nature préservée.</p>
                </div>
              </div>
            </AnimateOnScroll>

          </div>

          <AnimateOnScroll className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+33667237822"
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Phone size={22} />
              Appeler maintenant
              <ArrowRight size={20} />
            </a>
            <a
              href="#reservation"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Réserver en ligne
              <ArrowRight size={20} />
            </a>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>

        <div className="relative container mx-auto px-4">
          <AnimateOnScroll className="text-center mb-16">
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
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            <AnimateOnScroll delay={0}>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Zap className="text-white" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">Rapidité Bordeaux</h3>
              <p className="text-slate-400 leading-relaxed">
                Prise en charge rapide partout à Bordeaux.{' '}
                Géolocalisation précise, arrivée garantie.
              </p>
            </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Shield className="text-white" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">Taxi Réglementé</h3>
              <p className="text-slate-400 leading-relaxed">
                Licence officielle taxi Bordeaux.{' '}
                Véhicules assurés, tarifs préfecture, service légal.
              </p>
            </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Clock className="text-white" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">Disponibilité 24h/24</h3>
              <p className="text-slate-400 leading-relaxed">
                Service continu jour et nuit à Bordeaux.{' '}
                Weekends, jours fériés - toujours disponible.
              </p>
            </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={300}>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Star className="text-white" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">Excellence Service</h3>
              <p className="text-slate-400 leading-relaxed">
                Chauffeurs expérimentés Bordeaux.{' '}
                Véhicules propres, accueil professionnel, satisfaction garantie.
              </p>
            </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Zone Bordeaux - SEO Optimisé */}
      <section id="zones-bordeaux" className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
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
              <a href="tel:+33667237822" className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors mb-2 block">
                +33 6 67 23 78 22
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
                Réponse rapide
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

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent"></div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">

            <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
              Besoin d&apos;un Taxi à
              <span className="text-yellow-400"> Bordeaux ?</span>
            </h2>

            <p className="text-xl lg:text-2xl text-slate-300 font-light leading-relaxed">
              <strong className="text-white">Réservation en 30 secondes</strong> -{' '}
              Prise en charge rapide garantie partout à Bordeaux.{' '}
              Service professionnel disponible 24h/24.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <a
                href="#reservation"
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25 hover:scale-105 active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-3">
                  📱 Réserver Taxi Bordeaux
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </a>

              <a
                href={`tel:${phoneNumber}`}
                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/20 text-white px-10 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-[0.98]"
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
