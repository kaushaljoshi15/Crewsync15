'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange, User } from '@/lib/auth'

interface AuthContextType {
  user: (User & { role?: string }) | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { role?: string }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        // User role should be fetched from your own database
        console.log('[AuthProvider] User logged in:', authUser.uid)
        setUser(authUser)
      } else {
        console.log('[AuthProvider] No user logged in')
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
} 