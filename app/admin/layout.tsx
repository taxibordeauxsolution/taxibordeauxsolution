'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { CurrencyEur, Path, SignOut, House, ChartBar, Taxi } from '@phosphor-icons/react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Page login elle-même : pas de vérification
    if (pathname === '/admin') {
      setReady(true)
      return
    }
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.replace('/admin')
    } else {
      setReady(true)
    }
  }, [pathname, router])

  const logout = () => {
    sessionStorage.removeItem('admin_token')
    router.push('/admin')
  }

  if (!ready) return null

  // Page login : pas de navbar
  if (pathname === '/admin') return <>{children}</>

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar admin */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">Admin</span>
          <span className="text-slate-400 text-sm">Taxi Bordeaux</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/prix"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              pathname === '/admin/prix' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CurrencyEur size={18} />
            Prix
          </Link>
          <Link
            href="/admin/forfaits"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              pathname === '/admin/forfaits' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Path size={18} />
            Forfaits
          </Link>
          <Link
            href="/admin/reservations"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              pathname === '/admin/reservations' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Taxi size={18} />
            Résas
          </Link>
          <Link
            href="/admin/estimations"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              pathname === '/admin/estimations' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ChartBar size={18} />
            Estimations
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <House size={18} />
            Site
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-slate-700 transition-colors"
          >
            <SignOut size={18} />
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  )
}
