"use client"

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'

export function AuthProvider({ children }) {
  const { initializeAuth, isLoading } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      await initializeAuth()
      setIsInitialized(true)
    }
    init()
  }, [initializeAuth])

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-zinc-500">Initializing...</p>
        </div>
      </div>
    )
  }

  return children
}