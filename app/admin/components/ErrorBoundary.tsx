'use client'
import { Component, ErrorInfo, ReactNode } from 'react'
import { ArrowClockwise, Warning } from '@phosphor-icons/react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Admin error boundary:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-6 max-w-md text-center space-y-3">
            <Warning size={36} weight="bold" className="text-red-500 mx-auto" />
            <p className="text-red-700 dark:text-red-400 font-semibold">Une erreur inattendue s'est produite</p>
            {this.state.error && (
              <p className="text-xs text-red-500 dark:text-red-500 font-mono break-all">{this.state.error.message}</p>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              <ArrowClockwise size={16} /> Réessayer
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
