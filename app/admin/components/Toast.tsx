'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle, XCircle, Warning, Info, X } from '@phosphor-icons/react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem { id: string; type: ToastType; message: string }
interface ToastCtx  { toast: (msg: string, type?: ToastType) => void }

const Ctx = createContext<ToastCtx>({ toast: () => {} })

export function useToast() { return useContext(Ctx) }

const CFG = {
  success: { Icon: CheckCircle, wrap: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-200', icon: 'text-green-500' },
  error:   { Icon: XCircle,     wrap: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',         text: 'text-red-800 dark:text-red-200',     icon: 'text-red-500'   },
  warning: { Icon: Warning,     wrap: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-200', icon: 'text-amber-500' },
  info:    { Icon: Info,        wrap: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',     text: 'text-blue-800 dark:text-blue-200',   icon: 'text-blue-500'  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const remove = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = String(++idRef.current)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-xs sm:max-w-sm pointer-events-none">
        {toasts.map(({ id, type, message }) => {
          const { Icon, wrap, text, icon } = CFG[type]
          return (
            <div key={id} className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-toast-in ${wrap} ${text}`}>
              <Icon size={18} weight="bold" className={`shrink-0 mt-0.5 ${icon}`} />
              <span className="flex-1 leading-snug">{message}</span>
              <button onClick={() => remove(id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity ml-1">
                <X size={14} weight="bold" />
              </button>
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}
