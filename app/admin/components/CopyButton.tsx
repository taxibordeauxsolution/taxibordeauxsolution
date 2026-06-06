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
      className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ${className}`}
      title="Copier"
    >
      {copied
        ? <CheckCircle size={13} weight="bold" className="text-green-500" />
        : <CopySimple size={13} />}
    </button>
  )
}
