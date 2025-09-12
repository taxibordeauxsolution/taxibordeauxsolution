'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Phone, Menu, X, MapPin, Car, Calendar, PhoneCall, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)

  const phoneNumber = "0667237822"
  const phoneDisplay = "06 67 23 78 22"

  const navigation = [
    { name: 'Accueil', href: '/', current: pathname === '/' },
    { name: 'Contact', href: '/contact', current: pathname === '/contact' },
  ]

  const servicesMenu = [
    { name: 'Taxi Aéroport', href: '/aeroport', icon: '✈️', description: 'Service aéroport Bordeaux-Mérignac' },
    { name: 'Taxi Gare', href: '/gare', icon: '🚂', description: 'Service gare Saint-Jean' },
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
              >
                {item.name}
              </Link>
            ))}
            
            {/* Services Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setServicesDropdownOpen(true)}
                onMouseLeave={() => setServicesDropdownOpen(false)}
                className={`font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                  pathname === '/aeroport' || pathname === '/gare'
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Services
                <ChevronDown size={16} className={`transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {servicesDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  onMouseEnter={() => setServicesDropdownOpen(true)}
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                >
                  {servicesMenu.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {service.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Actions Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/#reservation"
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                if (pathname === '/') {
                  document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#reservation';
                }
              }}
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Services Mobile */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Nos Services
                </div>
                {servicesMenu.map((service) => (
                  <Link
                    key={service.name}
                    href={service.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === service.href
                        ? 'text-blue-600 bg-blue-50 font-semibold'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-xl">{service.icon}</span>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-xs text-gray-500">{service.description}</div>
                    </div>
                  </Link>
                ))}
              
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <Link
                  href="/#reservation"
                  className="block w-full bg-green-600 text-white text-center px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    if (pathname === '/') {
                      setTimeout(() => {
                        document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      window.location.href = '/#reservation';
                    }
                  }}
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