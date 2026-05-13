'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Star, Shield } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  const phoneNumber = "+33667237822"
  const phoneDisplay = "+33 6 67 23 78 22"

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      {/* Section principale */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Colonne 1: Informations entreprise */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg p-1 overflow-hidden">
                <Image 
                  src="/images/logo/Logo Taxi Bordeaux Solution.png.png" 
                  alt="Logo Taxi Bordeaux Solution" 
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Taxi Bordeaux Solution</h3>
                <p className="text-gray-400 text-sm">Service professionnel</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Votre service de taxi de confiance à Bordeaux. 
              Transport fiable, confortable et sécurisé 24h/24 et 7j/7 
              dans toute la Gironde.
            </p>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-green-600 px-2 py-1 rounded text-xs">
                <Shield size={14} />
                <span>Taxi Réglementé</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-600 px-2 py-1 rounded text-xs">
                <Star size={14} />
                <span>Service Premium</span>
              </div>
            </div>
          </div>

          {/* Colonne 2: Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact</h4>
            
            <div className="space-y-3">
              <a 
                href={`tel:${phoneNumber}`}
                className="flex items-center space-x-3 hover:text-blue-400 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="font-medium">{phoneDisplay}</p>
                  <p className="text-gray-400 text-sm">Réservation immédiate</p>
                </div>
              </a>

              <a 
                href="mailto:contact@taxibordeauxsolution.fr"
                className="flex items-center space-x-3 hover:text-blue-400 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="font-medium">contact@taxibordeauxsolution.fr</p>
                  <p className="text-gray-400 text-sm">Réponse rapide</p>
                </div>
              </a>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-medium">Bordeaux et Gironde</p>
                  <p className="text-gray-400 text-sm">Zone de service étendue</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-medium">24h/24 - 7j/7</p>
                  <p className="text-gray-400 text-sm">Service continu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 3: Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Nos Services</h4>
            
            <ul className="space-y-2">
              <li>
                <Link href="/aeroport" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Transfert Aéroport Mérignac
                </Link>
              </li>
              <li>
                <Link href="/gare" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Transport Gare Saint-Jean
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Réservation */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Zones Desservies</h4>
            
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">
                <p className="font-medium text-white mb-1">Bordeaux Centre</p>
                <p>Chartrons, Bastide, Saint-Pierre, Victoire</p>
              </div>
              
              <div className="text-gray-300">
                <p className="font-medium text-white mb-1">Transports</p>
                <p>Aéroport Mérignac, Gare Saint-Jean</p>
              </div>
              
              <div className="text-gray-300">
                <p className="font-medium text-white mb-1">Gironde</p>
                <p>Pessac, Talence, Mérignac, Le Bouscat</p>
              </div>
            </div>

            {/* CTA Réservation */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Réservation Rapide</h5>
              <p className="text-sm text-blue-100 mb-3">
                Réservez votre taxi en quelques clics
              </p>
              <div className="space-y-2">
                <Link 
                  href="/#reservation"
                  className="block w-full bg-white text-blue-600 text-center py-2 px-4 rounded font-semibold hover:bg-blue-50 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/#reservation';
                  }}
                >
                  📝 Réserver en ligne
                </Link>
                <a 
                  href={`tel:${phoneNumber}`}
                  className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded font-semibold hover:bg-green-700 transition-colors"
                >
                  📞 {phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section légale */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <p className="text-gray-400 text-sm text-center">
            © {currentYear} Taxi Bordeaux Solution. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}