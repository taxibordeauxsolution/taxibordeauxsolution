'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function WhatsAppButton() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const phone = '33667237822'
  const message = encodeURIComponent('Bonjour, je souhaite réserver un taxi.')
  const url = `https://wa.me/${phone}?text=${message}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-[#1ebe5d] transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
      style={{ transition: 'opacity 0.4s ease, transform 0.4s ease, background-color 0.2s ease' }}
    >
      {/* Icône WhatsApp */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-6 h-6 shrink-0 fill-white"
      >
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.83 1.782 6.86L2 30l7.34-1.742A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.54 11.54 0 0 1-5.89-1.61l-.42-.25-4.35 1.03 1.07-4.24-.28-.44A11.56 11.56 0 0 1 4.4 16C4.4 9.6 9.6 4.4 16 4.4S27.6 9.6 27.6 16 22.4 27.6 16 27.6zm6.34-8.64c-.35-.17-2.06-1.01-2.38-1.13-.32-.12-.55-.17-.78.17-.23.35-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.17-1.48-.55-2.82-1.74-1.04-.93-1.74-2.08-1.95-2.43-.2-.35-.02-.54.15-.71.16-.16.35-.4.52-.6.17-.2.23-.35.35-.58.12-.23.06-.43-.03-.6-.09-.17-.78-1.88-1.07-2.57-.28-.67-.57-.58-.78-.59h-.67c-.23 0-.6.09-.91.43-.32.35-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.66.29-.82.29-1.52.2-1.66-.08-.15-.3-.23-.65-.4z" />
      </svg>
      <span className="font-semibold text-sm whitespace-nowrap">Nous écrire</span>
    </a>
  )
}
