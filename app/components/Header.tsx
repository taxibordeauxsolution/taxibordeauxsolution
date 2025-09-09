'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Phone, Menu, X, MapPin, Car, Calendar, PhoneCall } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const phoneNumber = "0667237822"
  const phoneDisplay = "06 67 23 78 22"

  const navigation = [
    { name: 'Accueil', href: '/', current: pathname === '/' },
    { name: 'Services', href: '#services', current: false },
    { name: 'Aéroport', href: '/aeroport', current: pathname === '/aeroport' },
    { name: 'Contact', href: '/contact', current: pathname === '/contact' },
  ]

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* Logo et Nom */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-200">
              <Image 
                src="/images/logo/Logo Taxi Bordeaux Solution.png.png" 
                alt="Logo Taxi Bordeaux Solution" 
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Taxi Bordeaux Solution
              </h1>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                <MapPin size={14} className="text-blue-600" />
                <span>Service 24h/24 - 7j/7</span>
              </div>
            </div>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                  item.current
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (item.href.startsWith('#')) {
                    setTimeout(() => {
                      const element = document.querySelector(item.href)
                      element?.scrollIntoView({ behavior: 'smooth' })
                    }, 100)
                  }
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/contact"
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Réserver
            </Link>
            
            <a
              href={`tel:${phoneNumber}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Phone size={18} />
              <span className="hidden xl:inline">{phoneDisplay}</span>
              <span className="xl:hidden">Appeler</span>
            </a>
          </div>

          {/* Menu Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href={`tel:${phoneNumber}`}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Phone size={20} />
            </a>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <nav className="space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block font-medium px-4 py-3 rounded-lg transition-colors ${
                    item.current
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    if (item.href.startsWith('#')) {
                      setTimeout(() => {
                        document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
                      }, 100)
                    }
                  }}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <Link
                  href="/contact"
                  className="block w-full bg-green-600 text-white text-center px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="w-4 h-4" />
                  Réserver en Ligne
                </Link>
                
                <a
                  href={`tel:${phoneNumber}`}
                  className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PhoneCall className="w-4 h-4" />
                  Appeler {phoneDisplay}
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}