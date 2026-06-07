'use client'
import { useState } from 'react'
import { CopySimple, CheckCircle } from '@phosphor-icons/react'

export function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  return (
    <button
      onClick={copy}
      className={`relative p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 ${className}`}
      title="Copier"
    >
      <span className={`block transition-all duration-200 ${copied ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
        <CopySimple size={13} />
      </span>
      <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} text-green-500`}>
        <CheckCircle size={13} weight="bold" />
      </span>
    </button>
  )
}
