'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { CurrencyEur, Path, SignOut, House, ChartBar, Taxi, List, X, SquaresFour, UsersThree, PhoneCall, AddressBook, IdentificationCard, Moon, Sun } from '@phosphor-icons/react'
import { getToken } from '@/app/admin/lib/token'
import { ErrorBoundary } from '@/app/admin/components/ErrorBoundary'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const lastCountRef = useRef<number>(-1)

  useEffect(() => {
    const saved = localStorage.getItem('admin_dark_mode')
    if (saved === 'true') setDarkMode(true)
  }, [])

  // #21 — Notifications navigateur pour nouvelles réservations
  useEffect(() => {
    if (pathname === '/admin') return
    if (typeof window === 'undefined') return

    const requestPerm = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }
    }
    requestPerm()

    const poll = async () => {
      const token = getToken()
      if (!token) return
      try {
        const res = await fetch('/api/admin/reservations?status=en_attente&limit=1&page=1', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        if (!json.success) return
        const count: number = json.stats?.en_attente ?? 0
        const prev = lastCountRef.current
        if (prev >= 0 && count > prev && 'Notification' in window && Notification.permission === 'granted') {
          const diff = count - prev
          new Notification(`🚖 ${diff} nouvelle${diff > 1 ? 's' : ''} résa en attente`, {
            body: 'Cliquez pour ouvrir l\'admin',
            icon: '/favicon.ico',
            tag: 'admin-resa',
          })
        }
        lastCountRef.current = count
      } catch { /* silencieux */ }
    }

    poll()
    const interval = setInterval(poll, 30000)
    return () => clearInterval(interval)
  }, [pathname])

  const toggleDark = () => {
    setDarkMode(prev => {
      localStorage.setItem('admin_dark_mode', String(!prev))
      return !prev
    })
  }

  useEffect(() => {
    if (pathname === '/admin') {
      setReady(true)
      return
    }
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.replace('/admin')
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        sessionStorage.removeItem('admin_token')
        router.replace('/admin')
        return
      }
    } catch {
      sessionStorage.removeItem('admin_token')
      router.replace('/admin')
      return
    }
    setReady(true)
  }, [pathname, router])

  useEffect(() => {
    if (pathname === '/admin') return
    const origFetch = window.fetch
    const interceptor = (...args: Parameters<typeof fetch>) => {
      return origFetch(...args).then(res => {
        if (res.status === 401 && args[0]?.toString().includes('/api/admin/')) {
          sessionStorage.removeItem('admin_token')
          router.replace('/admin')
        }
        return res
      })
    }
    window.fetch = interceptor as typeof fetch
    return () => { window.fetch = origFetch }
  }, [pathname, router])

  const logout = () => {
    sessionStorage.removeItem('admin_token')
    router.push('/admin')
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  if (!ready) return null

  if (pathname === '/admin') return <>{children}</>

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <SquaresFour size={18} /> },
    { href: '/admin/prix', label: 'Prix', icon: <CurrencyEur size={18} /> },
    { href: '/admin/forfaits', label: 'Forfaits', icon: <Path size={18} /> },
    { href: '/admin/reservations', label: 'Résas', icon: <Taxi size={18} /> },
    { href: '/admin/estimations', label: 'Estimations', icon: <ChartBar size={18} /> },
    { href: '/admin/leads', label: 'Leads', icon: <PhoneCall size={18} /> },
    { href: '/admin/clients', label: 'Clients', icon: <AddressBook size={18} /> },
    { href: '/admin/users', label: 'Comptes', icon: <UsersThree size={18} /> },
    { href: '/admin/profil', label: 'Profil', icon: <IdentificationCard size={18} /> },
    { href: '/', label: 'Site', icon: <House size={18} /> },
  ]

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors${darkMode ? ' dark' : ''}`}>
      <nav className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 shadow-xl border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">Admin</span>
            <span className="text-slate-400 text-sm hidden sm:inline">Taxi Bordeaux</span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === link.href ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleDark}
              className="p-2 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-slate-700 transition-colors"
            >
              <SignOut size={18} />
              Déconnexion
            </button>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              {menuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-700 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === link.href ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-slate-700 transition-colors text-left"
            >
              <SignOut size={18} />
              Déconnexion
            </button>
          </div>
        )}
      </nav>

      <main className="p-4 sm:p-6 max-w-5xl mx-auto">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  )
}
