'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Phone, Menu, X, Calendar, PhoneCall, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname?.startsWith('/admin')

  const goToReservation = () => {
    if (pathname === '/') {
      const el = document.getElementById('reservation') || document.getElementById('reservation-mobile')
      el?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push('/booking')
    }
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastScrollY = useRef(0)

  const phoneNumber = "+33554543466"
  const phoneDisplay = "+33 5 54 54 34 66"

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Contact', href: '/contact' },
  ]

  const servicesMenu = [
    { name: 'Taxi Aéroport', href: '/aeroport' },
    { name: 'Taxi Gare', href: '/gare' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 20)
      if (currentY > lastScrollY.current && currentY > 80) {
        setServicesDropdownOpen(false)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (isAdmin) return null

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'lg:pt-2 lg:px-8' : 'lg:pt-3 lg:px-12'
      }`}
    >
      <div
        className={`transition-all duration-300 lg:max-w-5xl lg:mx-auto ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg lg:rounded-2xl border border-white/40'
            : 'bg-white/95 backdrop-blur-md shadow-md lg:rounded-2xl border border-gray-100/50'
        }`}
      >
        <div className="px-4 lg:px-6 py-3 lg:py-2.5">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 group">
              <div className="w-11 h-11 lg:w-10 lg:h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-200">
                <Image
                  src="/images/logo/Logo Taxi Bordeaux Solution.png.png"
                  alt="Logo Taxi Bordeaux Solution"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-lg lg:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                  Taxi Bordeaux
                </div>
              </div>
            </Link>

            {/* Nav Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-[15px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Services Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setServicesDropdownOpen(true)}
                onMouseLeave={() => setServicesDropdownOpen(false)}
              >
                <button
                  className={`text-[15px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                    pathname === '/aeroport' || pathname === '/gare'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Services
                  <ChevronDown size={14} className={`transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`absolute top-full left-0 pt-2 w-44 transition-all duration-200 ${
                  servicesDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}>
                  <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100/50 py-1 overflow-hidden">
                    {servicesMenu.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        className={`block px-4 py-2.5 text-[15px] transition-colors ${
                          pathname === service.href
                            ? 'text-blue-600 bg-blue-50 font-medium'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* Actions Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={goToReservation}
                className="text-[15px] font-semibold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                Réserver
              </button>
              <a
                href={`tel:${phoneNumber}`}
                className="text-[15px] font-semibold px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Phone size={15} />
                <span className="hidden xl:inline">{phoneDisplay}</span>
                <span className="xl:hidden">Appeler</span>
              </a>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex items-center gap-2.5">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

          </div>
        </div>

        {/* Menu Mobile */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="px-4 pb-4 pt-2 border-t border-gray-100/50">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block text-base font-medium px-3 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Services
              </div>
              {servicesMenu.map((service) => (
                <Link
                  key={service.name}
                  href={service.href}
                  className={`block text-base font-medium px-3 py-3 rounded-lg transition-colors ${
                    pathname === service.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {service.name}
                </Link>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100/50 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { setMobileMenuOpen(false); goToReservation() }}
                className="text-base font-semibold text-center px-3 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar size={17} />
                Réserver
              </button>
              <a
                href={`tel:${phoneNumber}`}
                className="text-base font-semibold text-center px-3 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PhoneCall size={17} />
                Appeler
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>

    {/* Barre fixe mobile — toujours visible en bas d'écran */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-2 gap-2 px-3 py-2.5">
        <a
          href={`tel:${phoneNumber}`}
          className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold text-sm py-3 rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm"
        >
          <Phone size={18} />
          {phoneDisplay}
        </a>
        <button
          onClick={goToReservation}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold text-sm py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm cursor-pointer"
        >
          <Calendar size={18} />
          Réserver en ligne
        </button>
      </div>
    </div>
  </>
  )
}
